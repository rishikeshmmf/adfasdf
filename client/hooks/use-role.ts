import { useMemo } from 'react';
import { useRBAC } from './use-rbac';

export function useRole(roleName: string | string[]): boolean {
  const { hasRole, hasAnyRole } = useRBAC();

  return useMemo(() => {
    if (Array.isArray(roleName)) {
      return hasAnyRole(roleName);
    }
    return hasRole(roleName);
  }, [roleName, hasRole, hasAnyRole]);
}