interface RolePermissions {
  isPrivileged: boolean;
  canApprove: boolean;
  canGenerateQR: boolean;
  canDeleteQR: boolean;
  canViewAllOrgs: boolean;
  canViewQR: boolean;
}

export function useRolePermissions(
  position: string | null | undefined
): RolePermissions {
  const role = position || "";

  return {
    isPrivileged: ["CEO", "Developer"].includes(role),
    canApprove: ["CEO", "Developer", "President"].includes(role),
    canGenerateQR: ["CEO", "Developer", "President", "Member"].includes(role),
    canDeleteQR: ["CEO", "Developer", "President"].includes(role),
    canViewAllOrgs: ["CEO", "Developer"].includes(role),
    canViewQR: ["Driver", "Member", "President", "CEO", "Developer"].includes(
      role
    ),
  };
}
