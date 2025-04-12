// src/pages/Roles.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getRoles, 
  createRole, 
  updateRole, 
  deleteRole, 
  reset 
} from '../features/roles/rolesSlice';
import { getModules } from '../features/modules/modulesSlice';
import { AppDispatch, RootState } from '../store';
import DashboardLayout from '../components/layouts/DashboardLayout';
import RoleModal from '../components/roles/RoleModal';
import { Role } from '../types';

function Roles() {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, isLoading, isError, message } = useSelector(
    (state: RootState) => state.roles
  );
  const { modules } = useSelector((state: RootState) => state.modules);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getRoles());
    dispatch(getModules()); // Make sure modules are loaded for displaying permission names
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const openModal = (role: Role | null = null) => {
    setCurrentRole(role);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentRole(null);
  };

  const handleSaveRole = async (roleData: Partial<Role>) => {
    try {
      if (currentRole) {
        // Editing existing role
        await dispatch(updateRole({ 
          ...currentRole, 
          ...roleData,
          name: roleData.name || currentRole.name // Ensure name is not lost
        } as Role)).unwrap();
      } else {
        // Creating new role
        if (!roleData.name || roleData.name.trim() === '') {
          return; // Don't create role with empty name
        }
        await dispatch(createRole({ 
          name: roleData.name.trim() 
        })).unwrap();
      }
      
      // After successful operation, refresh the roles list
      await dispatch(getRoles()).unwrap();
      closeModal();
    } catch (error) {
      console.error('Error saving role:', error);
      // Keep modal open on error
    }
  };

  const openDeleteConfirmation = (roleId: number) => {
    setConfirmDelete(roleId);
  };

  const handleDeleteRole = async (roleId: number) => {
    try {
      await dispatch(deleteRole(roleId)).unwrap();
      setConfirmDelete(null);
      // Refresh the roles list after deletion
      await dispatch(getRoles()).unwrap();
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  // Helper function to get module name from ID
  const getModuleName = (moduleId: number): string => {
    const module = modules.find(m => m.id === moduleId);
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
        ) : roles && roles.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {roles.map((role) => (
              <li key={role.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {role.name || 'Unnamed Role'}
                      </h3>
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
                        onClick={() => openDeleteConfirmation(role.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Display permissions in role */}
                  {role.permissions && role.permissions.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {role.permissions.map((permission) => (
                          <span
                            key={permission.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {getModuleName(permission.module_id)} - {permission.action}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Display groups in role */}
                  {Array.isArray(role.groups) && role.groups.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Groups
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {role.groups.map((group) => (
                          <span
                            key={group.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
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

      {/* Role Modal */}
      <RoleModal
        role={currentRole}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveRole}
      />

      {/* Delete Confirmation Modal */}
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
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={() => handleDeleteRole(confirmDelete)}
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

export default Roles;