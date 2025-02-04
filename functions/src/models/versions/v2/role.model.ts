export interface RoleV2 {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreateRoleV2Dto {
  name: string;
  permissions: string[];
  description?: string;
  metadata?: Record<string, unknown>;
} 