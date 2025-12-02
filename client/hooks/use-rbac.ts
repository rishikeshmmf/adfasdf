import { useContext } from 'react';
import { RBACContext } from '@/contexts/rbac-context';
import { RBACContextType } from '@shared/rbac-types';

export function useRBAC(): RBACContextType {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within RBACProvider');
  }
  return context;
}