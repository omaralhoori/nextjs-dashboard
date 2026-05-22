'use client';

import { useEffect, useState, useCallback } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import {
  DataTable, TableSkeleton, PaginationBar,
  FilterBar, SearchInput, ActionBtn,
} from '@/app/ui/data-table';
import StateForm from '@/app/ui/address/state-form';
import PermissionError from '@/app/ui/permission-error';
import {
  fetchStatesAction,
  createStateAction,
  updateStateAction,
  deleteStateAction,
} from '@/app/lib/functions/address';
import type { State } from '@/app/lib/definitions/address';
import { formatDateToLocal } from '@/app/lib/utils';

const PAGE_SIZE = 20;

export default function StatesPageClient() {
  const [items, setItems] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<State | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchStatesAction();
    if ('error' in result) {
      setPermError(result.error as string);
    } else {
      setItems(result.states);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(item =>
    !search || item.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEdit = (item: State) => { setEditingItem(item); setIsFormOpen(true); };
  const openCreate = () => { setEditingItem(null); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingItem(null); };

  const handleSubmit = async (payload: { name: string }) => {
    setFormLoading(true);
    const result = editingItem
      ? await updateStateAction(editingItem.id, payload)
      : await createStateAction(payload);
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
    if (!window.confirm('Delete this state?')) return;
    const result = await deleteStateAction(id);
    if (result.success) { setSuccessMsg(result.message); await load(); }
    else setErrorMsg(result.message);
  };

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  const columns = [
    {
      key: 'name',
      header: 'State Name',
      render: (row: State) => <span className="font-medium text-gray-900">{row.name}</span>,
    },
    {
      key: 'cities',
      header: 'Cities',
      render: (row: State) => (
        <span className="text-sm text-gray-600">{row.citiesCount ?? '—'}</span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row: State) => <span className="text-xs text-gray-500">{formatDateToLocal(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row: State) => (
        <div className="flex justify-end gap-1">
          <ActionBtn variant="edit" icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => openEdit(row)} />
          <ActionBtn variant="delete" icon={<TrashIcon className="h-4 w-4" />} label="Delete" onClick={() => handleDelete(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="States"
      count={filtered.length}
      createLabel="New State"
      onCreate={openCreate}
      successMessage={successMsg}
      errorMessage={errorMsg}
      onClearSuccess={() => setSuccessMsg(null)}
      onClearError={() => setErrorMsg(null)}
      filters={
        <FilterBar>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search state name…" />
        </FilterBar>
      }
    >
      {loading ? (
        <TableSkeleton cols={4} rows={5} />
      ) : (
        <div className="space-y-3">
          <DataTable
            columns={columns}
            rows={pageItems}
            keyExtractor={r => r.id}
            emptyMessage="No states found"
            mobileCard={row => (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{row.name}</span>
                  <div className="flex gap-1">
                    <ActionBtn variant="edit" icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => openEdit(row)} />
                    <ActionBtn variant="delete" icon={<TrashIcon className="h-4 w-4" />} label="Delete" onClick={() => handleDelete(row.id)} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {row.citiesCount != null && <span>{row.citiesCount} cities</span>}
                  <span>{formatDateToLocal(row.createdAt)}</span>
                </div>
              </div>
            )}
          />
          <PaginationBar currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
      )}
      <StateForm
        state={editingItem}
        isOpen={isFormOpen}
        loading={formLoading}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
    </PageShell>
  );
}
