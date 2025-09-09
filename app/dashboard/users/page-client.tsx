'use client';

import { useState } from 'react';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import UsersTable from '@/app/ui/users/users-table';
import CreateAdminUserForm from '@/app/ui/users/create-admin-user-form';
import Pagination from '@/app/ui/pagination';
import type { User, UsersResponse } from '@/app/lib/definitions/user';

interface UsersPageClientProps {
  usersData: UsersResponse;
  currentPage: number;
}

export default function UsersPageClient({ usersData, currentPage }: UsersPageClientProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [users, setUsers] = useState(usersData.users);
  const [pagination, setPagination] = useState(usersData.pagination);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    // Refresh the page to get updated data
    window.location.reload();
  };

  const handleCreateCancel = () => {
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage system users and their roles
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{pagination.total}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Create Admin
            </button>
          </div>
        </div>
      </div>

      {/* Create Admin Form */}
      {showCreateForm && (
        <CreateAdminUserForm
          onSuccess={handleCreateSuccess}
          onCancel={handleCreateCancel}
        />
      )}

      {/* Users Table */}
      <UsersTable users={users} />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white shadow rounded-lg p-6">
          <Pagination 
            totalPages={pagination.totalPages}
            currentPage={currentPage}
          />
        </div>
      )}
    </div>
  );
}
