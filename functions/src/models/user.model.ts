export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'inactive';
}
