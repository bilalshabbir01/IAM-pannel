// src/components/groups/GroupUserAssignment.tsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers } from '../../features/users/usersSlice';
import { assignUserToGroup, removeUserFromGroup } from '../../features/groups/groupsSlice';
import { AppDispatch, RootState } from '../../store';
import { User, Group } from '../../types';

interface GroupUserAssignmentProps {
  group: Group;
  onClose: () => void;
}

const GroupUserAssignment = ({ group, onClose }: GroupUserAssignmentProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.users);
  const [selectedUser, setSelectedUser] = useState<number>(0);
  
  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  // Filter out users who are already in the group
  const availableUsers = users.filter(user => 
    !group.users?.some(groupUser => groupUser.id === user.id)
  );

  const handleAddUser = () => {
    if (selectedUser) {
      dispatch(assignUserToGroup({ groupId: group.id, userId: selectedUser }));
      setSelectedUser(0);
    }
  };

  const handleRemoveUser = (userId: number) => {
    dispatch(removeUserFromGroup({ groupId: group.id, userId }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Manage Users in {group.name}
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

        {/* Add User to Group */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Add User to Group
          </h4>
          <div className="flex space-x-2">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedUser}
              onChange={(e) => setSelectedUser(parseInt(e.target.value))}
            >
              <option value="0">Select a user</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username || `${user.first_name} ${user.last_name}` || user.email}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleAddUser}
              disabled={!selectedUser}
            >
              Add
            </button>
          </div>
        </div>

        {/* Current Users in Group */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Current Users in Group
          </h4>
          {group.users && group.users.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {group.users.map(user => {
                // Find full user details
                const fullUser = users.find(u => u.id === user.id);
                return (
                  <li key={user.id} className="py-3 flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {fullUser ? 
                        (fullUser.username || `${fullUser.first_name} ${fullUser.last_name}` || fullUser.email) : 
                        'Unknown User'}
                    </div>
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:text-red-800"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No users in this group yet.</p>
          )}
        </div>

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

export default GroupUserAssignment;