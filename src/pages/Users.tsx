// src/pages/Users.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  reset,
} from '../features/users/usersSlice';
import { AppDispatch, RootState } from '../store';
import DashboardLayout from '../components/layouts/DashboardLayout';
import UserModal from '../components/users/UserModal';
import { User } from '../types';
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

function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const rawPermissions = useSelector((state: RootState) => state.auth.permissions);
  const permissions = rawPermissions && rawPermissions.length > 0
    ? rawPermissions
    : JSON.parse(localStorage.getItem('permissions') || '[]');
  const { users, isLoading, isError, message } = useSelector(
    (state: RootState) => state.users
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getUsers());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const openModal = (user: User | null = null) => {
    const action = user ? 'update' : 'create';
    if (!hasPermission(permissions, 'Users', action)) {
      toast.error(`You don't have permission to ${action} users.`);
      return;
    }
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleSaveUser = (userData: Partial<User>) => {
    const action = currentUser ? 'update' : 'create';
    if (!hasPermission(permissions, 'Users', action)) {
      toast.error(`You don't have permission to ${action} users.`);
      return;
    }
    if (currentUser) {
      dispatch(updateUser({ ...currentUser, ...userData } as User));
    } else {
      dispatch(createUser(userData as User));
    }
    closeModal();
  };

  const openDeleteConfirmation = (userId: number) => {
    if (!hasPermission(permissions, 'Users', 'delete')) {
      toast.error("You don't have permission to delete users.");
      return;
    }
    setConfirmDelete(userId);
  };

  const handleDeleteUser = (userId: number) => {
    if (!hasPermission(permissions, 'Users', 'delete')) {
      toast.error("You don't have permission to delete users.");
      return;
    }
    dispatch(deleteUser(userId));
    setConfirmDelete(null);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
        {
          hasPermission(permissions, 'Permissions', "create") &&
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={!hasPermission(permissions, 'Users', 'create')}
          >
            Add User
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
            <p>Loading users...</p>
          </div>
        ) : users.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id}>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : user.username || 'No Name'}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">Username: {user.username}</p>
                  </div>
                  <div className="flex space-x-2">
                    {
                      hasPermission(permissions, 'Permissions', "update") &&
                      <button
                        onClick={() => {
                          if (!hasPermission(permissions, 'Users', 'update')) {
                            toast.error("⛔ You don't have permission to edit users.");
                            return;
                          }
                          openModal(user);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    }
                    {
                      hasPermission(permissions, 'Permissions', "delete") &&
                      <button
                        onClick={() => {
                          if (!hasPermission(permissions, 'Users', 'delete')) {
                            toast.error("⛔ You don't have permission to delete users.");
                            return;
                          }
                          openDeleteConfirmation(user.id);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    }

                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">No users found. Create one to get started.</p>
          </div>
        )}
      </div>

      <UserModal
        user={currentUser}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveUser}
      />

      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this user? This action cannot be undone.
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
                onClick={() => handleDeleteUser(confirmDelete)}
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

export default Users;