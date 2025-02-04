import { Request, Response } from 'express';
import { RoleController } from '../role.controller';
import { CreateRoleV2Dto } from '../../models/versions/v2/role.model';
import { createSuccessResponse, createErrorResponse } from '../../utils/response.util';

export class RoleControllerV2 extends RoleController {
  constructor() {
    super('v2');
  }

  // Override methods that need version-specific handling
  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const roleDto: CreateRoleV2Dto = {
        ...req.body,
        metadata: req.body?.metadata || {}
      };

      const role = await this.roleService.createRole(roleDto);
      const location = `${req.protocol}://${req.get('host')}/v2/roles/${role.id}`;
      
      res.setHeader('Location', location);
      res.status(201).json(createSuccessResponse(
        role,
        'created',
        { href: location }
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json(createErrorResponse(
        'Failed to create role',
        errorMessage
      ));
    }
  }
} 