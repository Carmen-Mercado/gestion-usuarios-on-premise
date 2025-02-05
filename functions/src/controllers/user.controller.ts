import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { createSuccessResponse, createErrorResponse, createPaginatedResponse } from '../utils/response.util';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.createUser(req.body);
      const location = `${req.protocol}://${req.get('host')}/users/${user.id}`;
      
      res.setHeader('Location', location);
      res.status(201).json(createSuccessResponse(
        user,
        'created',
        { href: location }
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      
      // Handle duplicate email error specifically
      if (errorMessage === 'Email is already in use') {
        res.status(409).json(createErrorResponse(
          'Email is already in use',
          'Please use a different email address'
        ));
        return;
      }

      res.status(500).json(createErrorResponse(
        'Failed to create user',
        errorMessage
      ));
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.getUser(req.params.id);
      if (!user) {
        res.status(404).json(createErrorResponse('User not found'));
        return;
      }
      const location = `${req.protocol}://${req.get('host')}/users/${user.id}`;
      res.json(createSuccessResponse(user, 'success', { href: location }));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        'Failed to retrieve user',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      // Get pagination parameters from query string
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      // Calculate skip and limit for pagination
      const skip = (page - 1) * pageSize;

      // Get total count and paginated users
      const [users, totalItems] = await Promise.all([
        this.userService.getAllUsers(skip, pageSize),
        this.userService.getUserCount()
      ]);

      const baseUrl = `${req.protocol}://${req.get('host')}/users`;
      
      res.json(createPaginatedResponse(
        users,
        page,
        pageSize,
        totalItems,
        baseUrl
      ));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        'Failed to retrieve users',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      const location = `${req.protocol}://${req.get('host')}/users/${user.id}`;
      
      res.json(createSuccessResponse(
        user,
        'updated',
        { href: location }
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      
      if (errorMessage === 'User not found') {
        res.status(404).json(createErrorResponse('User not found'));
        return;
      }

      if (errorMessage === 'Email is already in use') {
        res.status(409).json(createErrorResponse(
          'Email is already in use',
          'Please use a different email address'
        ));
        return;
      }

      res.status(500).json(createErrorResponse(
        'Failed to update user',
        errorMessage
      ));
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const deletedUser = await this.userService.deleteUser(req.params.id);
      if (!deletedUser) {
        res.status(404).json(createErrorResponse('User not found'));
        return;
      }
      
      res.status(200).json(createSuccessResponse(
        {
          message: 'User deactivated successfully',
          user: deletedUser
        },
        'deactivated'
      ));
    } catch (error) {
      res.status(500).json(createErrorResponse(
        'Failed to deactivate user',
        error instanceof Error ? error.message : 'Unknown error'
      ));
    }
  }
}

