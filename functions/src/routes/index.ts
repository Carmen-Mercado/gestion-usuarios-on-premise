import { Router, Request, Response, NextFunction } from 'express';
import { isVersionSupported, getLatestVersion, SUPPORTED_VERSIONS } from '../utils/version.util';
import roleRoutesV1 from './v1/role.routes';
import roleRoutesV2 from './v2/role.routes';

const router = Router();

// Add type declaration for request with apiVersion
declare module 'express-serve-static-core' {
  interface Request {
    apiVersion?: string;
  }
}

// Version middleware
const versionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const version = req.params.version || getLatestVersion();
  
  if (!isVersionSupported(version)) {
    res.status(400).json({
      error: 'Unsupported API version',
      supportedVersions: SUPPORTED_VERSIONS.filter(v => v.isActive).map(v => v.version)
    });
    return;
  }

  req.apiVersion = version;
  next();
};

// Add logging
console.log('Registering routes:');
console.log('- /v1/roles');
console.log('- /v2/roles');
console.log('- /roles (default)');

// Version-specific routes
router.use('/v1/roles', versionMiddleware, (req, res, next) => {
  console.log('V1 route hit:', req.path);
  return roleRoutesV1(req, res, next);
});

router.use('/v2/roles', versionMiddleware, (req, res, next) => {
  console.log('V2 route hit:', req.path);
  return roleRoutesV2(req, res, next);
});

// Default to latest version
router.use('/roles', versionMiddleware, (req, res, next) => {
  console.log('Default route hit:', req.path);
  return roleRoutesV2(req, res, next);
});

export default router; 