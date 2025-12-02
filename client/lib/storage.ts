import { RBACState } from '@shared/rbac-types';

const STORAGE_KEY = 'rbac-state';

export const storage = {
  /**
   * Save RBAC state to localStorage
   */
  saveState: (state: RBACState): void => {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save RBAC state:', error);
    }
  },

  /**
   * Load RBAC state from localStorage
   */
  loadState: (): RBACState | null => {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      return serialized ? JSON.parse(serialized) : null;
    } catch (error) {
      console.error('Failed to load RBAC state:', error);
      return null;
    }
  },

  /**
   * Clear RBAC state from localStorage
   */
  clearState: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear RBAC state:', error);
    }
  },
};