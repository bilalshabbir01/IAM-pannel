// src/pages/Dashboard.tsx
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserPermissions } from '../features/auth/authSlice';
import { AppDispatch, RootState } from '../store';
import DashboardLayout from '../components/layouts/DashboardLayout';
import axios from '../api/axios';
import { SimulationResult } from '../types';

// Updated Permission interface to match the new structure
interface Permission {
  action: string;
  module: string;
}

// Updated SimulationRequest interface
interface SimulationRequest {
  module: string;
  action: string;
}

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, permissions, isLoading } = useSelector((state: RootState) => state.auth);
  
  const [simulationData, setSimulationData] = useState<SimulationRequest>({
    module: '',
    action: 'read'
  });
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [simulationLoading, setSimulationLoading] = useState<boolean>(false);
  const [availableActions] = useState<('create' | 'read' | 'update' | 'delete')[]>(['create', 'read', 'update', 'delete']);

  useEffect(() => {
    dispatch(getUserPermissions());
  }, [dispatch]);

  const handleSimulationChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSimulationData({
      ...simulationData,
      [e.target.name]: e.target.value
    });
  };

  const handleSimulationSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSimulationLoading(true);
  
    try {
      const response = await axios.post('/api/permissions/simulate-action', {
        module: simulationData.module,
        action: simulationData.action,
      });
  
      const allowed = response.data.allowed;
  
      setSimulationResult({
        success: allowed,
        message: allowed
          ? `✅ You are allowed to ${simulationData.action} ${simulationData.module}`
          : `⛔ You are NOT allowed to ${simulationData.action} ${simulationData.module}`,
      });
    } catch (error: any) {
      setSimulationResult({
        success: false,
        message: error.response?.data?.message || 'Something went wrong!',
      });
    } finally {
      setSimulationLoading(false);
    }
  };
  
  // Group permissions by module for display with new structure
  const groupedPermissions = permissions ? permissions.reduce((acc: Record<string, string[]>, permission: Permission) => {
    const moduleName = permission.module || 'Unknown';
    if (!acc[moduleName]) {
      acc[moduleName] = [];
    }
    acc[moduleName].push(permission.action);
    return acc;
  }, {}) : {};

  // Get action color based on action type
  const getActionColor = (action: string) => {
    switch(action) {
      case 'create':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'read':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'update':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'delete':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800">Welcome to IAM Dashboard</h2>
          <p className="mt-2 text-gray-600">
            Manage and view your permissions across different modules.
          </p>
          {user && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-blue-800">Logged in as: <span className="font-semibold">{user?.user?.username}</span></p>
              <p className="text-sm text-blue-600">{user.email}</p>
            </div>
          )}
        </section>

        {/* Permissions Section */}
        <section className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Permissions</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : permissions && permissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Module
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Permissions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(groupedPermissions).map(([moduleName, actions], index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {moduleName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {actions.map((action, i) => {
                            const colors = getActionColor(action);
                            return (
                              <span 
                                key={i} 
                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${colors.bg} ${colors.text}`}
                              >
                                {action}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions found</h3>
              <p className="mt-1 text-sm text-gray-500">You might need to be assigned to a group with permissions.</p>
            </div>
          )}
        </section>

        {/* Action Simulation Section */}
        <section className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Simulate Action</h3>
          <p className="text-gray-600 mb-4">Test if you have permission to perform a specific action on a module.</p>
          
          <form onSubmit={handleSimulationSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="module" className="block text-sm font-medium text-gray-700 mb-1">
                  Module
                </label>
                <select
                  id="module"
                  name="module"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={simulationData.module}
                  onChange={handleSimulationChange}
                  required
                >
                  <option value="">Select a module</option>
                  <option value="Users">Users</option>
                  <option value="Groups">Groups</option>
                  <option value="Permissions">Permissions</option>
                  <option value="Roles">Roles</option>
                  <option value="Modules">Modules</option>
                </select>
              </div>
              <div>
                <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
                  Action
                </label>
                <select
                  id="action"
                  name="action"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={simulationData.action}
                  onChange={handleSimulationChange}
                  required
                >
                  <option value="">Select an action</option>
                  {availableActions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={simulationLoading}
              >
                {simulationLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Testing...
                  </>
                ) : 'Test Permission'}
              </button>
            </div>

            {simulationResult && (
              <div className={`mt-4 p-4 rounded-md ${simulationResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {simulationResult.success ? (
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-sm font-medium ${simulationResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {simulationResult.success ? 'Allowed' : 'Denied'}
                    </h3>
                    <div className={`mt-2 text-sm ${simulationResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      <p>{simulationResult.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;