'use client';

import { useState, useEffect, useCallback } from 'react';
import { EyeIcon, UserPlusIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import PageShell from '@/app/ui/page-shell';
import {
  DataTable, TableSkeleton, PaginationBar,
  FilterBar, SearchInput, FilterSelect,
  StatusBadge, ActionBtn,
} from '@/app/ui/data-table';
import PermissionError from '@/app/ui/permission-error';
import WarehouseDetailsModal from '@/app/ui/warehouses/warehouse-details-modal';
import { fetchWarehousesAction } from '@/app/lib/functions/warehouse';
import type { Warehouse } from '@/app/lib/definitions/warehouse';
import { formatDateToLocal } from '@/app/lib/utils';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Disabled' },
];

export default function WarehousesPageClient() {
  const [items, setItems] = useState<Warehouse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalWarehouse, setModalWarehouse] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchWarehousesAction(page, PAGE_SIZE, {
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
    });
    if ('error' in result) {
      setPermError(result.error);
    } else {
      setItems(result.warehouses);
      setTotal(result.pagination.total);
    }
    setLoading(false);
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const resetPage = (setter: (v: string) => void) => (v: string) => { setter(v); setPage(1); };

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  const columns = [
    {
      key: 'name',
      header: 'Warehouse',
      render: (row: Warehouse) => (
        <button
          onClick={() => setModalWarehouse({ id: row.id, name: row.warehouse_name })}
          className="font-medium text-[#007476] hover:underline text-left"
        >
          {row.warehouse_name}
        </button>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row: Warehouse) => <span className="text-sm text-gray-600">{row.phone}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      render: (row: Warehouse) => <span className="text-sm text-gray-600">{row.location}</span>,
    },
    {
      key: 'district',
      header: 'District',
      render: (row: Warehouse) => <span className="text-sm text-gray-600">{row.district}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Warehouse) => <StatusBadge active={row.status === 'enabled'} activeLabel="Enabled" inactiveLabel="Disabled" />,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row: Warehouse) => <span className="text-xs text-gray-500">{formatDateToLocal(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row: Warehouse) => (
        <div className="flex justify-end gap-1">
          <ActionBtn
            variant="view"
            icon={<EyeIcon className="h-4 w-4" />}
            label="View Details"
            onClick={() => setModalWarehouse({ id: row.id, name: row.warehouse_name })}
          />
          <Link href={`/dashboard/warehouses/managers/create?warehouseId=${row.id}`}>
            <ActionBtn variant="toggle-off" icon={<UserPlusIcon className="h-4 w-4" />} label="Add Manager" />
          </Link>
          <ActionBtn
            variant="view"
            icon={<MapPinIcon className="h-4 w-4" />}
            label="Manage Districts"
            onClick={() => setModalWarehouse({ id: row.id, name: row.warehouse_name })}
          />
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Warehouses"
      count={total}
      createLabel="New Warehouse"
      onCreate={() => { window.location.href = '/dashboard/warehouses/create'; }}
      filters={
        <FilterBar>
          <SearchInput
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder="Search name or location…"
          />
          <FilterSelect value={statusFilter} onChange={resetPage(setStatusFilter)} label="Status" options={STATUS_OPTIONS} />
        </FilterBar>
      }
    >
      {loading ? (
        <TableSkeleton cols={7} rows={6} />
      ) : (
        <div className="space-y-3">
          <DataTable
            columns={columns}
            rows={items}
            keyExtractor={r => r.id}
            emptyMessage="No warehouses found"
            mobileCard={row => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <button
                      onClick={() => setModalWarehouse({ id: row.id, name: row.warehouse_name })}
                      className="font-medium text-[#007476] hover:underline text-left"
                    >
                      {row.warehouse_name}
                    </button>
                    <div className="text-xs text-gray-500">{row.phone} · {row.district}</div>
                  </div>
                  <StatusBadge active={row.status === 'enabled'} activeLabel="Enabled" inactiveLabel="Disabled" />
                </div>
                <div className="text-xs text-gray-500">{row.location}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDateToLocal(row.createdAt)}</span>
                  <div className="flex gap-1">
                    <ActionBtn variant="view" icon={<EyeIcon className="h-4 w-4" />} label="View" onClick={() => setModalWarehouse({ id: row.id, name: row.warehouse_name })} />
                    <Link href={`/dashboard/warehouses/managers/create?warehouseId=${row.id}`}>
                      <ActionBtn variant="toggle-off" icon={<UserPlusIcon className="h-4 w-4" />} label="Add Manager" />
                    </Link>
                  </div>
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
      <WarehouseDetailsModal
        warehouseId={modalWarehouse?.id ?? null}
        warehouseName={modalWarehouse?.name ?? ''}
        isOpen={!!modalWarehouse}
        onClose={() => setModalWarehouse(null)}
      />
    </PageShell>
  );
}
