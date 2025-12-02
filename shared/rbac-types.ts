export interface Permission {
  id: string;
  name: string;
  key: string; // e.g., 'create:content'
  description: string;
  category: string;
  policyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  policyId: string;
  parentRoleId?: string | null;
  permissions: string[]; // permission IDs
  level: number;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  roles: string[]; // role IDs
  permissions: string[]; // permission IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleIds: string[]; // role IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface RBACState {
  users: User[];
  roles: Role[];
  policies: Policy[];
  permissions: Permission[];
  currentUserId: string | null;
}

export interface RBACContextType {
  // State
  state: RBACState;
  currentUser: User | null;
  users: User[];
  roles: Role[];
  policies: Policy[];
  permissions: Permission[];
  loading: boolean;
  error: string | null;

  // Queries
  can: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  hasAllRoles: (roleNames: string[]) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  getUserPermissions: (userId: string) => Permission[];
  getRolePermissions: (roleId: string) => Permission[];
  getRolesByPolicy: (policyId: string) => Role[];
  getPermissionsByPolicy: (policyId: string) => Permission[];
  getUserRoles: (userId: string) => Role[];
  getRoleChildren: (roleId: string) => Role[];
  getRoleParent: (roleId: string) => Role | null;

  // Mutations
  setCurrentUser: (userId: string) => void;
  createPolicy: (policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePolicy: (id: string, updates: Partial<Policy>) => void;
  deletePolicy: (id: string) => void;
  createRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  createPermission: (permission: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePermission: (id: string, updates: Partial<Permission>) => void;
  deletePermission: (id: string) => void;
  assignRoleToUser: (userId: string, roleId: string) => void;
  removeRoleFromUser: (userId: string, roleId: string) => void;
  assignPermissionToRole: (roleId: string, permissionId: string) => void;
  removePermissionFromRole: (roleId: string, permissionId: string) => void;
}