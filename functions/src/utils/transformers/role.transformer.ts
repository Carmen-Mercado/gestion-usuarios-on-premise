import { RoleV1 } from '../../models/versions/v1/role.model';
import { RoleV2 } from '../../models/versions/v2/role.model';
import { ApiVersion } from '../version.util';

export class RoleTransformer {
  static toV1(role: RoleV2): RoleV1 {
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    };
  }

  static toV2(role: RoleV1): RoleV2 {
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      version: 1,
      description: undefined,
      metadata: {}
    };
  }

  static transform(role: RoleV1 | RoleV2, targetVersion: ApiVersion): RoleV1 | RoleV2 {
    if (targetVersion === 'v1') {
      return this.toV1(role as RoleV2);
    }
    return this.toV2(role as RoleV1);
  }
} 