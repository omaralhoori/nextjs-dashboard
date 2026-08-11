'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import {
  DataTable, TableSkeleton, PaginationBar,
  FilterBar, SearchInput, FilterSelect,
  StatusBadge, ActionBtn,
} from '@/app/ui/data-table';
import ManufacturerForm from '@/app/ui/manufacturers/manufacturer-form';
import PermissionError from '@/app/ui/permission-error';
import {
  fetchManufacturersAction,
  createManufacturerAction,
  updateManufacturerAction,
  deleteManufacturerAction,
  toggleManufacturerActiveAction,
} from '@/app/lib/functions/manufacturers';
import type { Manufacturer, CreateManufacturerRequest, UpdateManufacturerRequest } from '@/app/lib/definitions/manufacturer';
import { formatDateToLocal } from '@/app/lib/utils';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function ManufacturersPageClient() {
  const [items, setItems] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Manufacturer | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchManufacturersAction();
    if ('error' in result) {
      setPermError(result.error);
    } else {
      setItems(result.manufacturers);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(item => {
    if (search) {
      const q = search.toLowerCase();
      const nameMatch = item.name?.toLowerCase().includes(q);
      const codeMatch = item.code?.toLowerCase().includes(q);
      if (!nameMatch && !codeMatch) return false;
    }
    if (statusFilter === 'active' && !item.active) return false;
    if (statusFilter === 'inactive' && item.active) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEdit = (item: Manufacturer) => { setEditingItem(item); setIsFormOpen(true); };
  const openCreate = () => { setEditingItem(null); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingItem(null); };

  const handleFormSubmit = async (data: CreateManufacturerRequest | UpdateManufacturerRequest, imageFile?: File) => {
    setFormLoading(true);
    const result = editingItem
      ? await updateManufacturerAction(editingItem.id, data, imageFile)
      : await createManufacturerAction(data as CreateManufacturerRequest, imageFile);
    if (result.success) {
      setSuccessMsg(result.message);
      closeForm();
      await load();
    } else {
      setErrorMsg(result.message);
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this manufacturer?')) return;
    const result = await deleteManufacturerAction(id);
    if (result.success) { setSuccessMsg(result.message); await load(); }
    else setErrorMsg(result.message);
  };

  const handleToggle = async (id: string) => {
    const result = await toggleManufacturerActiveAction(id);
    if (result.success) { setSuccessMsg(result.message); await load(); }
    else setErrorMsg(result.message);
  };

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row: Manufacturer) => (
        <div className="flex items-center gap-3">
          {row.imageUrl ? (
            <div className="w-9 h-9 rounded-md overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
              <Image
                src={row.imageUrl}
                alt={row.name}
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-md bg-gray-100 flex-shrink-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-400">
                {(row.code || row.name || '?').slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            {row.description && <div className="text-xs text-gray-400 truncate max-w-[180px]">{row.description}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      render: (row: Manufacturer) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{row.code || '—'}</span>
      ),
    },
    {
      key: 'country',
      header: 'Country',
      render: (row: Manufacturer) => <span className="text-gray-700">{row.country || '—'}</span>,
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (row: Manufacturer) => (
        <div className="text-xs space-y-0.5">
          {row.email && <div className="text-gray-600">{row.email}</div>}
          {row.phone && <div className="text-gray-400">{row.phone}</div>}
          {!row.email && !row.phone && <span className="text-gray-300">—</span>}
        </div>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (row: Manufacturer) => <StatusBadge active={row.active} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row: Manufacturer) => <span className="text-xs text-gray-500">{formatDateToLocal(row.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row: Manufacturer) => (
        <div className="flex justify-end gap-1">
          <ActionBtn variant="edit" icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => openEdit(row)} />
          <ActionBtn
            variant={row.active ? 'toggle-on' : 'toggle-off'}
            icon={row.active ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            label={row.active ? 'Deactivate' : 'Activate'}
            onClick={() => handleToggle(row.id)}
          />
          <ActionBtn variant="delete" icon={<TrashIcon className="h-4 w-4" />} label="Delete" onClick={() => handleDelete(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Manufacturers"
      count={filtered.length}
      createLabel="New Manufacturer"
      onCreate={openCreate}
      successMessage={successMsg}
      errorMessage={errorMsg}
      onClearSuccess={() => setSuccessMsg(null)}
      onClearError={() => setErrorMsg(null)}
      filters={
        <FilterBar>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search name or code…" />
          <FilterSelect value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} label="Status" options={STATUS_OPTIONS} />
        </FilterBar>
      }
    >
      {loading ? (
        <TableSkeleton cols={7} rows={6} />
      ) : (
        <div className="space-y-3">
          <DataTable
            columns={columns}
            rows={pageItems}
            keyExtractor={r => r.id}
            emptyMessage="No manufacturers found"
            mobileCard={row => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {row.imageUrl ? (
                      <div className="w-9 h-9 rounded-md overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                        <Image src={row.imageUrl} alt={row.name} width={36} height={36} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-md bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-400">
                          {(row.code || row.name || '?').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900">{row.name}</div>
                      <div className="text-xs text-gray-500">{row.code || '—'} · {row.country || '—'}</div>
                    </div>
                  </div>
                  <StatusBadge active={row.active} />
                </div>
                {(row.email || row.phone) && (
                  <div className="text-xs text-gray-500">{row.email || row.phone}</div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDateToLocal(row.created_at)}</span>
                  <div className="flex gap-1">
                    <ActionBtn variant="edit" icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => openEdit(row)} />
                    <ActionBtn
                      variant={row.active ? 'toggle-on' : 'toggle-off'}
                      icon={row.active ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      label={row.active ? 'Deactivate' : 'Activate'}
                      onClick={() => handleToggle(row.id)}
                    />
                    <ActionBtn variant="delete" icon={<TrashIcon className="h-4 w-4" />} label="Delete" onClick={() => handleDelete(row.id)} />
                  </div>
                </div>
              </div>
            )}
          />
          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
      <ManufacturerForm
        manufacturer={editingItem}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />
    </PageShell>
  );
}
