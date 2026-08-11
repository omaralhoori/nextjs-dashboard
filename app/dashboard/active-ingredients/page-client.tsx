'use client';

import { useState, useEffect, useCallback } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import {
  DataTable, TableSkeleton, PaginationBar,
  FilterBar, SearchInput, ActionBtn,
} from '@/app/ui/data-table';
import ActiveIngredientForm from '@/app/ui/active-ingredients/active-ingredient-form';
import PermissionError from '@/app/ui/permission-error';
import {
  fetchActiveIngredientsAction,
  createActiveIngredientAction,
  updateActiveIngredientAction,
  deleteActiveIngredientAction,
} from '@/app/lib/functions/active-ingredients';
import type {
  ActiveIngredient,
  CreateActiveIngredientRequest,
  UpdateActiveIngredientRequest,
} from '@/app/lib/definitions/active-ingredient';
import { formatDateToLocal } from '@/app/lib/utils';

const PAGE_SIZE = 20;

export default function ActiveIngredientsPageClient() {
  const [items, setItems] = useState<ActiveIngredient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActiveIngredient | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchActiveIngredientsAction(page, PAGE_SIZE, debouncedSearch || undefined);
    if ('error' in result) {
      setPermError(result.error);
    } else {
      setItems(result.activeIngredients || []);
      setTotal(result.pagination?.total ?? result.total ?? 0);
    }
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const openEdit = (item: ActiveIngredient) => { setEditingItem(item); setIsFormOpen(true); };
  const openCreate = () => { setEditingItem(null); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingItem(null); };

  const handleFormSubmit = async (data: CreateActiveIngredientRequest | UpdateActiveIngredientRequest) => {
    setFormLoading(true);
    const result = editingItem
      ? await updateActiveIngredientAction(editingItem.id, data)
      : await createActiveIngredientAction(data as CreateActiveIngredientRequest);
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
    if (!window.confirm('Delete this active ingredient?')) return;
    const result = await deleteActiveIngredientAction(id);
    if (result.success) { setSuccessMsg(result.message); await load(); }
    else setErrorMsg(result.message);
  };

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  const columns = [
    {
      key: 'name',
      header: 'Name (English)',
      render: (row: ActiveIngredient) => <span className="font-medium text-gray-900">{row.active_ingredient_name}</span>,
    },
    {
      key: 'arabic_name',
      header: 'Name (Arabic)',
      render: (row: ActiveIngredient) => (
        <span className="text-sm text-gray-700" dir="rtl">
          {row.arabic_name || '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row: ActiveIngredient) => <span className="text-xs text-gray-500">{formatDateToLocal(row.created_at)}</span>,
    },
    {
      key: 'updated_at',
      header: 'Updated',
      render: (row: ActiveIngredient) => <span className="text-xs text-gray-500">{formatDateToLocal(row.updated_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row: ActiveIngredient) => (
        <div className="flex justify-end gap-1">
          <ActionBtn variant="edit" icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => openEdit(row)} />
          <ActionBtn variant="delete" icon={<TrashIcon className="h-4 w-4" />} label="Delete" onClick={() => handleDelete(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Active Ingredients"
      count={total}
      createLabel="New Ingredient"
      onCreate={openCreate}
      successMessage={successMsg}
      errorMessage={errorMsg}
      onClearSuccess={() => setSuccessMsg(null)}
      onClearError={() => setErrorMsg(null)}
      filters={
        <FilterBar>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search English or Arabic name…"
          />
        </FilterBar>
      }
    >
      {loading ? (
        <TableSkeleton cols={5} rows={6} />
      ) : (
        <div className="space-y-3">
          <DataTable
            columns={columns}
            rows={items}
            keyExtractor={r => r.id}
            emptyMessage="No active ingredients found"
            mobileCard={row => (
              <div className="space-y-1">
                <div className="font-medium text-gray-900">{row.active_ingredient_name}</div>
                {row.arabic_name ? (
                  <div className="text-sm text-gray-600" dir="rtl">{row.arabic_name}</div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDateToLocal(row.created_at)}</span>
                  <div className="flex gap-1">
                    <ActionBtn variant="edit" icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => openEdit(row)} />
                    <ActionBtn variant="delete" icon={<TrashIcon className="h-4 w-4" />} label="Delete" onClick={() => handleDelete(row.id)} />
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
      <ActiveIngredientForm
        activeIngredient={editingItem}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />
    </PageShell>
  );
}
