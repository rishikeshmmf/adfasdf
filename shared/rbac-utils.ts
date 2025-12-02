import { PermissionFlag } from "./rbac";

/**
 * Calculate permission code from individual permission flags (bitwise)
 * Similar to Linux chmod (e.g., 775 = rwxrwxr-x)
 *
 * Examples:
 * - READ only = 1
 * - READ + WRITE = 3 (1 + 2)
 * - READ + WRITE + DELETE = 7 (1 + 2 + 4)
 * - READ + WRITE + DELETE + UPDATE = 15 (1 + 2 + 4 + 8)
 * - All permissions = 63 (1 + 2 + 4 + 8 + 16 + 32)
 */
export function calculatePermissionCode(permissions: PermissionFlag[]): number {
  return permissions.reduce((code, flag) => code | flag, 0);
}

/**
 * Extract individual permission flags from a permission code
 * Returns array of which permissions are granted
 */
export function getPermissionsFromCode(code: number): PermissionFlag[] {
  const permissions: PermissionFlag[] = [];

  if (code & PermissionFlag.READ) permissions.push(PermissionFlag.READ);
  if (code & PermissionFlag.WRITE) permissions.push(PermissionFlag.WRITE);
  if (code & PermissionFlag.DELETE) permissions.push(PermissionFlag.DELETE);
  if (code & PermissionFlag.UPDATE) permissions.push(PermissionFlag.UPDATE);
  if (code & PermissionFlag.APPROVE) permissions.push(PermissionFlag.APPROVE);
  if (code & PermissionFlag.REJECT) permissions.push(PermissionFlag.REJECT);

  return permissions;
}

/**
 * Check if a permission code includes a specific permission
 */
export function hasPermission(code: number, flag: PermissionFlag): boolean {
  return (code & flag) === flag;
}

/**
 * Add a permission to a code
 */
export function addPermission(code: number, flag: PermissionFlag): number {
  return code | flag;
}

/**
 * Remove a permission from a code
 */
export function removePermission(code: number, flag: PermissionFlag): number {
  return code & ~flag;
}

/**
 * Get human-readable permission names from code
 */
export function getPermissionNames(code: number): string[] {
  const names: string[] = [];

  if (code & PermissionFlag.READ) names.push("Read");
  if (code & PermissionFlag.WRITE) names.push("Write");
  if (code & PermissionFlag.DELETE) names.push("Delete");
  if (code & PermissionFlag.UPDATE) names.push("Update");
  if (code & PermissionFlag.APPROVE) names.push("Approve");
  if (code & PermissionFlag.REJECT) names.push("Reject");

  return names;
}

/**
 * Calculate inherited permissions from parent role
 * Child automatically inherits all parent permissions
 */
export function inheritPermissions(
  parentCode: number,
  childOwnCode: number
): number {
  // Combine parent and child permissions (bitwise OR)
  return parentCode | childOwnCode;
}

/**
 * Check if permission should be inherited based on time schedule
 */
export function checkTimeBasedInheritance(
  grantedAt: string,
  currentDate: Date = new Date()
): boolean {
  const granted = new Date(grantedAt);
  return granted <= currentDate;
}

/**
 * Check if permission has expired
 */
export function isPermissionExpired(
  expiresAt: string | null | undefined,
  currentDate: Date = new Date()
): boolean {
  if (!expiresAt) return false;
  const expires = new Date(expiresAt);
  return expires < currentDate;
}

/**
 * Get permission code name (like chmod notation)
 * e.g., code 15 = "rwxu" or "Read+Write+Delete+Update"
 */
export function getPermissionCodeName(code: number): string {
  return getPermissionNames(code).join(" + ") || "No permissions";
}

/**
 * Format permission code as octal-style (like chmod)
 * Returns the numeric code padded with zeros
 */
export function formatPermissionCode(code: number): string {
  return code.toString().padStart(3, "0");
}
