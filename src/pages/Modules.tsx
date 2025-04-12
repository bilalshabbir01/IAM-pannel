// src/pages/Modules.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getModules, 
  createModule, 
  updateModule, 
  deleteModule, 
  reset 
} from '../features/modules/modulesSlice';
import { AppDispatch, RootState } from '../store';
import DashboardLayout from '../components/layouts/DashboardLayout';
import ModuleModal from '../components/modules/ModuleModal';
import { Module } from '../types';

function Modules() {
  const dispatch = useDispatch<AppDispatch>();
  const { modules, isLoading, isError, message } = useSelector(
    (state: RootState) => state.modules
  );
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    // Fetch modules on component mount
    dispatch(getModules());
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const openModal = (module: Module | null = null) => {
    setCurrentModule(module);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentModule(null);
  };

  const handleSaveModule = async (moduleData: Partial<Module>) => {
    try {
      if (currentModule) {
        // Editing existing module
        await dispatch(updateModule({ 
          ...currentModule, 
          ...moduleData,
          name: moduleData.name || currentModule.name // Ensure name is not lost
        } as Module)).unwrap();
      } else {
        // Creating new module
        if (!moduleData.name || moduleData.name.trim() === '') {
          return; // Don't create module with empty name
        }
        await dispatch(createModule({ 
          name: moduleData.name.trim() 
        })).unwrap();
      }
      
      // After successful operation, refresh the modules list
      await dispatch(getModules()).unwrap();
      closeModal();
    } catch (error) {
      console.error('Error saving module:', error);
      // Keep modal open on error
    }
  };

  const openDeleteConfirmation = (moduleId: number) => {
    setConfirmDelete(moduleId);
  };

  const handleDeleteModule = async (moduleId: number) => {
    try {
      await dispatch(deleteModule(moduleId)).unwrap();
      setConfirmDelete(null);
      // Refresh the modules list after deletion
      await dispatch(getModules()).unwrap();
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Module Management</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Module
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
            <p>Loading modules...</p>
          </div>
        ) : modules && modules.length > 0 ? (
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
                      <button
                        onClick={() => openModal(module)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(module.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
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

      {/* Module Modal */}
      <ModuleModal
        module={currentModule}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveModule}
      />

      {/* Delete Confirmation Modal */}
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
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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