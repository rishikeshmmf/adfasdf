import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
    Permission,
    Policy,
    RBACContextType,
    RBACState,
    Role,
    User,
} from '@shared/rbac-types';
import { RBACEngine } from '@/lib/rbac-engine';
import { storage } from '@/lib/storage';
import { mockRBACData, mockUsers } from '@/data/mock-rbac-data';
import { generateId } from '@/lib/utils';

export const RBACContext = createContext<RBACContextType | undefined>(undefined);

interface RBACProviderProps {
    children: ReactNode;
    defaultUserId?: string;
}

export function RBACProvider({ children, defaultUserId = 'user-1' }: RBACProviderProps) {
    const [state, setState] = useState<RBACState>(() => {
        const savedState = storage.loadState();
        return savedState || mockRBACData;
    });

    const [currentUserId, setCurrentUserId] = useState<string>(defaultUserId);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Persist state changes
    useEffect(() => {
        storage.saveState(state);
    }, [state]);

    const engine = useMemo(() => new RBACEngine(state), [state]);

    const currentUser = useMemo(() => {
        return state.users.find(u => u.id === currentUserId) || null;
    }, [state.users, currentUserId]);

    // Queries
    const can = useCallback(
        (permission: string): boolean => {
            return engine.canUser(currentUser, permission);
        },
        [engine, currentUser]
    );

    const hasRole = useCallback(
        (roleName: string): boolean => {
            return engine.userHasRole(currentUser, roleName);
        },
        [engine, currentUser]
    );

    const hasAllRoles = useCallback(
        (roleNames: string[]): boolean => {
            return engine.hasAllRoles(currentUser, roleNames);
        },
        [engine, currentUser]
    );

    const hasAnyRole = useCallback(
        (roleNames: string[]): boolean => {
            return engine.hasAnyRole(currentUser, roleNames);
        },
        [engine, currentUser]
    );

    const getUserPermissions = useCallback(
        (userId: string): Permission[] => {
            return engine.getUserPermissions(userId);
        },
        [engine]
    );

    const getRolePermissions = useCallback(
        (roleId: string): Permission[] => {
            return engine.getRolePermissions(roleId);
        },
        [engine]
    );

    const getRolesByPolicy = useCallback(
        (policyId: string): Role[] => {
            return engine.getRolesByPolicy(policyId);
        },
        [engine]
    );

    const getPermissionsByPolicy = useCallback(
        (policyId: string): Permission[] => {
            return engine.getPermissionsByPolicy(policyId);
        },
        [engine]
    );

    const getUserRoles = useCallback(
        (userId: string): Role[] => {
            return engine.getUserRoles(userId);
        },
        [engine]
    );

    const getRoleChildren = useCallback(
        (roleId: string): Role[] => {
            return engine.getRoleChildren(roleId);
        },
        [engine]
    );

    const getRoleParent = useCallback(
        (roleId: string): Role | null => {
            return engine.getRoleParent(roleId);
        },
        [engine]
    );

    // Mutations
    const createPolicy = useCallback(
        (policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>): string => {
            try {
                const newId = generateId();
                const newPolicy: Policy = {
                    ...policy,
                    id: newId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                setState(prev => ({
                    ...prev,
                    policies: [...prev.policies, newPolicy],
                }));
                return newId;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create policy');
                throw err;
            }
        },
        []
    );

    const updatePolicy = useCallback(
        (id: string, updates: Partial<Policy>): void => {
            try {
                setState(prev => ({
                    ...prev,
                    policies: prev.policies.map(p =>
                        p.id === id
                            ? { ...p, ...updates, updatedAt: new Date() }
                            : p
                    ),
                }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update policy');
                throw err;
            }
        },
        []
    );

    const deletePolicy = useCallback(
        (id: string): void => {
            try {
                setState(prev => ({
                    ...prev,
                    policies: prev.policies.filter(p => p.id !== id),
                    // Also delete roles in this policy
                    roles: prev.roles.filter(r => r.policyId !== id),
                    // Also delete permissions in this policy
                    permissions: prev.permissions.filter(p => p.policyId !== id),
                }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete policy');
                throw err;
            }
        },
        []
    );

    const createRole = useCallback(
        (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): string => {
            try {
                const newId = generateId();
                const newRole: Role = {
                    ...role,
                    id: newId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                setState(prev => ({
                    ...prev,
                    roles: [...prev.roles, newRole],
                }));
                return newId;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create role');
                throw err;
            }
        },
        []
    );

    const updateRole = useCallback(
        (id: string, updates: Partial<Role>): void => {
            try {
                setState(prev => ({
                    ...prev,
                    roles: prev.roles.map(r =>
                        r.id === id
                            ? { ...r, ...updates, updatedAt: new Date() }
                            : r
                    ),
                }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update role');
                throw err;
            }
        },
        []
    );

    const deleteRole = useCallback(
        (id: string): void => {
            try {
                setState(prev => ({
                    ...prev,
                    roles: prev.roles.filter(r => r.id !== id),
                    // Remove from users
                    users: prev.users.map(u => ({
                        ...u,
                        roleIds: u.roleIds.filter(roleId => roleId !== id),
                    })),
                    // Remove parent references
                    roles: prev.roles
                        .filter(r => r.id !== id)
                        .map(r => ({
                            ...r,
                            parentRoleId: r.parentRoleId === id ? null : r.parentRoleId,
                        })),
                }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete role');
                throw err;
            }
        },
        []
    );

    const createPermission = useCallback(
        (permission: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): string => {
            try {
                const newId = generateId();
                const newPermission: Permission = {
                    ...permission,
                    id: newId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                setState(prev => ({
                    ...prev,
                    permissions: [...prev.permissions, newPermission],
                }));
                return newId;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to create permission');
                throw err;
            }
        },
        []
    );

    const updatePermission = useCallback(
        (id: string, updates: Partial<Permission>): void => {
            try {
                setState(prev => ({
                    ...prev,
                    permissions: prev.permissions.map(p =>
                        p.id === id
                            ? { ...p, ...updates, updatedAt: new Date() }
                            : p
                    ),
                }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update permission');
                throw err;
            }
        },
        []
    );

    const deletePermission = useCallback(
        (id: string): void => {
            try {
                setState(prev => ({
                    ...prev,
                    permissions: prev.permissions.filter(p => p.id !== id),
                    roles: prev.roles.map(r => ({
                        ...r,
                        permissions: r.permissions.filter(permId => permId !== id),
                    })),
                }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete permission');
                throw err;
            }
        },
        []
    );

    const assignRoleToUser = useCallback(
        (userId: string, roleId: string): void => {
            try {
                setState(prev => ({
                    ...prev,
                    users: prev.users.map(u =>
                        u.id === userId && !u.roleIds.includes(roleId)
                            ? { ...u, roleIds: [...u.roleIds, roleId] }
                            : u
                    ),
                }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to assign role');
                throw err;
            }
        },
        []
    );

    const removeRoleFromUser = useCallback(
        (userId: string, roleId: string): void => {
            try {
                setState(prev => ({
                    ...prev,
                    users: prev.users.map(u =>
                        u.id === userId
                            ? { ...u, roleIds: u.roleIds.filter(rid => rid !== roleId) }
                            : u
                    ),
                }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to remove role');
                throw err;
            }
        },
        []
    );

    const assignPermissionToRole = useCallback(
        (roleId: string, permissionId: string): void => {
            try {
                setState(prev => ({
                    ...prev,
                    roles: prev.roles.map(r =>
                        r.id === roleId && !r.permissions.includes(permissionId)
                            ? { ...r, permissions: [...r.permissions, permissionId] }
                            : r
                    ),
                }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to assign permission');
                throw err;
            }
        },
        []
    );

    const removePermissionFromRole = useCallback(
        (roleId: string, permissionId: string): void => {
            try {
                setState(prev => ({
                    ...prev,
                    roles: prev.roles.map(r =>
                        r.id === roleId
                            ? {
                                ...r,
                                permissions: r.permissions.filter(pid => pid !== permissionId),
                            }
                            : r
                    ),
                }));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to remove permission');
                throw err;
            }
        },
        []
    );

    const value: RBACContextType = {
        state,
        currentUser,
        users: state.users,
        roles: state.roles,
        policies: state.policies,
        permissions: state.permissions,
        loading,
        error,
        can,
        hasRole,
        hasAllRoles,
        hasAnyRole,
        getUserPermissions,
        getRolePermissions,
        getRolesByPolicy,
        getPermissionsByPolicy,
        getUserRoles,
        getRoleChildren,
        getRoleParent,
        setCurrentUser: (userId: string) => setCurrentUserId(userId),
        createPolicy,
        updatePolicy,
        deletePolicy,
        createRole,
        updateRole,
        deleteRole,
        createPermission,
        updatePermission,
        deletePermission,
        assignRoleToUser,
        removeRoleFromUser,
        assignPermissionToRole,
        removePermissionFromRole,
    };

    return (
        <RBACContext.Provider value={value}>
            {children}
        </RBACContext.Provider>
    );
}