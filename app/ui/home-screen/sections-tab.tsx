'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  PlusIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, ArrowPathIcon,
  MapPinIcon, NoSymbolIcon, ArrowsUpDownIcon, EyeIcon,
} from '@heroicons/react/24/outline';
import { TableSkeleton } from '@/app/ui/data-table';
import {
  fetchHomeSectionAction, addSectionItemAction, updateSectionItemAction, deleteSectionItemAction,
  reorderSectionAction, recomputeHomeAction, fetchHomePreviewAction,
} from '@/app/lib/functions/home-sections';
import { fetchWarehousesAction } from '@/app/lib/functions/warehouse';
import { fetchAllPharmaciesAction } from '@/app/lib/functions/pharmacy';
import type {
  HomeSectionAdmin, HomeSectionItem, HomeSectionKey, PreviewProductRow, SectionItemRef,
} from '@/app/lib/definitions/home-screen';
import type { Item } from '@/app/lib/definitions/item';
import { ItemSearchModal, StatusToggle, ActionIcon, EmptyState, inputCls, labelCls, Modal } from './shared';

const SECTIONS: Array<{ key: HomeSectionKey; label: string; ar: string; hint: string }> = [
  { key: 'top', label: 'Most ordered', ar: 'الأكثر طلباً', hint: 'Computed daily from confirmed orders. Pins appear first; excluded items are hidden.' },
  { key: 'restocked', label: 'Newly available', ar: 'توفرت حديثاً', hint: 'Computed from items that became available again in a warehouse. Pins appear first.' },
  { key: 'featured', label: 'Featured offers', ar: 'العروض المميزة', hint: 'Fully manual: only the items pinned here are shown, in this order.' },
];

const btnPrimary = 'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50';
const gradient = { background: 'linear-gradient(135deg, #007476, #005a5c)' };

function itemLabel(item: SectionItemRef | null) {
  if (!item) return <span className="text-gray-400">—</span>;
  return (
    <div className="min-w-0">
      <p className="font-medium text-gray-900 truncate">{item.item_name}</p>
      <p className="text-xs text-gray-400 truncate">
        {item.name_ar && <span dir="rtl">{item.name_ar} · </span>}
        {item.manufacturer?.name ?? ''}
        {!item.enabled && <span className="ml-1 text-red-500">(disabled)</span>}
      </p>
    </div>
  );
}

function fmtDateTime(v: string | null | undefined) {
  if (!v) return '—';
  return new Date(v).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

function snapshotMeta(section: HomeSectionKey, meta: Record<string, unknown>) {
  if (section === 'top') return `${meta.order_count ?? 0} orders · ${meta.qty ?? 0} pcs · ${meta.pharmacies ?? 0} pharmacies`;
  if (section === 'restocked') return `restocked ${fmtDateTime(meta.last_restocked_at as string)}`;
  return '';
}

// ── Pin options modal (warehouse + dates + note) ──────────────────────────────

function PinOptionsModal({
  entry, warehouses, onSave, onClose,
}: {
  entry: HomeSectionItem;
  warehouses: Array<{ id: string; warehouse_name: string }>;
  onSave: (dto: { warehouse_id: string | null; start_date: string | null; end_date: string | null; note: string | null }) => void;
  onClose: () => void;
}) {
  const [warehouseId, setWarehouseId] = useState(entry.warehouse_id ?? '');
  const [startDate, setStartDate] = useState(entry.start_date ?? '');
  const [endDate, setEndDate] = useState(entry.end_date ?? '');
  const [note, setNote] = useState(entry.note ?? '');
  return (
    <Modal title={`Pin options — ${entry.item?.item_name ?? ''}`} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={e => {
          e.preventDefault();
          onSave({ warehouse_id: warehouseId || null, start_date: startDate || null, end_date: endDate || null, note: note || null });
        }}
      >
        <div>
          <label className={labelCls}>Pinned warehouse</label>
          <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)} className={inputCls}>
            <option value="">— Let the pharmacist choose (cheapest shown first) —</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouse_name}</option>)}
          </select>
          <p className="mt-1 text-xs text-gray-400">
            When set and the warehouse sells the item to the pharmacy, the app shows that warehouse&apos;s price and offer directly and adds to cart from it.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Visible from</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Visible until</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Internal note</label>
          <input value={note} onChange={e => setNote(e.target.value)} className={inputCls} placeholder="e.g. Winter campaign" />
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
          <button type="submit" className={btnPrimary} style={gradient}>Save</button>
        </div>
      </form>
    </Modal>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────────

function PreviewPanel({ section }: { section: HomeSectionKey }) {
  const [pharmacies, setPharmacies] = useState<Array<{ id: string; pharmacy_name: string }>>([]);
  const [pharmacyId, setPharmacyId] = useState('');
  const [rows, setRows] = useState<PreviewProductRow[] | null>(null);
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllPharmaciesAction(1, 200).then(res => {
      if (!('error' in res)) setPharmacies(res.pharmacies.map(p => ({ id: p.id, pharmacy_name: p.pharmacy_name })));
    });
  }, []);

  const load = useCallback(async (id: string) => {
    if (!id) { setRows(null); return; }
    setLoading(true);
    const res = await fetchHomePreviewAction(id, section);
    setLoading(false);
    if (!('error' in res)) { setRows(res.items); setUsdRate(res.usd_rate); }
  }, [section]);

  useEffect(() => { load(pharmacyId); }, [pharmacyId, load]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <EyeIcon className="h-4 w-4 text-[#007476]" />
        <h3 className="text-sm font-semibold text-gray-800">Preview as a pharmacy</h3>
        <select value={pharmacyId} onChange={e => setPharmacyId(e.target.value)} className={`${inputCls} max-w-xs`}>
          <option value="">— Choose a pharmacy —</option>
          {pharmacies.map(p => <option key={p.id} value={p.id}>{p.pharmacy_name}</option>)}
        </select>
        {pharmacyId && usdRate == null && (
          <span className="text-xs text-amber-600">USD rate is not set — USD prices cannot be converted to SYP (Currencies page).</span>
        )}
      </div>
      {loading && <p className="text-xs text-gray-400">Loading…</p>}
      {!loading && rows && rows.length === 0 && <p className="text-xs text-gray-400">This tab is empty for this pharmacy (no item is sold by its nearby warehouses).</p>}
      {!loading && rows && rows.length > 0 && (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
          {rows.map(r => (
            <div key={r.item_id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {r.name_ar || r.name_en}
                  {r.source === 'manual' && <span className="ml-2 rounded-full bg-[#007476]/10 px-2 py-0.5 text-[10px] text-[#007476]">pinned</span>}
                </p>
                <p className="text-xs text-gray-400 truncate">{r.name_en} · {r.manufacturer?.name} · {r.pack_label}</p>
              </div>
              <div className="flex items-center gap-2 text-xs flex-shrink-0">
                {r.offers.flatMap(o => o.badges).slice(0, 2).map((b, i) => (
                  <span key={i} className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">{b.label}</span>
                ))}
                <span className="text-gray-500">{r.warehouses_count} wh</span>
                <span className="font-mono text-gray-800">
                  {r.from_price ? (r.from_price.amount_syp ?? `${r.from_price.amount} ${r.from_price.currency}`) : '—'}
                </span>
                <span className={`h-2 w-2 rounded-full ${r.stock_status === 'high' ? 'bg-emerald-500' : r.stock_status === 'low' ? 'bg-amber-500' : 'bg-red-500'}`} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══ Sections Tab ══════════════════════════════════════════════════════════════

export default function SectionsTab({ onSuccess, onError }: { onSuccess: (m: string) => void; onError: (m: string) => void }) {
  const [section, setSection] = useState<HomeSectionKey>('top');
  const [data, setData] = useState<HomeSectionAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [recomputing, setRecomputing] = useState(false);
  const [search, setSearch] = useState<'pin' | 'exclude' | null>(null);
  const [editing, setEditing] = useState<HomeSectionItem | null>(null);
  const [warehouses, setWarehouses] = useState<Array<{ id: string; warehouse_name: string }>>([]);

  const meta = SECTIONS.find(s => s.key === section)!;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchHomeSectionAction(section);
    setLoading(false);
    if ('error' in res) onError('Failed to load section');
    else setData(res);
  }, [section, onError]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetchWarehousesAction(1, 200).then(res => {
      if (!('error' in res)) setWarehouses(res.warehouses.map(w => ({ id: w.id, warehouse_name: w.warehouse_name })));
    });
  }, []);

  const run = async (id: string | null, fn: () => Promise<{ success: boolean; message: string }>, okMsg?: string) => {
    setBusyId(id);
    const res = await fn();
    setBusyId(null);
    if (res.success) { if (okMsg) onSuccess(okMsg); await load(); }
    else onError(res.message);
  };

  const addItem = (itemId: string, mode: 'pin' | 'exclude') =>
    run(itemId, () => addSectionItemAction(section, { item_id: itemId, mode }), mode === 'pin' ? 'Item pinned' : 'Item excluded');

  const handleSelect = (item: Item) => {
    const mode = search ?? 'pin';
    setSearch(null);
    addItem(item.id, mode);
  };

  const move = (index: number, delta: number) => {
    if (!data) return;
    const ids = data.pins.map(p => p.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(ids[index], () => reorderSectionAction(section, ids));
  };

  const recompute = async () => {
    setRecomputing(true);
    const res = await recomputeHomeAction();
    setRecomputing(false);
    if (res.success) { onSuccess(`Recomputed: ${JSON.stringify(res.data?.stats ?? {})}`); load(); }
    else onError(res.message);
  };

  return (
    <div className="space-y-4">
      {/* Section switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${section === s.key ? 'bg-white text-[#007476] shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {s.label} <span className="text-xs text-gray-400" dir="rtl">({s.ar})</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {section !== 'featured' && (
            <button onClick={recompute} disabled={recomputing} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              <ArrowPathIcon className={`h-4 w-4 ${recomputing ? 'animate-spin' : ''}`} /> Recompute now
            </button>
          )}
          <button onClick={() => setSearch('pin')} className={btnPrimary} style={gradient}>
            <PlusIcon className="h-4 w-4" /> Pin item
          </button>
          {section !== 'featured' && (
            <button onClick={() => setSearch('exclude')} className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50">
              <NoSymbolIcon className="h-4 w-4" /> Exclude item
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500">
        {meta.hint}
        {section !== 'featured' && data && (
          <> Last computed: <b>{fmtDateTime(data.computed_at)}</b> (daily at 03:00 Damascus time{section === 'restocked' ? ' + hourly' : ''}).</>
        )}
      </p>

      {loading || !data ? (
        <TableSkeleton cols={5} rows={4} />
      ) : (
        <>
          {/* Pinned */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
              <MapPinIcon className="h-4 w-4 text-[#007476]" />
              <h3 className="text-sm font-semibold text-gray-800">Pinned (manual) — shown first</h3>
              <span className="text-xs text-gray-400">{data.pins.length}</span>
            </div>
            {data.pins.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-gray-400">No pinned items</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {data.pins.map((p, i) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="w-16 px-3 py-2">
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => move(i, -1)} disabled={i === 0 || !!busyId} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ArrowUpIcon className="h-3.5 w-3.5" /></button>
                            <button onClick={() => move(i, 1)} disabled={i === data.pins.length - 1 || !!busyId} className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ArrowDownIcon className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                        <td className="px-3 py-2 max-w-[260px]">{itemLabel(p.item)}</td>
                        <td className="px-3 py-2 text-xs">
                          <button onClick={() => setEditing(p)} className="text-left hover:text-[#007476]">
                            {p.warehouse ? <span className="text-gray-800">📍 {p.warehouse.warehouse_name}</span> : <span className="text-gray-400">Any warehouse</span>}
                            {(p.start_date || p.end_date) && (
                              <span className="block text-gray-400">{p.start_date ?? '…'} → {p.end_date ?? '…'}</span>
                            )}
                            {p.note && <span className="block text-gray-400 italic">{p.note}</span>}
                          </button>
                        </td>
                        <td className="px-3 py-2">
                          <StatusToggle active={p.is_active} loading={busyId === p.id} onToggle={() => run(p.id, () => updateSectionItemAction(p.id, { is_active: !p.is_active }))} />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <ActionIcon icon={<TrashIcon className="h-4 w-4" />} label="Remove" color="red" onClick={() => run(p.id, () => deleteSectionItemAction(p.id), 'Pin removed')} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Auto ranking */}
          {section !== 'featured' && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                <ArrowsUpDownIcon className="h-4 w-4 text-[#007476]" />
                <h3 className="text-sm font-semibold text-gray-800">Automatic ranking (all warehouses)</h3>
                <span className="text-xs text-gray-400">{data.snapshot.length}</span>
              </div>
              {data.snapshot.length === 0 ? (
                <EmptyState
                  icon={<ArrowsUpDownIcon className="h-6 w-6" />}
                  label="Nothing computed yet"
                  sub={section === 'top' ? 'No confirmed orders in the configured window (Settings tab).' : 'No item became available again in the configured window.'}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {data.snapshot.map(s => (
                        <tr key={s.item?.id ?? s.rank} className={s.excluded ? 'bg-red-50/40' : 'hover:bg-gray-50'}>
                          <td className="w-12 px-3 py-2 font-mono text-xs text-gray-400">#{s.rank}</td>
                          <td className="px-3 py-2 max-w-[260px]">{itemLabel(s.item)}</td>
                          <td className="px-3 py-2 text-xs text-gray-500">{snapshotMeta(section, s.meta)}</td>
                          <td className="px-3 py-2 text-right whitespace-nowrap">
                            {s.pinned && <span className="mr-2 rounded-full bg-[#007476]/10 px-2 py-0.5 text-[10px] text-[#007476]">pinned</span>}
                            {s.excluded && <span className="mr-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] text-red-600">excluded</span>}
                            {!s.pinned && !s.excluded && s.item && (
                              <>
                                <button onClick={() => addItem(s.item!.id, 'pin')} disabled={!!busyId} className="mr-1 rounded px-2 py-1 text-xs text-[#007476] hover:bg-[#007476]/10">Pin</button>
                                <button onClick={() => addItem(s.item!.id, 'exclude')} disabled={!!busyId} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">Exclude</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Excluded */}
          {section !== 'featured' && data.excludes.length > 0 && (
            <div className="rounded-xl border border-red-100 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 border-b border-red-100 px-4 py-3">
                <NoSymbolIcon className="h-4 w-4 text-red-500" />
                <h3 className="text-sm font-semibold text-gray-800">Excluded — never shown in this tab</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {data.excludes.map(x => (
                  <div key={x.id} className="flex items-center justify-between px-4 py-2 text-sm">
                    {itemLabel(x.item)}
                    <button onClick={() => run(x.id, () => deleteSectionItemAction(x.id), 'Exclusion removed')} className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100">
                      Remove exclusion
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <PreviewPanel section={section} />
        </>
      )}

      {search && <ItemSearchModal onSelect={handleSelect} onClose={() => setSearch(null)} />}
      {editing && (
        <PinOptionsModal
          entry={editing}
          warehouses={warehouses}
          onClose={() => setEditing(null)}
          onSave={dto => { const id = editing.id; setEditing(null); run(id, () => updateSectionItemAction(id, dto), 'Pin updated'); }}
        />
      )}
    </div>
  );
}
