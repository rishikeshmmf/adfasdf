import { User, Role, Permission, Policy, RBACState } from '@shared/rbac-types';

export class RBACEngine {
  private state: RBACState;

  constructor(state: RBACState) {
    this.state = state;
  }

  /**
   * Check if user has a specific permission
   */
  canUser(user: User | null, permission: string): boolean {
    if (!user) return false;
    const userPermissions = this.getUserPermissions(user.id);
    return userPermissions.some(p => p.key === permission);
  }

  /**
   * Check if user has a specific role
   */
  userHasRole(user: User | null, roleName: string): boolean {
    if (!user) return false;
    const userRoles = this.getUserRoles(user.id);
    return userRoles.some(r => r.name === roleName);
  }

  /**
   * Check if user has all roles
   */
  hasAllRoles(user: User | null, roleNames: string[]): boolean {
    if (!user) return false;
    return roleNames.every(roleName => this.userHasRole(user, roleName));
  }

  /**
   * Check if user has any of the roles
   */
  hasAnyRole(user: User | null, roleNames: string[]): boolean {
    if (!user) return false;
    return roleNames.some(roleName => this.userHasRole(user, roleName));
  }

  /**
   * Get all permissions for a user (including inherited from roles)
   */
  getUserPermissions(userId: string): Permission[] {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return [];

    const permissions = new Set<string>();
    const processedRoles = new Set<string>();

    const addPermissionsFromRole = (roleId: string) => {
      if (processedRoles.has(roleId)) return; // Prevent infinite loops
      processedRoles.add(roleId);

      const role = this.state.roles.find(r => r.id === roleId);
      if (!role) return;

      // Add permissions from this role
      role.permissions.forEach(permId => permissions.add(permId));

      // Recursively add permissions from parent role
      if (role.parentRoleId) {
        addPermissionsFromRole(role.parentRoleId);
      }
    };

    // Process all roles assigned to user
    user.roleIds.forEach(roleId => addPermissionsFromRole(roleId));

    return Array.from(permissions).map(
      permId => this.state.permissions.find(p => p.id === permId)!
    ).filter(Boolean);
  }

  /**
   * Get all roles for a user
   */
  getUserRoles(userId: string): Role[] {
    const user = this.state.users.find(u => u.id === userId);
    if (!user) return [];
    return user.roleIds
      .map(roleId => this.state.roles.find(r => r.id === roleId))
      .filter(Boolean) as Role[];
  }

  /**
   * Get permissions assigned to a role (including inherited)
   */
  getRolePermissions(roleId: string, includeInherited = true): Permission[] {
    const role = this.state.roles.find(r => r.id === roleId);
    if (!role) return [];

    const permissions = new Set<string>(role.permissions);

    if (includeInherited && role.parentRoleId) {
      const parentPermissions = this.getRolePermissions(role.parentRoleId, true);
      parentPermissions.forEach(p => permissions.add(p.id));
    }

    return Array.from(permissions)
      .map(permId => this.state.permissions.find(p => p.id === permId))
      .filter(Boolean) as Permission[];
  }

  /**
   * Get roles by policy
   */
  getRolesByPolicy(policyId: string): Role[] {
    return this.state.roles.filter(r => r.policyId === policyId);
  }

  /**
   * Get permissions by policy
   */
  getPermissionsByPolicy(policyId: string): Permission[] {
    return this.state.permissions.filter(p => p.policyId === policyId);
  }

  /**
   * Get child roles for a parent role
   */
  getRoleChildren(roleId: string): Role[] {
    return this.state.roles.filter(r => r.parentRoleId === roleId);
  }

  /**
   * Get parent role
   */
  getRoleParent(roleId: string): Role | null {
    const role = this.state.roles.find(r => r.id === roleId);
    if (!role || !role.parentRoleId) return null;
    return this.state.roles.find(r => r.id === role.parentRoleId) || null;
  }

  /**
   * Get full role hierarchy tree
   */
  getRoleHierarchyTree(policyId: string): Role[] {
    const policyRoles = this.getRolesByPolicy(policyId);
    // Return only root roles (no parent)
    return policyRoles.filter(r => !r.parentRoleId);
  }

  /**
   * Validate role hierarchy (prevent circular dependencies)
   */
  validateRoleHierarchy(roleId: string, parentRoleId: string): boolean {
    if (roleId === parentRoleId) return false;

    let current = parentRoleId;
    const visited = new Set<string>();

    while (current) {
      if (visited.has(current)) return false; // Circular dependency
      visited.add(current);

      const role = this.state.roles.find(r => r.id === current);
      if (!role) return true;
      current = role.parentRoleId || '';
    }

    return true;
  }
}

/**
 * Helper function to create engine instance
 */
export function createRBACEngine(state: RBACState): RBACEngine {
  return new RBACEngine(state);
}