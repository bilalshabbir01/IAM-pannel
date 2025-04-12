// src/components/permissions/RolePermissionAssignment.tsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPermissions } from '../../features/permissions/permissionsSlice';
import { getRoles, assignPermissionToRole, removePermissionFromRole } from '../../features/roles/rolesSlice';
import { AppDispatch, RootState } from '../../store';
import { Role, Permission } from '../../types';

interface RolePermissionAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
}

const RolePermissionAssignment = ({ isOpen, onClose }: RolePermissionAssignmentProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { roles } = useSelector((state: RootState) => state.roles);
  const { permissions } = useSelector((state: RootState) => state.permissions);
  const { modules } = useSelector((state: RootState) => state.modules);

  const [selectedRole, setSelectedRole] = useState<number>(0);
  const [selectedPermission, setSelectedPermission] = useState<number>(0);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    dispatch(getPermissions());
    dispatch(getRoles());
  }, [dispatch]);

  useEffect(() => {
    if (selectedRole) {
      const role = roles.find((r) => r.id === selectedRole) || null;
      setCurrentRole(role);
    } else {
      setCurrentRole(null);
    }
  }, [selectedRole, roles]);

  const availablePermissions = permissions.filter(
    (permission) => !currentRole?.permissions?.some((p) => p.id === permission.id)
  );

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(Number(e.target.value));
    setSelectedPermission(0);
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPermission(Number(e.target.value));
  };

  const handleAssignPermission = async () => {
    if (selectedRole && selectedPermission) {
      await dispatch(assignPermissionToRole({ roleId: selectedRole, permissionIds: [selectedPermission] }));
      setSelectedPermission(0);
      setSuccessMessage('Permission assigned!');
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  const handleRemovePermission = (permissionId: number) => {
    if (selectedRole) {
      dispatch(removePermissionFromRole({ roleId: selectedRole, permissionId }));
    }
  };

  const getModuleName = (moduleId: number): string => {
    const module = modules.find((m) => m.id === moduleId);
    return module ? module.name : 'Unknown';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Assign Permissions to Roles</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Select Role */}
        <div className="mb-6">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Select Role</label>
          <select
            id="role"
            name="role"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            value={selectedRole}
            onChange={handleRoleChange}
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>

        {/* Select Permission */}
        {selectedRole > 0 && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Permission</label>
              <div className="flex space-x-2">
                <select
                  className="block w-full border-gray-300 rounded-md shadow-sm"
                  value={selectedPermission}
                  onChange={handlePermissionChange}
                >
                  <option value="">Select a permission</option>
                  {availablePermissions.map((permission) => (
                    <option key={permission.id} value={permission.id}>
                      {permission.module?.name || getModuleName(permission.module_id)} - {permission.action}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                  onClick={handleAssignPermission}
                  disabled={!selectedPermission}
                >
                  Assign
                </button>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 text-sm text-green-600 font-medium">
                ✅ {successMessage}
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 text-sm rounded-md bg-white hover:bg-gray-50"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionAssignment;
