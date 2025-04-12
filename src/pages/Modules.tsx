// src/pages/Modules.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  reset,
} from '../features/modules/modulesSlice';
import { AppDispatch, RootState } from '../store';
import DashboardLayout from '../components/layouts/DashboardLayout';
import ModuleModal from '../components/modules/ModuleModal';
import { Module } from '../types';
import { toast } from 'react-toastify';

const hasPermission = (
  permissions: { module: string; action: string }[],
  module: string,
  action: string
): boolean => {
  return permissions.some((perm) => perm.module === module && perm.action === action);
};

function Modules() {
  const dispatch = useDispatch<AppDispatch>();
  const { modules, isLoading, isError, message } = useSelector((state: RootState) => state.modules);
  const rawPermissions = useSelector((state: RootState) => state.auth.permissions);
  const permissions = rawPermissions && rawPermissions.length > 0
    ? rawPermissions
    : JSON.parse(localStorage.getItem('permissions') || '[]');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getModules());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const openModal = (module: Module | null = null) => {
    const action = module ? 'update' : 'create';
    if (!hasPermission(permissions, 'Modules', action)) {
      toast.error(`⛔ You don't have permission to ${action} modules.`);
      return;
    }
    setCurrentModule(module);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentModule(null);
  };

  const handleSaveModule = async (moduleData: Partial<Module>) => {
    const action = currentModule ? 'update' : 'create';
    if (!hasPermission(permissions, 'Modules', action)) {
      toast.error(`⛔ You don't have permission to ${action} modules.`);
      return;
    }

    try {
      if (currentModule) {
        await dispatch(
          updateModule({
            ...currentModule,
            ...moduleData,
            name: moduleData.name || currentModule.name,
          } as Module)
        ).unwrap();
      } else {
        if (!moduleData.name?.trim()) return;
        await dispatch(createModule({ name: moduleData.name.trim() })).unwrap();
      }
      await dispatch(getModules()).unwrap();
      closeModal();
    } catch (error) {
      console.error('Error saving module:', error);
    }
  };

  const openDeleteConfirmation = (moduleId: number) => {
    if (!hasPermission(permissions, 'Modules', 'delete')) {
      toast.error(`⛔ You don't have permission to delete modules.`);
      return;
    }
    setConfirmDelete(moduleId);
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!hasPermission(permissions, 'Modules', 'delete')) {
      toast.error(`⛔ You don't have permission to delete modules.`);
      return;
    }
    try {
      await dispatch(deleteModule(moduleId)).unwrap();
      await dispatch(getModules()).unwrap();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Module Management</h1>
        {
          hasPermission(permissions, 'Permissions', "create") &&
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Module
          </button>
        }
      </div>

      {isError && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="text-center py-4">
            <p>Loading modules...</p>
          </div>
        ) : modules.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {modules.map((module) => (
              <li key={module.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {module.name || 'Unnamed Module'}
                      </h3>
                      {module.created_at && (
                        <p className="text-xs text-gray-500">
                          Created: {new Date(module.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {
                        hasPermission(permissions, 'Permissions', "update") &&
                        <button
                          onClick={() => openModal(module)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                      }
                      {
                        hasPermission(permissions, 'Permissions', "delete") &&
                        <button
                          onClick={() => openDeleteConfirmation(module.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      }
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No modules found. Create one to get started.</p>
          </div>
        )}
      </div>

      <ModuleModal
        module={currentModule}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveModule}
      />

      {confirmDelete !== null && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this module? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                onClick={() => handleDeleteModule(confirmDelete)}
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

export default Modules;