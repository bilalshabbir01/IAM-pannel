// src/components/common/Navbar.tsx
import { useState } from 'react';
import { User } from '../../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

function Navbar({ user, onLogout }: NavbarProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);

  return (
    <header className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <h1 className="text-lg font-semibold text-gray-800">IAM Access Control System</h1>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      {user && user.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </button>
                </div>
                {profileDropdownOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    {user && (
                      <div className="px-4 py-2 text-sm text-gray-700">
                        <div>{`${user.first_name} ${user.last_name}`}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    )}
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={onLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;