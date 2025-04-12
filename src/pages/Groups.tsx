// src/pages/Groups.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  reset,
} from '../features/groups/groupsSlice';
import { AppDispatch, RootState } from '../store';
import DashboardLayout from '../components/layouts/DashboardLayout';
import GroupModal from '../components/groups/GroupModal';
import GroupUserAssignment from '../components/groups/GroupUserAssignment';
import { Group } from '../types';
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

function Groups() {
  const dispatch = useDispatch<AppDispatch>();
  const rawPermissions = useSelector((state: RootState) => state.auth.permissions);
  const permissions = rawPermissions && rawPermissions.length > 0
  ? rawPermissions
  : JSON.parse(localStorage.getItem('permissions') || '[]');
  const { groups, isLoading, isError, message } = useSelector(
    (state: RootState) => state.groups
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [userAssignmentOpen, setUserAssignmentOpen] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    dispatch(getGroups());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const openModal = (group: Group | null = null) => {
    const action = group ? 'update' : 'create';
    if (!hasPermission(permissions, 'Groups', action)) {
      toast.error(`You don't have permission to ${action} groups.`);
      return;
    }
    setCurrentGroup(group);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentGroup(null);
  };

  const handleSaveGroup = (groupData: Partial<Group>) => {
    const action = currentGroup ? 'update' : 'create';
    if (!hasPermission(permissions, 'Groups', action)) {
      toast.error(`You don't have permission to ${action} groups.`);
      return;
    }

    if (currentGroup) {
      dispatch(updateGroup({ ...currentGroup, ...groupData } as Group));
    } else {
      dispatch(createGroup(groupData as Group));
    }
    closeModal();
    setTimeout(() => {
      dispatch(getGroups());
    }, 300);
  };

  const openDeleteConfirmation = (groupId: number) => {
    if (!hasPermission(permissions, 'Groups', 'delete')) {
      toast.error("You don't have permission to delete groups.");
      return;
    }
    setConfirmDelete(groupId);
  };

  const handleDeleteGroup = (groupId: number) => {
    if (!hasPermission(permissions, 'Groups', 'delete')) {
      toast.error("You don't have permission to delete groups.");
      return;
    }
    dispatch(deleteGroup(groupId));
    setConfirmDelete(null);
  };

  const openUserAssignment = (group: Group) => {
    if (!hasPermission(permissions, 'Groups', 'update')) {
      toast.error("You don't have permission to assign users.");
      return;
    }
    setSelectedGroup(group);
    setUserAssignmentOpen(true);
  };

  const closeUserAssignment = () => {
    setUserAssignmentOpen(false);
    setSelectedGroup(null);
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Group Management</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Group
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
            <p>Loading groups...</p>
          </div>
        ) : groups.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {groups.map((group) => (
              <li key={group.id}>
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">Created: {formatDate(group.created_at)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openUserAssignment(group)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Manage Users
                      </button>
                      <button
                        onClick={() => openModal(group)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {group.users && group.users.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Users
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {group.users.map((user) => (
                          <span
                            key={user.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {user.username || `${user.first_name} ${user.last_name}` || user.email}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {group.roles && group.roles.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roles
                      </h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {group.roles.map((role) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {role.name}
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
            <p className="text-gray-500">No groups found. Create one to get started.</p>
          </div>
        )}
      </div>

      <GroupModal
        group={currentGroup}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveGroup}
      />

      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this group? This action cannot be undone.
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
                onClick={() => handleDeleteGroup(confirmDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {userAssignmentOpen && selectedGroup && (
        <GroupUserAssignment group={selectedGroup} onClose={closeUserAssignment} />
      )}
    </DashboardLayout>
  );
}

export default Groups;