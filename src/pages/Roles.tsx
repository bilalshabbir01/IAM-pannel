// src/pages/Roles.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  reset,
} from '../features/roles/rolesSlice';
import { getModules } from '../features/modules/modulesSlice';
import { AppDispatch, RootState } from '../store';
import DashboardLayout from '../components/layouts/DashboardLayout';
import RoleModal from '../components/roles/RoleModal';
import AssignGroupToRoleModal from '../components/roles/AssignGroupToRoleModal';
import { Role } from '../types';
import { toast } from 'react-toastify';

const hasPermission = (
  permissions: { module: string; action: string }[],
  module: string,
  action: string
): boolean => {
  return permissions.some((perm) => perm.module === module && perm.action === action);
};

function Roles() {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, isLoading, isError, message } = useSelector((state: RootState) => state.roles);
  const { modules } = useSelector((state: RootState) => state.modules);
  const rawPermissions = useSelector((state: RootState) => state.auth.permissions);
  const permissions = rawPermissions && rawPermissions.length > 0
  ? rawPermissions
  : JSON.parse(localStorage.getItem('permissions') || '[]');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [activeRoleId, setActiveRoleId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getRoles());
    dispatch(getModules());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const openModal = (role: Role | null = null) => {
    const action = role ? 'update' : 'create';
    if (!hasPermission(permissions, 'Roles', action)) {
      toast.error(`⛔ You don't have permission to ${action} roles.`);
      return;
    }
    setCurrentRole(role);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRole(null);
  };

  const handleSaveRole = async (roleData: Partial<Role>) => {
    const action = currentRole ? 'update' : 'create';
    if (!hasPermission(permissions, 'Roles', action)) {
      toast.error(`⛔ You don't have permission to ${action} roles.`);
      return;
    }

    try {
      if (currentRole) {
        await dispatch(updateRole({ ...currentRole, ...roleData, name: roleData.name || currentRole.name } as Role)).unwrap();
      } else {
        if (!roleData.name?.trim()) return;
        await dispatch(createRole({ name: roleData.name.trim() })).unwrap();
      }
      await dispatch(getRoles()).unwrap();
      closeModal();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const openDeleteConfirmation = (roleId: number) => {
    if (!hasPermission(permissions, 'Roles', 'delete')) {
      toast.error("⛔ You don't have permission to delete roles.");
      return;
    }
    setConfirmDelete(roleId);
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!hasPermission(permissions, 'Roles', 'delete')) {
      toast.error("⛔ You don't have permission to delete roles.");
      return;
    }
    try {
      await dispatch(deleteRole(roleId)).unwrap();
      setConfirmDelete(null);
      await dispatch(getRoles()).unwrap();
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const handleAssignGroup = (roleId: number) => {
    if (!hasPermission(permissions, 'Roles', 'update')) {
      toast.error("⛔ You don't have permission to assign groups.");
      return;
    }
    setActiveRoleId(roleId);
    setShowGroupModal(true);
  };

  const getModuleName = (moduleId: number): string => {
    const module = modules.find((m) => m.id === moduleId);
    return module ? module.name : 'Unknown';
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Role Management</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Role
        </button>
      </div>

      {isError && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="text-center py-4">
            <p>Loading roles...</p>
          </div>
        ) : roles.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {roles.map((role) => (
              <li key={role.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                      {role.created_at && (
                        <p className="text-xs text-gray-500">
                          Created: {new Date(role.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(role)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAssignGroup(role.id)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        Assign Groups
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(role.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {role.permissions?.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {role.permissions.map((permission) => (
                          <span key={permission.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {getModuleName(permission.module_id)} - {permission.action}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(role.groups) && role.groups.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Groups</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {role.groups.map((group) => (
                          <span key={group.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {group.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No roles found. Create one to get started.</p>
          </div>
        )}
      </div>

      <RoleModal
        role={currentRole}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveRole}
      />

      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this role? This action cannot be undone.
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
                onClick={() => handleDeleteRole(confirmDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showGroupModal && activeRoleId && (
        <AssignGroupToRoleModal
          isOpen={showGroupModal}
          onClose={() => {
            setShowGroupModal(false);
            setActiveRoleId(null);
          }}
          roleId={activeRoleId}
        />
      )}
    </DashboardLayout>
  );
}

export default Roles;
