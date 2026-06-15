'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import PageShell from '@/app/ui/page-shell';
import {
  TableSkeleton,
  FilterBar, SearchInput, FilterSelect,
} from '@/app/ui/data-table';
import ItemsExcelGrid from '@/app/ui/items/items-excel-grid';
import ItemForm from '@/app/ui/items/item-form';
import PermissionError from '@/app/ui/permission-error';
import {
  fetchItemsAction,
  createItemAction,
  updateItemAction,
  deleteItemAction,
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

const PAGE_SIZE = 30;

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [itemGroupFilter, setItemGroupFilter] = useState('');
  const [drugClassFilter, setDrugClassFilter] = useState('');
  const [enabledFilter, setEnabledFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Guards against overlapping/duplicate fetches during infinite scroll.
  const loadingRef = useRef(false);

  const filters = {
    search: debouncedSearch || undefined,
    manufacturer_id: manufacturerFilter || undefined,
    item_group: itemGroupFilter || undefined,
    drug_class: (drugClassFilter || undefined) as 'OTC' | 'RX' | 'Controlled' | undefined,
    enabled: enabledFilter === 'true' ? true : enabledFilter === 'false' ? false : undefined,
  };

  const updateSearch = useDebouncedCallback((v: string) => setDebouncedSearch(v), 300);

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

  // Reset + first page whenever filters change.
  const reload = useCallback(async () => {
    loadingRef.current = true;
    setLoading(true);
    const result = await fetchItemsAction({ ...filters, limit: PAGE_SIZE, offset: 0 });
    if ('error' in result) {
      setPermError(result.error);
    } else {
      setItems(result.items);
      setTotal(result.total ?? result.items.length);
    }
    setLoading(false);
    loadingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, manufacturerFilter, itemGroupFilter, drugClassFilter, enabledFilter]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    const result = await fetchItemsAction({ ...filters, limit: PAGE_SIZE, offset: items.length });
    if (!('error' in result)) {
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const fresh = result.items.filter((it) => !seen.has(it.id));
        return [...prev, ...fresh];
      });
      setTotal(result.total ?? items.length + result.items.length);
    }
    setLoadingMore(false);
    loadingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, debouncedSearch, manufacturerFilter, itemGroupFilter, drugClassFilter, enabledFilter]);

  useEffect(() => { loadReferenceData(); }, [loadReferenceData]);
  useEffect(() => { reload(); }, [reload]);

  const hasMore = items.length < total;

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
      await reload();
    } else {
      setErrorMsg(result.message);
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this item?')) return;
    const result = await deleteItemAction(id);
    if (result.success) {
      setSuccessMsg(result.message);
      setItems((prev) => prev.filter((it) => it.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } else {
      setErrorMsg(result.message);
    }
  };

  // Inline single-cell save → optimistic update of the local row.
  const handleSaveCell = async (id: string, patch: UpdateItemRequest): Promise<boolean> => {
    const result = await updateItemAction(id, patch);
    if (result.success) {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
      return true;
    }
    setErrorMsg(result.message);
    return false;
  };

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  const manufacturerOptions = [
    { value: '', label: 'All Manufacturers' },
    ...manufacturers.map((m) => ({ value: m.id, label: m.name })),
  ];

  const itemGroupOptions = [
    { value: '', label: 'All Groups' },
    ...itemGroups.map((g) => ({ value: g.id, label: g.name })),
  ];

  return (
    <PageShell
      title="Items"
      subtitle="Edit basic fields inline like a spreadsheet, or open the full editor. Scroll down to load more."
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
            onChange={(v) => { setSearch(v); updateSearch(v); }}
            placeholder="Search name, barcode…"
            className="min-w-[220px]"
          />
          <FilterSelect value={manufacturerFilter} onChange={setManufacturerFilter} label="Manufacturer" options={manufacturerOptions} />
          <FilterSelect value={itemGroupFilter} onChange={setItemGroupFilter} label="Item Group" options={itemGroupOptions} />
          <FilterSelect value={drugClassFilter} onChange={setDrugClassFilter} label="Drug Class" options={DRUG_CLASS_OPTIONS} />
          <FilterSelect value={enabledFilter} onChange={setEnabledFilter} label="Status" options={ENABLED_OPTIONS} />
        </FilterBar>
      }
    >
      {loading ? (
        <TableSkeleton cols={8} rows={8} />
      ) : (
        <ItemsExcelGrid
          items={items}
          onEditFull={openEdit}
          onDelete={handleDelete}
          onSaveCell={handleSaveCell}
          onLoadMore={loadMore}
          hasMore={hasMore}
          loadingMore={loadingMore}
        />
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
