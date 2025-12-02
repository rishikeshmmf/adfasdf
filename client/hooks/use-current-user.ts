import { useRBAC } from "./use-rbac";

export function useCurrentUser() {
  const { currentUser } = useRBAC();
  return currentUser;
}
