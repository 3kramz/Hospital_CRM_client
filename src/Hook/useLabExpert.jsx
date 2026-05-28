/**
 * useLabExpert — returns true if the current user has the 'lab_expert' role.
 *
 * NOTE: For most RBAC checks in this app, prefer importing `hasAnyRole` from
 * `utils/userRoles.js` together with the `useUserData` hook, since that pattern
 * is already established throughout the codebase and avoids redundant API calls.
 *
 * This hook is kept for backwards compatibility / specific use-cases where a
 * standalone boolean is preferred.
 */
import useUserData from "./useUserData";
import { getUserRoles } from "../utils/userRoles";

const useLabExpert = () => {
    const [userData, isUserLoading] = useUserData();
    const isLabExpert = !isUserLoading && getUserRoles(userData).includes("lab_expert");
    return [isLabExpert, isUserLoading];
};

export default useLabExpert;
