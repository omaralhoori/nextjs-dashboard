'use client';

import { useState, useEffect, useCallback } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import {
  DataTable, TableSkeleton, PaginationBar,
  FilterBar, SearchInput, FilterSelect,
  StatusBadge, ActionBtn,
} from '@/app/ui/data-table';
import ItemGroupForm from '@/app/ui/item-groups/item-group-form';
import PermissionError from '@/app/ui/permission-error';
import {
  fetchItemGroupsAction,
  createItemGroupAction,
  updateItemGroupAction,
  deleteItemGroupAction,
  toggleItemGroupActiveAction,
} from '@/app/lib/functions/item-groups';
import type { ItemGroup, CreateItemGroupRequest, UpdateItemGroupRequest } from '@/app/lib/definitions/item-group';
import { formatDateToLocal } from '@/app/lib/utils';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function ItemGroupsPageClient() {
  const [items, setItems] = useState<ItemGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemGroup | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchItemGroupsAction();
    if ('error' in result) {
      setPermError(result.error);
    } else {
      setItems(result.itemGroups);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(item => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === 'active' && !item.active) return false;
    if (statusFilter === 'inactive' && item.active) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEdit = (item: ItemGroup) => { setEditingItem(item); setIsFormOpen(true); };
  const openCreate = () => { setEditingItem(null); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingItem(null); };

  const handleFormSubmit = async (data: CreateItemGroupRequest | UpdateItemGroupRequest) => {
    setFormLoading(true);
    const result = editingItem
      ? await updateItemGroupAction(editingItem.id, data)
      : await createItemGroupAction(data as CreateItemGroupRequest);
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
    if (!window.confirm('Delete this item group?')) return;
    const result = await deleteItemGroupAction(id);
    if (result.success) { setSuccessMsg(result.message); await load(); }
    else setErrorMsg(result.message);
  };

  const handleToggle = async (id: string) => {
    const result = await toggleItemGroupActiveAction(id);
    if (result.success) { setSuccessMsg(result.message); await load(); }
    else setErrorMsg(result.message);
  };

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row: ItemGroup) => <span className="font-medium text-gray-900">{row.name}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (row: ItemGroup) => (
        <span className="text-gray-600 text-sm truncate max-w-[280px] block">{row.description || '—'}</span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (row: ItemGroup) => <StatusBadge active={row.active} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row: ItemGroup) => <span className="text-xs text-gray-500">{formatDateToLocal(row.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row: ItemGroup) => (
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
      title="Item Groups"
      count={filtered.length}
      createLabel="New Item Group"
      onCreate={openCreate}
      successMessage={successMsg}
      errorMessage={errorMsg}
      onClearSuccess={() => setSuccessMsg(null)}
      onClearError={() => setErrorMsg(null)}
      filters={
        <FilterBar>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search name…" />
          <FilterSelect value={statusFilter} onChange={v => { setStatusFilter(v); setPage(1); }} label="Status" options={STATUS_OPTIONS} />
        </FilterBar>
      }
    >
      {loading ? (
        <TableSkeleton cols={5} rows={6} />
      ) : (
        <div className="space-y-3">
          <DataTable
            columns={columns}
            rows={pageItems}
            keyExtractor={r => r.id}
            emptyMessage="No item groups found"
            mobileCard={row => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900">{row.name}</div>
                    {row.description && <div className="text-xs text-gray-500 truncate">{row.description}</div>}
                  </div>
                  <StatusBadge active={row.active} />
                </div>
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
      <ItemGroupForm
        itemGroup={editingItem}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />
    </PageShell>
  );
}
