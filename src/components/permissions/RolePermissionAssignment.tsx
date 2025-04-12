// src/components/permissions/RolePermissionAssignment.tsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPermissions } from '../../features/permissions/permissionsSlice';
import { getRoles } from '../../features/roles/rolesSlice';
import { assignPermissionToRole, removePermissionFromRole } from '../../features/roles/rolesSlice';
import { AppDispatch, RootState } from '../../store';
import { Role, Permission, Module } from '../../types';

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
  
  useEffect(() => {
    dispatch(getPermissions());
    dispatch(getRoles());
  }, [dispatch]);

  useEffect(() => {
    if (selectedRole) {
      const role = roles.find(r => r.id === selectedRole) || null;
      setCurrentRole(role);
    } else {
      setCurrentRole(null);
    }
  }, [selectedRole, roles]);

  // Filter out permissions that are already assigned to the role
  const availablePermissions = permissions.filter(permission => 
    !currentRole?.permissions?.some(p => p.id === permission.id)
  );

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(Number(e.target.value));
    setSelectedPermission(0);
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPermission(Number(e.target.value));
  };

  const handleAssignPermission = () => {
    if (selectedRole && selectedPermission) {
      dispatch(assignPermissionToRole({ 
        roleId: selectedRole, 
        permissionId: selectedPermission 
      }));
      setSelectedPermission(0);
    }
  };

  const handleRemovePermission = (permissionId: number) => {
    if (selectedRole) {
      dispatch(removePermissionFromRole({ 
        roleId: selectedRole, 
        permissionId 
      }));
    }
  };

  // Helper function to get module name from ID
  const getModuleName = (moduleId: number): string => {
    const module = modules.find(m => m.id === moduleId);
    return module ? module.name : 'Unknown';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Assign Permissions to Roles
          </h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Select Role
          </label>
          <select
            id="role"
            name="role"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedRole || ''}
            onChange={handleRoleChange}
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {selectedRole > 0 && (
          <>
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Assign Permission</h4>
              <div className="flex space-x-2">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedPermission || ''}
                  onChange={handlePermissionChange}
                >
                  <option value="">Select a permission</option>
                  {availablePermissions.map((permission) => (
                    <option key={permission.id} value={permission.id}>
                      {permission?.module?.name} - {permission.action}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleAssignPermission}
                  disabled={!selectedPermission}
                >
                  Assign
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Permissions</h4>
              {currentRole?.permissions && currentRole.permissions.length > 0 ? (
                <div className="bg-gray-50 rounded-md p-4">
                  <ul className="divide-y divide-gray-200">
                    {currentRole.permissions.map((permission) => {
                      // Find full permission details
                      const fullPermission = permissions.find(p => p.id === permission.id);
                      return (
                        <li key={permission.id} className="py-3 flex justify-between items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {fullPermission ? 
                              `${getModuleName(fullPermission.module_id)} - ${fullPermission.action}` : 
                              'Unknown Permission'}
                          </div>
                          <button
                            type="button"
                            className="text-sm text-red-600 hover:text-red-800"
                            onClick={() => handleRemovePermission(permission.id)}
                          >
                            Remove
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No permissions assigned to this role yet.</p>
              )}
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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