import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';
import { createSuccessResponse, createErrorResponse } from '../utils/response.util';
import { ApiVersion } from '../utils/version.util';

export class RoleController {
  protected roleService: RoleService;

  constructor(version: ApiVersion = 'v1') {
    this.roleService = new RoleService(version);
  }

  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const role = await this.roleService.createRole(req.body);
      const location = `${req.protocol}://${req.get('host')}/roles/${role.id}`;
      
      res.setHeader('Location', location);
      res.status(201).json(createSuccessResponse(
        role,
        'created',
        { href: location }
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create role';
      
      if (errorMessage.includes('already taken')) {
        res.status(409).json(createErrorResponse(errorMessage));
        return;
      }

      res.status(500).json(createErrorResponse(
        'Failed to create role',
        errorMessage
      ));
    }
  }

  async getRole(req: Request, res: Response): Promise<void> {
    try {
      const role = await this.roleService.getRole(req.params.id);
      if (!role) {
        res.status(404).json(createErrorResponse('Role not found'));
        return;
      }
      const location = `${req.protocol}://${req.get('host')}/roles/${role.id}`;
      res.json(createSuccessResponse(role, 'success', { href: location }));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        'Failed to retrieve role',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }

  async getAllRoles(req: Request, res: Response): Promise<void> {
    try {
      const roles = await this.roleService.getAllRoles();
      const location = `${req.protocol}://${req.get('host')}/roles`;
      res.json(createSuccessResponse(
        {
          items: roles,
          count: roles.length
        },
        'success',
        { href: location }
      ));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        'Failed to retrieve roles',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }

  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const role = await this.roleService.updateRole(req.params.id, req.body);
      const location = `${req.protocol}://${req.get('host')}/roles/${role.id}`;
      
      res.json(createSuccessResponse(
        role,
        'updated',
        { href: location }
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update role';
      
      if (errorMessage === 'Role not found') {
        res.status(404).json(createErrorResponse('Role not found'));
        return;
      }

      if (errorMessage.includes('already taken')) {
        res.status(409).json(createErrorResponse(errorMessage));
        return;
      }

      res.status(500).json(createErrorResponse(
        'Failed to update role',
        errorMessage
      ));
    }
  }

  async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await this.roleService.deleteRole(req.params.id);
      if (!deleted) {
        res.status(404).json(createErrorResponse('Role not found'));
        return;
      }
      
      res.status(200).json(createSuccessResponse(
        {
          message: 'Role deleted successfully'
        },
        'deleted'
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('still assigned to users')) {
        res.status(409).json(createErrorResponse(errorMessage));
        return;
      }

      res.status(500).json(createErrorResponse(
        'Failed to delete role',
        errorMessage
      ));
    }
  }

  async assignRolesToUser(req: Request, res: Response): Promise<void> {
    try {
      const { roles } = req.body;
      
      if (!Array.isArray(roles)) {
        res.status(400).json(createErrorResponse(
          'Invalid request',
          'roles must be an array of strings'
        ));
        return;
      }

      await this.roleService.assignRolesToUserByNames(req.params.userId, roles);
      const assignedRoles = await this.roleService.getUserRoles(req.params.userId);
      
      res.json(createSuccessResponse(
        {
          message: 'Roles assigned successfully',
          roles: assignedRoles
        },
        'updated'
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('Roles not found')) {
        res.status(404).json(createErrorResponse(
          'One or more roles not found',
          errorMessage
        ));
        return;
      }

      res.status(500).json(createErrorResponse(
        'Failed to assign roles',
        errorMessage
      ));
    }
  }

  async getUserRoles(req: Request, res: Response): Promise<void> {
    try {
      const roles = await this.roleService.getUserRoles(req.params.userId);
      res.json(createSuccessResponse(
        {
          items: roles,
          count: roles.length
        },
        'success'
      ));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        'Failed to retrieve user roles',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }

  async getUserPermissions(req: Request, res: Response): Promise<void> {
    try {
      const permissions = await this.roleService.getUserPermissions(req.params.userId);
      res.json(createSuccessResponse(
        {
          permissions,
          count: permissions.length
        },
        'success'
      ));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        'Failed to retrieve user permissions',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }
} 
