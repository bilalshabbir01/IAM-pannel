// src/components/permissions/PermissionModal.tsx
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Permission, Module } from '../../types';

interface PermissionModalProps {
  permission: Permission | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (permissionData: Partial<Permission>) => void;
}

const PermissionModal = ({ permission, isOpen, onClose, onSave }: PermissionModalProps) => {
  const { modules } = useSelector((state: RootState) => state.modules);
  const [formData, setFormData] = useState<Partial<Permission>>({
    module_id: 0,
    action: 'read',
  });
  
  const actionOptions: ('create' | 'read' | 'update' | 'delete')[] = ['create', 'read', 'update', 'delete'];

  useEffect(() => {
    if (permission) {
      setFormData({
        id: permission.id,
        module_id: permission.module_id,
        action: permission.action,
      });
    } else {
      setFormData({
        module_id: modules.length > 0 ? modules[0].id : 0,
        action: 'read',
      });
    }
  }, [permission, modules]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.name === 'module_id' ? parseInt(e.target.value) : e.target.value;
    
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {permission ? 'Edit Permission' : 'Add New Permission'}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="module_id" className="block text-sm font-medium text-gray-700">
              Module
            </label>
            <select
              id="module_id"
              name="module_id"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={formData.module_id || 0}
              onChange={handleChange}
              required
              disabled={!!permission} // Disable editing module for existing permissions
            >
              <option value={0}>Select a module</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="action" className="block text-sm font-medium text-gray-700">
              Action
            </label>
            <select
              id="action"
              name="action"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={formData.action || 'read'}
              onChange={handleChange as any}
              required
              disabled={!!permission} // Disable editing action for existing permissions
            >
              <option value="">Select an action</option>
              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              className="mr-2 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PermissionModal;