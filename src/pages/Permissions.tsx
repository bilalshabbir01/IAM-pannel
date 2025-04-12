// src/pages/Permissions.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  reset
} from '../features/permissions/permissionsSlice';
import { getModules } from '../features/modules/modulesSlice';
import { AppDispatch, RootState } from '../store';
import DashboardLayout from '../components/layouts/DashboardLayout';
import PermissionModal from '../components/permissions/PermissionModal';
import RolePermissionAssignment from '../components/permissions/RolePermissionAssignment';
import { Permission } from '../types';
import { toast } from 'react-toastify';

const hasPermission = (
  permissions: { module: string; action: string }[],
  module: string,
  action: string
): boolean => {
  return permissions.some(
    (perm) => perm.module === module && perm.action === action
  );
};

function Permissions() {
  const dispatch = useDispatch<AppDispatch>();
  const { permissions: permissionList, isLoading, isError, message } = useSelector((state: RootState) => state.permissions);
  const { modules } = useSelector((state: RootState) => state.modules);
  const rawPermissions = useSelector((state: RootState) => state.auth.permissions);
  const permissions = rawPermissions && rawPermissions.length > 0
  ? rawPermissions
  : JSON.parse(localStorage.getItem('permissions') || '[]');

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState<boolean>(false);

  useEffect(() => {
    dispatch(getPermissions());
    dispatch(getModules());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const openModal = (permission: Permission | null = null) => {
    const action = permission ? 'update' : 'create';
    if (!hasPermission(permissions, 'Permissions', action)) {
      toast.error(`You don't have permission to ${action} permissions.`);
      return;
    }
    setCurrentPermission(permission);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPermission(null);
  };

  const handleSavePermission = (permissionData: Partial<Permission>) => {
    const action = currentPermission ? 'update' : 'create';
    if (!hasPermission(permissions, 'Permissions', action)) {
      toast.error(`You don't have permission to ${action} permissions.`);
      return;
    }
    if (currentPermission) {
      dispatch(updatePermission({ ...currentPermission, ...permissionData } as Permission));
    } else {
      dispatch(createPermission({
        action: permissionData.action as 'create' | 'read' | 'update' | 'delete',
        module_id: permissionData.module_id as number
      }));
    }
    closeModal();
  };

  const openDeleteConfirmation = (permissionId: number) => {
    if (!hasPermission(permissions, 'Permissions', 'delete')) {
      toast.error("You don't have permission to delete permissions.");
      return;
    }
    setConfirmDelete(permissionId);
  };

  const handleDeletePermission = (permissionId: number) => {
    if (!hasPermission(permissions, 'Permissions', 'delete')) {
      toast.error("You don't have permission to delete permissions.");
      return;
    }
    dispatch(deletePermission(permissionId));
    setConfirmDelete(null);
  };

  const openAssignmentModal = () => {
    if (!hasPermission(permissions, 'Permissions', 'update')) {
      toast.error("You don't have permission to assign permissions.");
      return;
    }
    setIsAssignmentModalOpen(true);
  };

  const closeAssignmentModal = () => {
    setIsAssignmentModalOpen(false);
  };

  const getModuleName = (moduleId: number): string => {
    const module = modules.find(m => m.id === moduleId);
    return module ? module.name : 'Unknown';
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Permission Management</h1>
        <div className="space-x-2">
          <button
            onClick={openAssignmentModal}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Assign to Roles
          </button>
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Permission
          </button>
        </div>
      </div>

      {isError && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="text-center py-4">
            <p>Loading permissions...</p>
          </div>
        ) : permissionList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {permissionList.map((permission) => (
                  <tr key={permission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {permission.module?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${permission.action === 'create' && 'bg-blue-100 text-blue-800'}
                        ${permission.action === 'read' && 'bg-green-100 text-green-800'}
                        ${permission.action === 'update' && 'bg-yellow-100 text-yellow-800'}
                        ${permission.action === 'delete' && 'bg-red-100 text-red-800'}
                      `}>
                        {permission.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(permission)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(permission.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No permissions found. Create one to get started.</p>
          </div>
        )}
      </div>

      <PermissionModal
        permission={currentPermission}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSavePermission}
      />

      <RolePermissionAssignment 
        isOpen={isAssignmentModalOpen}
        onClose={closeAssignmentModal}
      />

      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this permission? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                onClick={() => handleDeletePermission(confirmDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Permissions;