"use client";

import { useEffect, useState, useCallback } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import {
  DataTable, TableSkeleton, PaginationBar,
  FilterBar, SearchInput, FilterSelect, ActionBtn,
} from '@/app/ui/data-table';
import CityForm from '@/app/ui/address/city-form';
import PermissionError from '@/app/ui/permission-error';
import {
  fetchStatesAction,
  fetchCitiesAction,
  createCityAction,
  updateCityAction,
  deleteCityAction,
} from '@/app/lib/functions/address';
import type { State, City } from '@/app/lib/definitions/address';
import { formatDateToLocal } from '@/app/lib/utils';

const PAGE_SIZE = 20;

export default function CitiesPageClient() {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<City | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const loadStates = useCallback(async () => {
    const res = await fetchStatesAction();
    if (!('error' in res)) setStates(res.states);
  }, []);

  const loadCities = useCallback(async () => {
    setLoading(true);
    const res = await fetchCitiesAction({ stateId: stateFilter || undefined });
    if ('error' in res) {
      setPermError(res.error as string);
    } else {
      setCities(res.cities);
    }
    setLoading(false);
  }, [stateFilter]);

  useEffect(() => { loadStates(); }, [loadStates]);
  useEffect(() => { loadCities(); }, [loadCities]);

  const filtered = cities.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stateOptions = [
    { value: '', label: 'All States' },
    ...states.map(s => ({ value: s.id, label: s.name })),
  ];

  const openEdit = (item: City) => { setEditingItem(item); setIsFormOpen(true); };
  const openCreate = () => { setEditingItem(null); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingItem(null); };

  const handleSubmit = async (payload: { name: string; stateId: string }) => {
    setFormLoading(true);
    const result = editingItem
      ? await updateCityAction(editingItem.id, payload)
      : await createCityAction(payload);
    if (result.success) {
      setSuccessMsg(result.message);
      closeForm();
      await loadCities();
    } else {
      setErrorMsg(result.message);
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this city?')) return;
    const result = await deleteCityAction(id);
    if (result.success) { setSuccessMsg(result.message); await loadCities(); }
    else setErrorMsg(result.message);
  };

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  const columns = [
    {
      key: 'name',
      header: 'City Name',
      render: (row: City) => <span className="font-medium text-gray-900">{row.name}</span>,
    },
    {
      key: 'state',
      header: 'State',
      render: (row: City) => <span className="text-sm text-gray-600">{row.stateName ?? '—'}</span>,
    },
    {
      key: 'districts',
      header: 'Districts',
      render: (row: City) => <span className="text-sm text-gray-600">{row.districtsCount ?? '—'}</span>,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row: City) => <span className="text-xs text-gray-500">{formatDateToLocal(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row: City) => (
        <div className="flex justify-end gap-1">
          <ActionBtn variant="edit" icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => openEdit(row)} />
          <ActionBtn variant="delete" icon={<TrashIcon className="h-4 w-4" />} label="Delete" onClick={() => handleDelete(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Cities"
      count={filtered.length}
      createLabel="New City"
      onCreate={openCreate}
      successMessage={successMsg}
      errorMessage={errorMsg}
      onClearSuccess={() => setSuccessMsg(null)}
      onClearError={() => setErrorMsg(null)}
      filters={
        <FilterBar>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search city name…" />
          <FilterSelect value={stateFilter} onChange={v => { setStateFilter(v); setPage(1); }} label="State" options={stateOptions} />
        </FilterBar>
      }
    >
      {loading ? (
        <TableSkeleton cols={5} rows={5} />
      ) : (
        <div className="space-y-3">
          <DataTable
            columns={columns}
            rows={pageItems}
            keyExtractor={r => r.id}
            emptyMessage="No cities found"
            mobileCard={row => (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{row.name}</div>
                    {row.stateName && <div className="text-xs text-gray-400">{row.stateName}</div>}
                  </div>
                  <div className="flex gap-1">
                    <ActionBtn variant="edit" icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => openEdit(row)} />
                    <ActionBtn variant="delete" icon={<TrashIcon className="h-4 w-4" />} label="Delete" onClick={() => handleDelete(row.id)} />
                  </div>
                </div>
                <div className="text-xs text-gray-400">{formatDateToLocal(row.createdAt)}</div>
              </div>
            )}
          />
          <PaginationBar currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
      )}
      <CityForm
        city={editingItem}
        states={states}
        isOpen={isFormOpen}
        loading={formLoading}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
    </PageShell>
  );
}
