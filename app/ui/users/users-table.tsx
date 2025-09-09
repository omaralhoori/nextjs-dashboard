'use client';

import { useState } from 'react';
import { 
  UserIcon, 
  PhoneIcon, 
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  PowerIcon
} from '@heroicons/react/24/outline';
import { enableUserAction, disableUserAction } from '@/app/lib/actions';
import type { User } from '@/app/lib/definitions/user';

interface UsersTableProps {
  users: User[];
  loading?: boolean;
}

export default function UsersTable({ users, loading = false }: UsersTableProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [togglingUsers, setTogglingUsers] = useState<Set<string>>(new Set());
  const [toggleError, setToggleError] = useState<string | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <UserIcon className="h-4 w-4 text-purple-600" />;
      case 'warehouse_manager':
      case 'warehouse_user':
        return <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />;
      case 'pharmacy_manager':
      case 'pharmacy_user':
        return <BuildingStorefrontIcon className="h-4 w-4 text-green-600" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'warehouse_manager':
        return 'bg-blue-100 text-blue-800';
      case 'warehouse_user':
        return 'bg-blue-50 text-blue-700';
      case 'pharmacy_manager':
        return 'bg-green-100 text-green-800';
      case 'pharmacy_user':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRole = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleToggleUser = async (userId: string, currentStatus: boolean) => {
    setTogglingUsers(prev => new Set(prev).add(userId));
    setToggleError(null);

    try {
      const result = currentStatus 
        ? await disableUserAction(userId)
        : await enableUserAction(userId);

      if (result.success) {
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        setToggleError(result.message);
      }
    } catch (error) {
      console.error('Error toggling user:', error);
      setToggleError('An unexpected error occurred');
    } finally {
      setTogglingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const filteredUsers = users.filter(user => {
    if (selectedRole && user.role !== selectedRole) return false;
    if (selectedStatus === 'enabled' && !user.enabled) return false;
    if (selectedStatus === 'disabled' && user.enabled) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role-filter"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="warehouse_manager">Warehouse Manager</option>
              <option value="warehouse_user">Warehouse User</option>
              <option value="pharmacy_manager">Pharmacy Manager</option>
              <option value="pharmacy_user">Pharmacy User</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRoleIcon(user.role)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {formatRole(user.role)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {user.mobileNo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.warehouseId ? (
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 text-blue-500 mr-1" />
                        Warehouse
                      </div>
                    ) : user.pharmacyId ? (
                      <div className="flex items-center">
                        <BuildingStorefrontIcon className="h-4 w-4 text-green-500 mr-1" />
                        Pharmacy
                      </div>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.enabled ? (
                        <>
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm text-green-600">Enabled</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-sm text-red-600">Disabled</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleToggleUser(user.id, user.enabled)}
                      disabled={togglingUsers.has(user.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        user.enabled
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {togglingUsers.has(user.id) ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                          {user.enabled ? 'Disabling...' : 'Enabling...'}
                        </>
                      ) : (
                        <>
                          <PowerIcon className="h-3 w-3 mr-1" />
                          {user.enabled ? 'Disable' : 'Enable'}
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Toggle Error Message */}
        {toggleError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{toggleError}</p>
              </div>
            </div>
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {users.length === 0 ? 'No users available.' : 'Try adjusting your filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
