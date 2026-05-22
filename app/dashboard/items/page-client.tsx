'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import {
  DataTable, TableSkeleton, PaginationBar,
  FilterBar, SearchInput, FilterSelect,
  StatusBadge, ActionBtn,
} from '@/app/ui/data-table';
import ItemForm from '@/app/ui/items/item-form';
import PermissionError from '@/app/ui/permission-error';
import {
  fetchItemsAction,
  createItemAction,
  updateItemAction,
  deleteItemAction,
  toggleItemEnabledAction,
} from '@/app/lib/functions/items';
import { fetchManufacturersAction } from '@/app/lib/functions/manufacturers';
import { fetchItemGroupsAction } from '@/app/lib/functions/item-groups';
import { fetchCurrenciesAction } from '@/app/lib/functions/currencies';
import { fetchWarehousesAction } from '@/app/lib/functions/warehouse';
import type { Item, CreateItemRequest, UpdateItemRequest } from '@/app/lib/definitions/item';
import type { Manufacturer } from '@/app/lib/definitions/manufacturer';
import type { ItemGroup } from '@/app/lib/definitions/item-group';
import type { Currency } from '@/app/lib/definitions/currency';
import type { Warehouse } from '@/app/lib/definitions/warehouse';
import { formatDateToLocal } from '@/app/lib/utils';

const PAGE_SIZE = 20;

const DRUG_CLASS_OPTIONS = [
  { value: '', label: 'All Drug Classes' },
  { value: 'OTC', label: 'OTC' },
  { value: 'RX', label: 'RX' },
  { value: 'Controlled', label: 'Controlled' },
];

const ENABLED_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Enabled' },
  { value: 'false', label: 'Disabled' },
];

export default function ItemsPageClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [itemGroups, setItemGroups] = useState<ItemGroup[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [itemGroupFilter, setItemGroupFilter] = useState('');
  const [drugClassFilter, setDrugClassFilter] = useState('');
  const [enabledFilter, setEnabledFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const updateSearch = useDebouncedCallback((v: string) => {
    setDebouncedSearch(v);
    setPage(1);
  }, 300);

  const loadReferenceData = useCallback(async () => {
    const [mfr, ig, cur, wh] = await Promise.all([
      fetchManufacturersAction(),
      fetchItemGroupsAction(),
      fetchCurrenciesAction(),
      fetchWarehousesAction(1, 100),
    ]);
    if (!('error' in mfr)) setManufacturers(mfr.manufacturers);
    if (!('error' in ig)) setItemGroups(ig.itemGroups);
    if (!('error' in cur)) setCurrencies(cur.currencies);
    if (!('error' in wh)) setWarehouses(wh.warehouses);
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const result = await fetchItemsAction({
      search: debouncedSearch || undefined,
      manufacturer_id: manufacturerFilter || undefined,
      item_group: itemGroupFilter || undefined,
      drug_class: (drugClassFilter || undefined) as 'OTC' | 'RX' | 'Controlled' | undefined,
      enabled: enabledFilter === 'true' ? true : enabledFilter === 'false' ? false : undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    });
    if ('error' in result) {
      setPermError(result.error);
    } else {
      setItems(result.items);
      setTotal(result.total || result.items.length);
    }
    setLoading(false);
  }, [debouncedSearch, manufacturerFilter, itemGroupFilter, drugClassFilter, enabledFilter, page]);

  useEffect(() => { loadReferenceData(); }, [loadReferenceData]);
  useEffect(() => { loadItems(); }, [loadItems]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const resetPage = (setter: (v: string) => void) => (v: string) => { setter(v); setPage(1); };

  const openEdit = (item: Item) => { setEditingItem(item); setIsFormOpen(true); };
  const openCreate = () => { setEditingItem(null); setIsFormOpen(true); };
  const closeForm = () => { setIsFormOpen(false); setEditingItem(null); };

  const handleFormSubmit = async (data: CreateItemRequest | UpdateItemRequest) => {
    setFormLoading(true);
    const result = editingItem
      ? await updateItemAction(editingItem.id, data)
      : await createItemAction(data as CreateItemRequest);
    if (result.success) {
      setSuccessMsg(result.message);
      closeForm();
      await loadItems();
    } else {
      setErrorMsg(result.message);
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this item?')) return;
    const result = await deleteItemAction(id);
    if (result.success) { setSuccessMsg(result.message); await loadItems(); }
    else setErrorMsg(result.message);
  };

  const handleToggle = async (id: string) => {
    const result = await toggleItemEnabledAction(id);
    if (result.success) { setSuccessMsg(result.message); await loadItems(); }
    else setErrorMsg(result.message);
  };

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  const manufacturerOptions = [
    { value: '', label: 'All Manufacturers' },
    ...manufacturers.map(m => ({ value: m.id, label: m.name })),
  ];

  const itemGroupOptions = [
    { value: '', label: 'All Groups' },
    ...itemGroups.map(g => ({ value: g.id, label: g.name })),
  ];

  const DRUG_CLASS_COLORS: Record<string, string> = {
    OTC: 'bg-green-50 text-green-700 ring-green-200',
    RX: 'bg-blue-50 text-blue-700 ring-blue-200',
    Controlled: 'bg-red-50 text-red-700 ring-red-200',
  };

  const columns = [
    {
      key: 'name',
      header: 'Item',
      render: (row: Item) => (
        <div>
          <div className="font-medium text-gray-900">{row.item_name}</div>
          {row.generic_name && <div className="text-xs text-gray-400">{row.generic_name}</div>}
          <div className="text-xs text-gray-400 font-mono">{row.barcode}</div>
        </div>
      ),
    },
    {
      key: 'manufacturer',
      header: 'Manufacturer',
      render: (row: Item) => (
        <span className="text-sm text-gray-700">{row.manufacturer?.name ?? row.manufacturer_id}</span>
      ),
    },
    {
      key: 'group',
      header: 'Group',
      render: (row: Item) => (
        <span className="text-sm text-gray-600">{row.itemGroup?.name ?? row.item_group}</span>
      ),
    },
    {
      key: 'drug_class',
      header: 'Drug Class',
      render: (row: Item) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${DRUG_CLASS_COLORS[row.drug_class] ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}>
          {row.drug_class}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (row: Item) => (
        <div className="text-xs">
          <div className="text-gray-700">Sell: {row.selling_price}</div>
          <div className="text-gray-400">Buy: {row.buying_price}</div>
        </div>
      ),
    },
    {
      key: 'enabled',
      header: 'Status',
      render: (row: Item) => <StatusBadge active={row.enabled} activeLabel="Enabled" inactiveLabel="Disabled" />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row: Item) => (
        <div className="flex justify-end gap-1">
          <ActionBtn variant="edit" icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => openEdit(row)} />
          <ActionBtn
            variant={row.enabled ? 'toggle-on' : 'toggle-off'}
            icon={row.enabled ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            label={row.enabled ? 'Disable' : 'Enable'}
            onClick={() => handleToggle(row.id)}
          />
          <ActionBtn variant="delete" icon={<TrashIcon className="h-4 w-4" />} label="Delete" onClick={() => handleDelete(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Items"
      count={total}
      createLabel="New Item"
      onCreate={openCreate}
      successMessage={successMsg}
      errorMessage={errorMsg}
      onClearSuccess={() => setSuccessMsg(null)}
      onClearError={() => setErrorMsg(null)}
      filters={
        <FilterBar>
          <SearchInput
            value={search}
            onChange={v => { setSearch(v); updateSearch(v); }}
            placeholder="Search name, barcode…"
            className="min-w-[220px]"
          />
          <FilterSelect value={manufacturerFilter} onChange={resetPage(setManufacturerFilter)} label="Manufacturer" options={manufacturerOptions} />
          <FilterSelect value={itemGroupFilter} onChange={resetPage(setItemGroupFilter)} label="Item Group" options={itemGroupOptions} />
          <FilterSelect value={drugClassFilter} onChange={resetPage(setDrugClassFilter)} label="Drug Class" options={DRUG_CLASS_OPTIONS} />
          <FilterSelect value={enabledFilter} onChange={resetPage(setEnabledFilter)} label="Status" options={ENABLED_OPTIONS} />
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
            emptyMessage="No items found"
            mobileCard={row => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900">{row.item_name}</div>
                    {row.generic_name && <div className="text-xs text-gray-500">{row.generic_name}</div>}
                    <div className="text-xs text-gray-400 font-mono">{row.barcode}</div>
                  </div>
                  <StatusBadge active={row.enabled} activeLabel="Enabled" inactiveLabel="Disabled" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${DRUG_CLASS_COLORS[row.drug_class] ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}>
                    {row.drug_class}
                  </span>
                  <span className="text-xs text-gray-500">{row.manufacturer?.name ?? ''}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Sell: {row.selling_price} · Buy: {row.buying_price}</span>
                  <div className="flex gap-1">
                    <ActionBtn variant="edit" icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => openEdit(row)} />
                    <ActionBtn
                      variant={row.enabled ? 'toggle-on' : 'toggle-off'}
                      icon={row.enabled ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                      label={row.enabled ? 'Disable' : 'Enable'}
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
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
      <ItemForm
        item={editingItem}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        loading={formLoading}
        manufacturers={manufacturers}
        itemGroups={itemGroups}
        currencies={currencies}
        warehouses={warehouses}
      />
    </PageShell>
  );
}
