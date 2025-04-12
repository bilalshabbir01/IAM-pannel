// src/components/groups/AssignGroupToRoleModal.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { getGroups, assignRolesToGroup } from '../../features/groups/groupsSlice';
import { Role, Group } from '../../types';

interface AssignGroupToRoleModalProps {
    roleId: any;
  isOpen: boolean;
  onClose: () => void;
}

const AssignGroupToRoleModal = ({ roleId, isOpen, onClose }: AssignGroupToRoleModalProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { groups } = useSelector((state: RootState) => state.groups);

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    dispatch(getGroups());
  }, [dispatch]);

  const handleAssign = async () => {
    if (!selectedGroupId) return;

    try {
      await dispatch(assignRolesToGroup({ groupId: selectedGroupId, roleIds: [roleId] })).unwrap();
      setSuccessMessage('Role assigned to group successfully');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error assigning role to group:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Assign Role to a Group</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <div className="mb-4">
          <label htmlFor="group-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Group
          </label>
          <select
            id="group-select"
            className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={selectedGroupId || ''}
            onChange={(e) => setSelectedGroupId(Number(e.target.value))}
          >
            <option value="">-- Choose Group --</option>
            {groups.map((group: Group) => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-white border px-4 py-2 rounded text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            disabled={!selectedGroupId}
          >
            Assign
          </button>
        </div>

        {successMessage && (
          <p className="mt-4 text-sm text-green-600 text-center">{successMessage}</p>
        )}
      </div>
    </div>
  );
};

export default AssignGroupToRoleModal;
