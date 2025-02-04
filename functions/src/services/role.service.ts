import { db } from '../config/firebase';
import { Role, CreateRoleDto, UpdateRoleDto, Permission, AVAILABLE_PERMISSIONS } from '../models/role.model';
import { CreateRoleV2Dto } from '../models/versions/v2/role.model';
import { ApiVersion } from '../utils/version.util';
import { RoleTransformer } from '../utils/transformers/role.transformer';

export class RoleService {
  private readonly rolesRef = db.ref('roles');
  private readonly userRolesRef = db.ref('user_roles');
  private version: ApiVersion;

  constructor(version: ApiVersion = 'v2') {
    this.version = version;
  }

  private transformResponse<T>(data: any): T {
    return RoleTransformer.transform(data, this.version) as T;
  }

  private validatePermissions(permissions: Permission[]): void {
    const invalidPermissions = permissions.filter(
      permission => !AVAILABLE_PERMISSIONS.includes(permission)
    );
    
    if (invalidPermissions.length > 0) {
      throw new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`);
    }

    if (new Set(permissions).size !== permissions.length) {
      throw new Error('Duplicate permissions are not allowed');
    }
  }

  private async isRoleNameTaken(name: string, excludeRoleId?: string): Promise<boolean> {
    const snapshot = await this.rolesRef
      .orderByChild('name')
      .equalTo(name)
      .once('value');

    if (!snapshot.exists()) {
      return false;
    }

    if (excludeRoleId) {
      let isNameTaken = false;
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.key !== excludeRoleId) {
          isNameTaken = true;
        }
      });
      return isNameTaken;
    }

    return true;
  }

  async createRole(createRoleDto: CreateRoleDto | CreateRoleV2Dto): Promise<Role> {
    try {
      if (!createRoleDto.name) {
        throw new Error('Role name is required');
      }

      if (!createRoleDto.permissions?.length) {
        throw new Error('Role must have at least one permission');
      }

      this.validatePermissions(createRoleDto.permissions as Permission[]);

      const isNameTaken = await this.isRoleNameTaken(createRoleDto.name);
      if (isNameTaken) {
        throw new Error('Role name is already taken');
      }

      const newRoleRef = this.rolesRef.push();
      const now = new Date().toISOString();

      const baseRole = {
        id: newRoleRef.key!,
        name: createRoleDto.name,
        permissions: createRoleDto.permissions,
        createdAt: now,
        updatedAt: now,
      };

      const role = this.version === 'v2' 
        ? {
            ...baseRole,
            version: 1,
            description: (createRoleDto as CreateRoleV2Dto).description,
            metadata: (createRoleDto as CreateRoleV2Dto).metadata || {}
          }
        : baseRole;

      await newRoleRef.set(role);
      return this.transformResponse(role);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create role');
    }
  }

  async getRole(id: string): Promise<Role | null> {
    const snapshot = await this.rolesRef.child(id).get();
    if (!snapshot.exists()) {
      return null;
    }
    return this.transformResponse(snapshot.val());
  }

  async getAllRoles(): Promise<Role[]> {
    try {
      const snapshot = await this.rolesRef.once('value');
      const roles: Role[] = [];

      snapshot.forEach((childSnapshot) => {
        roles.push({
          id: childSnapshot.key!,
          ...childSnapshot.val()
        });
      });

      return roles;
    } catch (error) {
      throw new Error('Failed to fetch roles');
    }
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    try {
      const roleRef = this.rolesRef.child(id);
      const snapshot = await roleRef.get();

      if (!snapshot.exists()) {
        throw new Error('Role not found');
      }

      if (updateRoleDto.name) {
        const isNameTaken = await this.isRoleNameTaken(updateRoleDto.name, id);
        if (isNameTaken) {
          throw new Error('Role name is already taken');
        }
      }

      if (updateRoleDto.permissions) {
        if (updateRoleDto.permissions.length === 0) {
          throw new Error('Role must have at least one permission');
        }
        this.validatePermissions(updateRoleDto.permissions);
      }

      const currentRole = snapshot.val();
      const updatedRole: Role = {
        ...currentRole,
        ...updateRoleDto,
        id,
        updatedAt: new Date().toISOString(),
      };

      await roleRef.update(updatedRole);
      return this.transformResponse(updatedRole);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update role');
    }
  }

  async deleteRole(id: string): Promise<boolean> {
    try {
      const roleRef = this.rolesRef.child(id);
      const snapshot = await roleRef.get();

      if (!snapshot.exists()) {
        return false;
      }

      // Check if role is assigned to any users
      const userRolesSnapshot = await this.userRolesRef
        .orderByChild('roleIds')
        .equalTo(id)
        .once('value');

      if (userRolesSnapshot.exists()) {
        throw new Error('Cannot delete role: it is still assigned to users');
      }

      await roleRef.remove();
      return true;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete role');
    }
  }

  async getRoleByName(name: string): Promise<Role | null> {
    try {
      const snapshot = await this.rolesRef
        .orderByChild('name')
        .equalTo(name)
        .once('value');
      
      if (!snapshot.exists()) {
        return null;
      }

      // Get the first (and should be only) role with this name
      let role: Role | null = null;
      snapshot.forEach((childSnapshot) => {
        role = {
          id: childSnapshot.key!,
          ...childSnapshot.val()
        };
        return true; // Break the forEach loop
      });

      return role;
    } catch (error) {
      throw new Error('Failed to fetch role by name');
    }
  }

  async assignRolesToUserByNames(userId: string, roleNames: string[]): Promise<void> {
    try {
      if (!roleNames.length) {
        throw new Error('User must have at least one role');
      }

      // Get roles by names
      const rolePromises = roleNames.map((name: string) => this.getRoleByName(name));
      const roles = await Promise.all(rolePromises);

      if (roles.some(role => role === null)) {
        const invalidRoles = roleNames.filter((name, index) => roles[index] === null);
        throw new Error(`Roles not found: ${invalidRoles.join(', ')}`);
      }

      // Extract role IDs from the found roles
      const roleIds = roles.map(role => role!.id);

      await this.userRolesRef.child(userId).set({
        userId,
        roleIds,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to assign roles');
    }
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const userRolesSnapshot = await this.userRolesRef.child(userId).get();
      
      if (!userRolesSnapshot.exists()) {
        return [];
      }

      const { roleIds } = userRolesSnapshot.val();
      const rolePromises = roleIds.map((roleId: string) => this.getRole(roleId));
      const roles = await Promise.all(rolePromises);

      return roles.filter((role): role is Role => role !== null);
    } catch (error) {
      throw new Error('Failed to fetch user roles');
    }
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const roles = await this.getUserRoles(userId);
      const permissions = new Set<Permission>();

      roles.forEach(role => {
        role.permissions.forEach(permission => {
          permissions.add(permission);
        });
      });

      return Array.from(permissions);
    } catch (error) {
      throw new Error('Failed to fetch user permissions');
    }
  }
} 
