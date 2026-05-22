'use client';

import { useState, useEffect, useCallback } from 'react';
import { PhoneIcon, PowerIcon } from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import {
  DataTable, TableSkeleton, PaginationBar,
  FilterBar, SearchInput, FilterSelect,
  StatusBadge, RoleBadge, ActionBtn,
} from '@/app/ui/data-table';
import CreateAdminUserForm from '@/app/ui/users/create-admin-user-form';
import PermissionError from '@/app/ui/permission-error';
import { fetchUsersAction, enableUserAction, disableUserAction } from '@/app/lib/functions/users';
import type { User } from '@/app/lib/definitions/user';
import { formatDateToLocal } from '@/app/lib/utils';

const PAGE_SIZE = 20;

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'warehouse_manager', label: 'Warehouse Manager' },
  { value: 'warehouse_user', label: 'Warehouse User' },
  { value: 'pharmacy_manager', label: 'Pharmacy Manager' },
  { value: 'pharmacy_user', label: 'Pharmacy User' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Disabled' },
];

export default function UsersPageClient() {
  const [items, setItems] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchUsersAction({
      search: search || undefined,
      role: roleFilter || undefined,
      enabled: statusFilter === 'enabled' ? true : statusFilter === 'disabled' ? false : undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      orderBy: 'userName',
      orderDirection: 'ASC',
    });
    if ('error' in result) {
      setPermError(result.error);
    } else {
      setItems(result.users);
      setTotal(result.pagination.total);
    }
    setLoading(false);
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  const handleToggle = async (user: User) => {
    setTogglingId(user.id);
    const result = user.enabled
      ? await disableUserAction(user.id)
      : await enableUserAction(user.id);
    if (result.success) {
      setSuccessMsg(result.message);
      await load();
    } else {
      setErrorMsg(result.message);
    }
    setTogglingId(null);
  };

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (row: User) => (
        <div>
          <div className="font-medium text-gray-900">{row.userName}</div>
          <div className="text-xs text-gray-400 font-mono">{row.id.slice(0, 8)}…</div>
        </div>
      ),
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (row: User) => (
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <PhoneIcon className="h-3.5 w-3.5 text-gray-400" />
          {row.mobileNo}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row: User) => <RoleBadge role={row.role} />,
    },
    {
      key: 'assignment',
      header: 'Assignment',
      render: (row: User) => (
        <span className="text-sm text-gray-600">
          {row.warehouseId ? 'Warehouse' : row.pharmacyId ? 'Pharmacy' : <span className="text-gray-400">—</span>}
        </span>
      ),
    },
    {
      key: 'enabled',
      header: 'Status',
      render: (row: User) => <StatusBadge active={row.enabled} activeLabel="Enabled" inactiveLabel="Disabled" />,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row: User) => <span className="text-xs text-gray-500">{formatDateToLocal(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row: User) => (
        <ActionBtn
          variant={row.enabled ? 'toggle-on' : 'toggle-off'}
          icon={<PowerIcon className="h-4 w-4" />}
          label={row.enabled ? 'Disable' : 'Enable'}
          onClick={() => handleToggle(row)}
          disabled={togglingId === row.id}
        />
      ),
    },
  ];

  return (
    <PageShell
      title="Users"
      subtitle="Manage system users and their roles"
      count={total}
      createLabel="Create Admin"
      onCreate={() => setShowCreateForm(true)}
      successMessage={successMsg}
      errorMessage={errorMsg}
      onClearSuccess={() => setSuccessMsg(null)}
      onClearError={() => setErrorMsg(null)}
      filters={
        <FilterBar>
          <SearchInput value={search} onChange={handleFilterChange(setSearch)} placeholder="Search by name or mobile…" />
          <FilterSelect value={roleFilter} onChange={handleFilterChange(setRoleFilter)} label="Role" options={ROLE_OPTIONS} />
          <FilterSelect value={statusFilter} onChange={handleFilterChange(setStatusFilter)} label="Status" options={STATUS_OPTIONS} />
        </FilterBar>
      }
    >
      {showCreateForm && (
        <div className="mb-4">
          <CreateAdminUserForm
            onSuccess={() => { setShowCreateForm(false); load(); }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {loading ? (
        <TableSkeleton cols={7} rows={6} />
      ) : (
        <div className="space-y-3">
          <DataTable
            columns={columns}
            rows={items}
            keyExtractor={r => r.id}
            emptyMessage="No users found"
            mobileCard={row => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900">{row.userName}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <PhoneIcon className="h-3 w-3" />{row.mobileNo}
                    </div>
                  </div>
                  <StatusBadge active={row.enabled} activeLabel="Enabled" inactiveLabel="Disabled" />
                </div>
                <div className="flex items-center justify-between">
                  <RoleBadge role={row.role} />
                  <ActionBtn
                    variant={row.enabled ? 'toggle-on' : 'toggle-off'}
                    icon={<PowerIcon className="h-4 w-4" />}
                    label={row.enabled ? 'Disable' : 'Enable'}
                    onClick={() => handleToggle(row)}
                    disabled={togglingId === row.id}
                  />
                </div>
              </div>
            )}
          />
          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </PageShell>
  );
}
