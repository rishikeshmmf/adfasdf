import { z } from "zod";

// Bitwise Permission Flags (like chmod: 1=read, 2=write, 4=delete, 8=update)
export enum PermissionFlag {
  READ = 1,
  WRITE = 2,
  DELETE = 4,
  UPDATE = 8,
  APPROVE = 16,
  REJECT = 32,
}

// Permission Level Hierarchy
export enum PermissionLevel {
  BASIC = 0,
  INTERMEDIATE = 1,
  ADVANCED = 2,
  ADMIN = 3,
}

// Core RBAC Models
export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  action: z.enum(["read", "write", "delete", "update", "approve", "reject"]),
  flag: z.number(), // Bitwise flag
  level: z.nativeEnum(PermissionLevel),
  parentId: z.string().nullable().optional(),
});

export type Permission = z.infer<typeof PermissionSchema>;

export const PolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  serviceId: z.string(),
  permissions: z.array(z.string()), // Array of permission IDs
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Policy = z.infer<typeof PolicySchema>;

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  level: z.nativeEnum(PermissionLevel),
  permissionCode: z.number().default(0), // Bitwise permission code (like chmod: e.g., 15 = read+write+delete+update)
  policyIds: z.array(z.string()),
  parentRoleId: z.string().nullable().optional(), // For role hierarchy - auto-inherits parent permissions
  childRoleIds: z.array(z.string()).optional(),
  permissions: z.array(PermissionSchema).optional(),
  inheritedPermissions: z.array(z.string()).optional(), // Permission IDs inherited from parent
  ownPermissions: z.array(z.string()).optional(), // Permission IDs specific to this role
  inheritedAt: z.string().nullable().optional(), // When permissions were inherited
  inheritanceSchedule: z.array(
    z.object({
      permissionId: z.string(),
      grantedAt: z.string(), // When this permission was granted
      expiresAt: z.string().nullable().optional(), // When permission expires (optional)
    })
  ).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Role = z.infer<typeof RoleSchema>;

export const ServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Service = z.infer<typeof ServiceSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  type: z.enum(["guest", "login"]),
  roleIds: z.array(z.string()),
  roles: z.array(RoleSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// Authorization Check Result
export const AuthCheckResultSchema = z.object({
  allowed: z.boolean(),
  reason: z.string(),
  userId: z.string(),
  requiredPermission: z.string(),
  foundPermission: z.boolean(),
});

export type AuthCheckResult = z.infer<typeof AuthCheckResultSchema>;

// Role Hierarchy Node (for visualization)
export const RoleHierarchyNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.nativeEnum(PermissionLevel),
  level_name: z.string(),
  children: z.lazy(() => RoleHierarchyNodeSchema.array()),
  parentId: z.string().nullable(),
});

export type RoleHierarchyNode = z.infer<typeof RoleHierarchyNodeSchema>;
