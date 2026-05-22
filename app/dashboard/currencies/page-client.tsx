'use client';

import { useState, useEffect, useCallback } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import PageShell from '@/app/ui/page-shell';
import {
  DataTable, TableSkeleton, PaginationBar,
  FilterBar, FilterSelect,
  StatusBadge, ActionBtn,
} from '@/app/ui/data-table';
import CurrencyForm from '@/app/ui/currencies/currency-form';
import PermissionError from '@/app/ui/permission-error';
import {
  fetchCurrenciesAction,
  createCurrencyAction,
  updateCurrencyAction,
  deleteCurrencyAction,
  toggleCurrencyActiveAction,
  setDefaultCurrencyAction,
} from '@/app/lib/functions/currencies';
import type { Currency, CreateCurrencyRequest, UpdateCurrencyRequest } from '@/app/lib/definitions/currency';
import { formatDateToLocal } from '@/app/lib/utils';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function CurrenciesPageClient() {
  const [items, setItems] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Currency | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchCurrenciesAction();
    if ('error' in result) {
      setPermError(result.error as string);
    } else {
      setItems(result.currencies);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(item => {
    if (statusFilter === 'active' && !item.active) return false;
    if (statusFilter === 'inactive' && item.active) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openEdit = (item: Currency) => { setEditingItem(item); setIsFormOpen(true); };
  const openCreate = () => { setEditingItem(null); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingItem(null); };

  const handleFormSubmit = async (data: CreateCurrencyRequest | UpdateCurrencyRequest) => {
    setFormLoading(true);
    const result = editingItem
      ? await updateCurrencyAction(editingItem.id, data)
      : await createCurrencyAction(data as CreateCurrencyRequest);
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
    if (!window.confirm('Delete this currency?')) return;
    const result = await deleteCurrencyAction(id);
    if (result.success) { setSuccessMsg(result.message); await load(); }
    else setErrorMsg(result.message);
  };

  const handleToggle = async (id: string) => {
    const result = await toggleCurrencyActiveAction(id);
    if (result.success) { setSuccessMsg(result.message); await load(); }
    else setErrorMsg(result.message);
  };

  const handleSetDefault = async (id: string) => {
    const result = await setDefaultCurrencyAction(id);
    if (result.success) { setSuccessMsg(result.message); await load(); }
    else setErrorMsg(result.message);
  };

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  const columns = [
    {
      key: 'code',
      header: 'Code',
      render: (row: Currency) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded font-semibold">{row.code}</span>
          {row.is_default && (
            <StarSolidIcon className="h-4 w-4 text-amber-400" title="Default currency" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (row: Currency) => <span className="font-medium text-gray-900">{row.name}</span>,
    },
    {
      key: 'symbol',
      header: 'Symbol',
      render: (row: Currency) => <span className="text-gray-700 font-medium">{row.symbol}</span>,
    },
    {
      key: 'exchange_rate',
      header: 'Exchange Rate',
      render: (row: Currency) => (
        <span className="text-gray-600">{row.exchange_rate != null ? row.exchange_rate.toFixed(4) : '—'}</span>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (row: Currency) => <StatusBadge active={row.active} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row: Currency) => <span className="text-xs text-gray-500">{formatDateToLocal(row.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row: Currency) => (
        <div className="flex justify-end gap-1">
          <ActionBtn variant="edit" icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => openEdit(row)} />
          {!row.is_default && (
            <ActionBtn variant="view" icon={<StarIcon className="h-4 w-4" />} label="Set as default" onClick={() => handleSetDefault(row.id)} />
          )}
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
      title="Currencies"
      count={filtered.length}
      createLabel="New Currency"
      onCreate={openCreate}
      successMessage={successMsg}
      errorMessage={errorMsg}
      onClearSuccess={() => setSuccessMsg(null)}
      onClearError={() => setErrorMsg(null)}
      filters={
        <FilterBar>
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
            emptyMessage="No currencies found"
            mobileCard={row => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-gray-900">{row.symbol} {row.code}</span>
                    {row.is_default && <StarSolidIcon className="h-4 w-4 text-amber-400" />}
                  </div>
                  <StatusBadge active={row.active} />
                </div>
                <div className="text-sm text-gray-700">{row.name}</div>
                {row.exchange_rate != null && (
                  <div className="text-xs text-gray-500">Rate: {row.exchange_rate.toFixed(4)}</div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDateToLocal(row.created_at)}</span>
                  <div className="flex gap-1">
                    <ActionBtn variant="edit" icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => openEdit(row)} />
                    {!row.is_default && (
                      <ActionBtn variant="view" icon={<StarIcon className="h-4 w-4" />} label="Set as default" onClick={() => handleSetDefault(row.id)} />
                    )}
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
      <CurrencyForm
        currency={editingItem}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />
    </PageShell>
  );
}
