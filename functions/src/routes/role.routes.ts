import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';

const router = Router();
const roleController = new RoleController();

// Role management
router.post('/', (req, res) => roleController.createRole(req, res));
router.get('/', (req, res) => roleController.getAllRoles(req, res));
router.get('/:id', (req, res) => roleController.getRole(req, res));
router.put('/:id', (req, res) => roleController.updateRole(req, res));
router.delete('/:id', (req, res) => roleController.deleteRole(req, res));

// User role management - simplified URLs
router.get('/users/:userId', (req, res) => roleController.getUserRoles(req, res));
router.post('/users/:userId', (req, res) => roleController.assignRolesToUser(req, res));
router.get('/users/:userId/permissions', (req, res) => roleController.getUserPermissions(req, res));

export default router; 
