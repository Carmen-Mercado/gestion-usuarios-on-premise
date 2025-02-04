export interface RoleV1 {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleV1Dto {
  name: string;
  permissions: string[];
} 