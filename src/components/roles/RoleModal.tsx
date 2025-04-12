// src/components/roles/RoleModal.tsx
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Role } from '../../types';

interface RoleModalProps {
  role: Role | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: Partial<Role>) => void;
}

const RoleModal = ({ role, isOpen, onClose, onSave }: RoleModalProps) => {
  const [formData, setFormData] = useState<Partial<Role>>({
    name: '',
  });
  const [nameError, setNameError] = useState<string>('');

  useEffect(() => {
    // When role changes or modal opens, reset the form data
    if (role) {
      setFormData({
        id: role.id,
        name: role.name || '',
      });
    } else {
      setFormData({
        name: '',
      });
    }
    setNameError('');
  }, [role, isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user types in name field
    if (name === 'name' && value.trim() !== '') {
      setNameError('');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate the name field
    if (!formData.name || formData.name.trim() === '') {
      setNameError('Role name is required');
      return;
    }
    
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {role ? 'Edit Role' : 'Add New Role'}
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className={`mt-1 block w-full border ${
                nameError ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              value={formData.name}
              onChange={handleChange}
            />
            {nameError && (
              <p className="mt-1 text-sm text-red-600">{nameError}</p>
            )}
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

export default RoleModal;