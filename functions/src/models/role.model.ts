export type Permission = 
  | 'create_user'
  | 'read_user'
  | 'update_user'
  | 'delete_user'
  | 'assign_roles'
  | 'manage_roles';

export const AVAILABLE_PERMISSIONS: Permission[] = [
  'create_user',
  'read_user',
  'update_user',
  'delete_user',
  'assign_roles',
  'manage_roles'
];

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  permissions: Permission[];
}

export interface UpdateRoleDto {
  name?: string;
  permissions?: Permission[];
}

// Update User model to include roles
export interface UserRole {
  userId: string;
  roleIds: string[];
} 
