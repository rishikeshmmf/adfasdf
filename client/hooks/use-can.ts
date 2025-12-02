import { useMemo } from 'react';
import { useRBAC } from './use-rbac';

export function useCan(permission: string | string[]): boolean {
  const { can, hasAnyRole } = useRBAC();

  return useMemo(() => {
    if (Array.isArray(permission)) {
      return hasAnyRole(permission);
    }
    return can(permission);
  }, [permission, can, hasAnyRole]);
}