
export const hasPermission = (
    permissions: { module: string; action: string }[],
    module: string,
    action: string
  ): boolean => {
    return permissions.some(
      (perm) => perm.module === module && perm.action === action
    );
  };
  