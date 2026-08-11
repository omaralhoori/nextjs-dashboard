'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  EyeIcon,
  UserPlusIcon,
  MapPinIcon,
  PencilIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import {
  DataTable, TableSkeleton, PaginationBar,
  FilterBar, SearchInput, FilterSelect,
  StatusBadge, ActionBtn,
} from '@/app/ui/data-table';
import PermissionError from '@/app/ui/permission-error';
import WarehouseDetailsModal from '@/app/ui/warehouses/warehouse-details-modal';
import EditWarehouseForm from '@/app/ui/warehouses/edit-warehouse-form';
import {
  fetchWarehousesAction,
  updateWarehouseAction,
  toggleWarehouseStatusAction,
} from '@/app/lib/functions/warehouse';
import type { Warehouse, UpdateWarehouseRequest } from '@/app/lib/definitions/warehouse';
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
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalWarehouse, setModalWarehouse] = useState<{ id: string; name: string } | null>(null);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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

  const showTemp = (setter: (v: string | null) => void, msg: string) => {
    setter(msg);
    setTimeout(() => setter(null), 3500);
  };

  const handleEditSubmit = async (data: UpdateWarehouseRequest, imageFile?: File) => {
    if (!editingWarehouse) return;
    setFormLoading(true);
    setErrorMsg(null);
    const result = await updateWarehouseAction(editingWarehouse.id, data, imageFile);
    setFormLoading(false);
    if (!result.success) {
      showTemp(setErrorMsg, result.message);
      return;
    }
    showTemp(setSuccessMsg, result.message);
    setEditingWarehouse(null);
    await load();
  };

  const handleToggle = async (warehouse: Warehouse) => {
    setErrorMsg(null);
    const result = await toggleWarehouseStatusAction(warehouse.id);
    if (!result.success) {
      showTemp(setErrorMsg, result.message);
      return;
    }
    showTemp(setSuccessMsg, result.message);
    await load();
  };

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  const columns = [
    {
      key: 'name',
      header: 'Warehouse',
      render: (row: Warehouse) => (
        <div className="flex items-center gap-3">
          {row.imageUrl ? (
            <div className="relative h-9 w-9 rounded overflow-hidden bg-gray-100 shrink-0">
              <Image src={row.imageUrl} alt="" fill className="object-cover" unoptimized />
            </div>
          ) : null}
          <button
            onClick={() => setModalWarehouse({ id: row.id, name: row.warehouse_name })}
            className="font-medium text-[#007476] hover:underline text-left"
          >
            {row.warehouse_name}
          </button>
        </div>
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
          <ActionBtn
            variant="edit"
            icon={<PencilIcon className="h-4 w-4" />}
            label="Edit Warehouse"
            onClick={() => setEditingWarehouse(row)}
          />
          <ActionBtn
            variant={row.status === 'enabled' ? 'toggle-on' : 'toggle-off'}
            icon={row.status === 'enabled' ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            label={row.status === 'enabled' ? 'Disable Warehouse' : 'Enable Warehouse'}
            onClick={() => handleToggle(row)}
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
      {successMsg && (
        <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMsg}
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
            emptyMessage="No warehouses found"
            mobileCard={row => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-2">
                    {row.imageUrl ? (
                      <div className="relative h-8 w-8 rounded overflow-hidden bg-gray-100 shrink-0">
                        <Image src={row.imageUrl} alt="" fill className="object-cover" unoptimized />
                      </div>
                    ) : null}
                    <div>
                      <button
                        onClick={() => setModalWarehouse({ id: row.id, name: row.warehouse_name })}
                        className="font-medium text-[#007476] hover:underline text-left"
                      >
                        {row.warehouse_name}
                      </button>
                      <div className="text-xs text-gray-500">{row.phone} · {row.district}</div>
                    </div>
                  </div>
                  <StatusBadge active={row.status === 'enabled'} activeLabel="Enabled" inactiveLabel="Disabled" />
                </div>
                <div className="text-xs text-gray-500">{row.location}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDateToLocal(row.createdAt)}</span>
                  <div className="flex gap-1">
                    <ActionBtn variant="view" icon={<EyeIcon className="h-4 w-4" />} label="View" onClick={() => setModalWarehouse({ id: row.id, name: row.warehouse_name })} />
                    <ActionBtn variant="edit" icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => setEditingWarehouse(row)} />
                    <ActionBtn
                      variant={row.status === 'enabled' ? 'toggle-on' : 'toggle-off'}
                      icon={row.status === 'enabled' ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      label={row.status === 'enabled' ? 'Disable' : 'Enable'}
                      onClick={() => handleToggle(row)}
                    />
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
      <EditWarehouseForm
        warehouse={editingWarehouse}
        isOpen={!!editingWarehouse}
        onClose={() => setEditingWarehouse(null)}
        onSubmit={handleEditSubmit}
        loading={formLoading}
      />
    </PageShell>
  );
}
