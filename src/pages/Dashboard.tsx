// src/pages/Dashboard.tsx
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserPermissions } from '../features/auth/authSlice';
import { AppDispatch, RootState } from '../store';
import DashboardLayout from '../components/layouts/DashboardLayout';
import axios from '../api/axios';
import { SimulationRequest, SimulationResult, Permission, Module } from '../types';

function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, permissions, isLoading } = useSelector((state: RootState) => state.auth);
  const { modules } = useSelector((state: RootState) => state.modules);
  
  const [simulationData, setSimulationData] = useState<SimulationRequest>({
    module_id: 0,
    action: 'read'
  });
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [simulationLoading, setSimulationLoading] = useState<boolean>(false);
  const [availableActions] = useState<('create' | 'read' | 'update' | 'delete')[]>(['create', 'read', 'update', 'delete']);

  useEffect(() => {
    dispatch(getUserPermissions());
  }, [dispatch]);

  const handleSimulationChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.name === 'module_id' ? parseInt(e.target.value) : e.target.value;
    
    setSimulationData({
      ...simulationData,
      [e.target.name]: value as any
    });
  };

  const handleSimulationSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSimulationLoading(true);
    try {
      const response = await axios.post('/api/permissions/simulate-action', simulationData);
      setSimulationResult({
        success: true,
        message: response.data.message || 'Action is permitted'
      });
    } catch (error: any) {
      setSimulationResult({
        success: false,
        message: error.response?.data?.message || 'Action not permitted'
      });
    } finally {
      setSimulationLoading(false);
    }
  };

  // Helper function to get module name from ID
  const getModuleName = (moduleId: number): string => {
    const module = modules.find(m => m.id === moduleId);
    return module ? module.name : 'Unknown';
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
              <p className="text-blue-800">Logged in as: <span className="font-semibold">{user.user.username}</span></p>
              <p className="text-sm text-blue-600">{user.email}</p>
            </div>
          )}
        </section>

        {/* Permissions Section */}
        <section className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Permissions</h3>
          
          {isLoading ? (
            <div className="text-center py-4">
              <p>Loading permissions...</p>
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
                  {/* Group permissions by module */}
                  {Object.entries(
                    permissions.reduce((acc: Record<number, string[]>, permission: Permission) => {
                      if (!acc[permission.module_id]) {
                        acc[permission.module_id] = [];
                      }
                      acc[permission.module_id].push(permission.action);
                      return acc;
                    }, {})
                  ).map(([moduleId, actions], index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getModuleName(parseInt(moduleId))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {actions.map((action, i) => (
                            <span 
                              key={i} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              {action}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No permissions found. You might need to be assigned to a group.</p>
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
                <label htmlFor="module_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Module
                </label>
                <select
                  id="module_id"
                  name="module_id"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={simulationData.module_id}
                  onChange={handleSimulationChange}
                  required
                >
                  <option value="">Select a module</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
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
                {simulationLoading ? 'Testing...' : 'Test Permission'}
              </button>
            </div>

            {simulationResult && (
              <div className={`mt-4 p-4 rounded-md ${simulationResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="font-medium">{simulationResult.success ? 'Allowed' : 'Denied'}</p>
                <p className="text-sm">{simulationResult.message}</p>
              </div>
            )}
          </form>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;