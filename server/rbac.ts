import {
  Permission,
  PermissionLevel,
  PermissionFlag,
  Policy,
  Role,
  Service,
  User,
  AuthCheckResult,
  RoleHierarchyNode,
} from "@shared/rbac";
import {
  calculatePermissionCode,
  getPermissionNames,
  inheritPermissions,
  hasPermission,
} from "@shared/rbac-utils";

// In-memory storage (replace with database in production)
let permissions: Permission[] = [
  {
    id: "perm-read",
    name: "Read",
    description: "Read/View resources",
    action: "read",
    flag: PermissionFlag.READ,
    level: PermissionLevel.BASIC,
  },
  {
    id: "perm-write",
    name: "Write",
    description: "Create/Edit resources",
    action: "write",
    flag: PermissionFlag.WRITE,
    level: PermissionLevel.INTERMEDIATE,
  },
  {
    id: "perm-delete",
    name: "Delete",
    description: "Delete resources",
    action: "delete",
    flag: PermissionFlag.DELETE,
    level: PermissionLevel.ADVANCED,
  },
  {
    id: "perm-update",
    name: "Update",
    description: "Update resource metadata",
    action: "update",
    flag: PermissionFlag.UPDATE,
    level: PermissionLevel.INTERMEDIATE,
  },
  {
    id: "perm-approve",
    name: "Approve",
    description: "Approve requests",
    action: "approve",
    flag: PermissionFlag.APPROVE,
    level: PermissionLevel.ADVANCED,
  },
  {
    id: "perm-reject",
    name: "Reject",
    description: "Reject requests",
    action: "reject",
    flag: PermissionFlag.REJECT,
    level: PermissionLevel.ADVANCED,
  },
];

let policies: Policy[] = [
  {
    id: "policy-student-read",
    name: "Student Read Policy",
    description: "Allow students to view course materials",
    serviceId: "service-courses",
    permissions: ["perm-view", "perm-view-own"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "policy-instructor-full",
    name: "Instructor Full Access",
    description: "Full access for instructors",
    serviceId: "service-courses",
    permissions: [
      "perm-view-all",
      "perm-create",
      "perm-edit-all",
      "perm-delete",
      "perm-approve",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "policy-labs-access",
    name: "Labs Access Policy",
    description: "Access to lab resources",
    serviceId: "service-labs",
    permissions: ["perm-view-own", "perm-create"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let roles: Role[] = [
  {
    id: "role-admin",
    name: "Admin",
    description: "Full system access",
    level: PermissionLevel.ADMIN,
    permissionCode: 63, // All permissions: read(1) + write(2) + delete(4) + update(8) + approve(16) + reject(32) = 63
    policyIds: ["policy-instructor-full", "policy-labs-access"],
    childRoleIds: ["role-content-writer", "role-support"],
    ownPermissions: ["perm-read", "perm-write", "perm-delete", "perm-update", "perm-approve", "perm-reject"],
    inheritanceSchedule: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "role-content-writer",
    name: "Content Writer",
    description: "Can create and edit content",
    level: PermissionLevel.ADVANCED,
    permissionCode: 11, // read(1) + write(2) + update(8) = 11, inherited delete(4) from parent
    policyIds: ["policy-instructor-full"],
    parentRoleId: "role-admin",
    ownPermissions: ["perm-read", "perm-write", "perm-update"],
    inheritedPermissions: ["perm-delete", "perm-approve", "perm-reject"], // From parent
    inheritedAt: new Date().toISOString(),
    inheritanceSchedule: [
      {
        permissionId: "perm-delete",
        grantedAt: new Date().toISOString(),
        expiresAt: null,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "role-account-approval",
    name: "Account Approval",
    description: "Can approve accounts",
    level: PermissionLevel.ADVANCED,
    permissionCode: 49, // read(1) + approve(16) + reject(32) = 49
    policyIds: [],
    ownPermissions: ["perm-read", "perm-approve", "perm-reject"],
    inheritanceSchedule: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "role-support",
    name: "Support",
    description: "Support team access",
    level: PermissionLevel.INTERMEDIATE,
    permissionCode: 3, // read(1) + write(2) = 3, will inherit more over time
    policyIds: ["policy-student-read"],
    parentRoleId: "role-admin",
    ownPermissions: ["perm-read", "perm-write"],
    inheritedPermissions: ["perm-delete", "perm-update", "perm-approve", "perm-reject"], // From parent
    inheritedAt: new Date().toISOString(),
    inheritanceSchedule: [
      {
        permissionId: "perm-update",
        grantedAt: new Date().toISOString(),
        expiresAt: null,
      },
      {
        permissionId: "perm-delete",
        grantedAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // In 30 days
        expiresAt: null,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "role-user",
    name: "User",
    description: "Regular user",
    level: PermissionLevel.BASIC,
    permissionCode: 1, // read(1) only
    policyIds: ["policy-labs-access"],
    ownPermissions: ["perm-read"],
    inheritanceSchedule: [
      {
        permissionId: "perm-write",
        grantedAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // In 7 days
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 90 days
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let services: Service[] = [
  {
    id: "service-labs",
    name: "Labs Service",
    description: "Laboratory management and resources",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "service-courses",
    name: "Courses Service",
    description: "Educational content and course management",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "service-payment",
    name: "Payment Service",
    description: "Payment processing and billing",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// RBAC Authorization Logic
export class RBACEngine {
  /**
   * Check if a user has permission for a specific action on a service
   */
  static checkUserPermission(
    user: User,
    requiredPermission: string,
    serviceId: string
  ): AuthCheckResult {
    if (!user.roleIds || user.roleIds.length === 0) {
      return {
        allowed: false,
        reason: "User has no roles assigned",
        userId: user.id,
        requiredPermission,
        foundPermission: false,
      };
    }

    // Check each role's policies for the required permission
    for (const roleId of user.roleIds) {
      const role = roles.find((r) => r.id === roleId);
      if (!role) continue;

      for (const policyId of role.policyIds) {
        const policy = policies.find((p) => p.id === policyId);
        if (!policy || policy.serviceId !== serviceId) continue;

        // Check if policy contains the required permission
        if (policy.permissions.includes(requiredPermission)) {
          return {
            allowed: true,
            reason: `User role '${role.name}' has policy '${policy.name}' with required permission`,
            userId: user.id,
            requiredPermission,
            foundPermission: true,
          };
        }
      }

      // Also check direct permissions on role
      if (role.permissions) {
        const hasPermission = role.permissions.some(
          (p) => p.id === requiredPermission
        );
        if (hasPermission) {
          return {
            allowed: true,
            reason: `User role '${role.name}' has the required permission directly`,
            userId: user.id,
            requiredPermission,
            foundPermission: true,
          };
        }
      }
    }

    return {
      allowed: false,
      reason: "User's roles and policies do not contain the required permission",
      userId: user.id,
      requiredPermission,
      foundPermission: false,
    };
  }

  /**
   * Get all permissions for a user (flattened list)
   */
  static getUserPermissions(user: User): Permission[] {
    const userPermissions: Permission[] = [];
    const permissionIds = new Set<string>();

    for (const roleId of user.roleIds) {
      const role = roles.find((r) => r.id === roleId);
      if (!role) continue;

      // Get permissions from policies
      for (const policyId of role.policyIds) {
        const policy = policies.find((p) => p.id === policyId);
        if (!policy) continue;

        for (const permId of policy.permissions) {
          if (!permissionIds.has(permId)) {
            const perm = permissions.find((p) => p.id === permId);
            if (perm) {
              userPermissions.push(perm);
              permissionIds.add(permId);
            }
          }
        }
      }

      // Get direct permissions from role
      if (role.permissions) {
        for (const perm of role.permissions) {
          if (!permissionIds.has(perm.id)) {
            userPermissions.push(perm);
            permissionIds.add(perm.id);
          }
        }
      }
    }

    return userPermissions;
  }

  /**
   * Get role hierarchy tree with inheritance
   */
  static getRoleHierarchy(): RoleHierarchyNode[] {
    const roots: RoleHierarchyNode[] = [];
    const processed = new Set<string>();

    const getLevelName = (level: PermissionLevel): string => {
      switch (level) {
        case PermissionLevel.BASIC:
          return "Basic";
        case PermissionLevel.INTERMEDIATE:
          return "Intermediate";
        case PermissionLevel.ADVANCED:
          return "Advanced";
        case PermissionLevel.ADMIN:
          return "Admin";
      }
    };

    const buildNode = (roleId: string): RoleHierarchyNode => {
      const role = roles.find((r) => r.id === roleId);
      if (!role) throw new Error(`Role ${roleId} not found`);

      // Calculate inherited permissions from parent
      let effectivePermissionCode = role.permissionCode;
      if (role.parentRoleId) {
        const parentRole = roles.find((r) => r.id === role.parentRoleId);
        if (parentRole) {
          effectivePermissionCode = inheritPermissions(
            parentRole.permissionCode,
            role.permissionCode
          );
        }
      }

      return {
        id: role.id,
        name: role.name,
        level: role.level,
        level_name: getLevelName(role.level),
        parentId: role.parentRoleId || null,
        children: (role.childRoleIds || [])
          .filter((childId) => !processed.has(childId))
          .map((childId) => {
            processed.add(childId);
            return buildNode(childId);
          }),
      };
    };

    // Find root roles (no parent)
    for (const role of roles) {
      if (!role.parentRoleId && !processed.has(role.id)) {
        processed.add(role.id);
        roots.push(buildNode(role.id));
      }
    }

    return roots;
  }

  /**
   * Get role hierarchy with permission codes for org chart visualization
   */
  static getRoleHierarchyWithCodes() {
    const getLevelName = (level: PermissionLevel): string => {
      switch (level) {
        case PermissionLevel.BASIC:
          return "Basic";
        case PermissionLevel.INTERMEDIATE:
          return "Intermediate";
        case PermissionLevel.ADVANCED:
          return "Advanced";
        case PermissionLevel.ADMIN:
          return "Admin";
      }
    };

    const buildNode = (roleId: string, processed = new Set<string>()): any => {
      const role = roles.find((r) => r.id === roleId);
      if (!role || processed.has(roleId)) return null;

      processed.add(roleId);

      // Calculate effective permission code (with inheritance)
      let effectivePermissionCode = role.permissionCode;
      if (role.parentRoleId) {
        const parentRole = roles.find((r) => r.id === role.parentRoleId);
        if (parentRole) {
          effectivePermissionCode = inheritPermissions(
            parentRole.permissionCode,
            role.permissionCode
          );
        }
      }

      return {
        id: role.id,
        name: role.name,
        level: role.level,
        level_name: getLevelName(role.level),
        permissionCode: effectivePermissionCode,
        parentId: role.parentRoleId || null,
        children: (role.childRoleIds || [])
          .map((childId) => buildNode(childId, processed))
          .filter(Boolean),
      };
    };

    // Find root roles
    const roots = roles
      .filter((r) => !r.parentRoleId)
      .map((r) => buildNode(r.id))
      .filter(Boolean);

    return roots;
  }
}

// Getter functions for data
export function getPermissions(): Permission[] {
  return permissions;
}

export function getPolicies(): Policy[] {
  return policies;
}

export function getRoles(): Role[] {
  return roles;
}

export function getServices(): Service[] {
  return services;
}

export function addRole(role: Role): Role {
  roles.push(role);
  return role;
}

export function updateRole(id: string, role: Partial<Role>): Role {
  const index = roles.findIndex((r) => r.id === id);
  if (index === -1) throw new Error(`Role ${id} not found`);
  roles[index] = { ...roles[index], ...role };
  return roles[index];
}

export function deleteRole(id: string): void {
  const index = roles.findIndex((r) => r.id === id);
  if (index === -1) throw new Error(`Role ${id} not found`);
  roles.splice(index, 1);
}
