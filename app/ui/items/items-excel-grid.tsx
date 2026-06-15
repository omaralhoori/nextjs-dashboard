'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { Item, UpdateItemRequest } from '@/app/lib/definitions/item';

// ── Cell status keys ──────────────────────────────────────────────────────────
type CellStatus = 'saving' | 'saved' | 'error' | undefined;

interface ItemsExcelGridProps {
  items: Item[];
  onEditFull: (item: Item) => void;
  onDelete: (id: string) => void;
  /** Persist a single-field change. Returns true on success. */
  onSaveCell: (id: string, patch: UpdateItemRequest) => Promise<boolean>;
  onLoadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
}

const DRUG_CLASS_OPTIONS = ['OTC', 'RX', 'Controlled'] as const;

// ── Editable text / number cell ───────────────────────────────────────────────
interface EditableCellProps {
  value: string;
  type?: 'text' | 'number';
  align?: 'left' | 'right';
  status?: CellStatus;
  placeholder?: string;
  onCommit: (raw: string) => void;
}

function EditableCell({ value, type = 'text', align = 'left', status, placeholder, onCommit }: EditableCellProps) {
  const [draft, setDraft] = useState(value);

  // Re-sync when the canonical value changes (e.g. after a successful save).
  useEffect(() => { setDraft(value); }, [value]);

  const commit = () => {
    if (draft !== value) onCommit(draft);
  };

  return (
    <div className="relative">
      <input
        type={type}
        value={draft}
        placeholder={placeholder}
        step={type === 'number' ? 'any' : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
          if (e.key === 'Escape') { setDraft(value); (e.currentTarget as HTMLInputElement).blur(); }
        }}
        className={[
          'w-full bg-transparent pl-2 pr-6 py-1.5 text-sm text-gray-800 rounded-sm outline-none',
          'border border-transparent hover:border-gray-200',
          'focus:border-[#007476] focus:bg-white focus:ring-1 focus:ring-[#007476]',
          align === 'right' ? 'text-right pr-6' : '',
          status === 'error' ? 'border-red-300 bg-red-50' : '',
          status === 'saved' ? 'border-emerald-300' : '',
        ].join(' ')}
      />
      <CellIndicator status={status} />
    </div>
  );
}

// ── Editable select cell ──────────────────────────────────────────────────────
interface EditableSelectProps {
  value: string;
  options: { value: string; label: string }[];
  status?: CellStatus;
  onCommit: (value: string) => void;
}

function EditableSelect({ value, options, status, onCommit }: EditableSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => { if (e.target.value !== value) onCommit(e.target.value); }}
        className={[
          'w-full bg-transparent pl-2 pr-6 py-1.5 text-sm text-gray-800 rounded-sm outline-none cursor-pointer appearance-none',
          'border border-transparent hover:border-gray-200',
          'focus:border-[#007476] focus:bg-white focus:ring-1 focus:ring-[#007476]',
          status === 'error' ? 'border-red-300 bg-red-50' : '',
          status === 'saved' ? 'border-emerald-300' : '',
        ].join(' ')}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <CellIndicator status={status} />
    </div>
  );
}

function CellIndicator({ status }: { status: CellStatus }) {
  if (!status) return null;
  return (
    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
      {status === 'saving' && <span className="block h-3 w-3 rounded-full border-2 border-gray-300 border-t-[#007476] animate-spin" />}
      {status === 'saved' && <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />}
      {status === 'error' && <ExclamationCircleIcon className="h-3.5 w-3.5 text-red-500" />}
    </span>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────────
export default function ItemsExcelGrid({
  items,
  onEditFull,
  onDelete,
  onSaveCell,
  onLoadMore,
  hasMore,
  loadingMore,
}: ItemsExcelGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cellStatus, setCellStatus] = useState<Record<string, CellStatus>>({});

  const setStatus = useCallback((key: string, status: CellStatus) => {
    setCellStatus((prev) => ({ ...prev, [key]: status }));
  }, []);

  const commitField = useCallback(async (item: Item, field: keyof UpdateItemRequest, raw: string) => {
    const key = `${item.id}:${field}`;
    const patch: UpdateItemRequest = {};

    if (field === 'buying_price' || field === 'selling_price') {
      const n = Number(raw);
      if (raw.trim() === '' || Number.isNaN(n) || n < 0) {
        setStatus(key, 'error');
        setTimeout(() => setStatus(key, undefined), 2000);
        return;
      }
      patch[field] = n;
    } else if (field === 'item_name') {
      if (!raw.trim()) {
        setStatus(key, 'error');
        setTimeout(() => setStatus(key, undefined), 2000);
        return;
      }
      patch.item_name = raw.trim();
    } else if (field === 'enabled') {
      patch.enabled = raw === 'true';
    } else {
      (patch as Record<string, unknown>)[field] = raw;
    }

    setStatus(key, 'saving');
    const ok = await onSaveCell(item.id, patch);
    if (ok) {
      setStatus(key, 'saved');
      setTimeout(() => setStatus(key, undefined), 1500);
    } else {
      setStatus(key, 'error');
      setTimeout(() => setStatus(key, undefined), 2500);
    }
  }, [onSaveCell, setStatus]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (hasMore && !loadingMore && el.scrollHeight - el.scrollTop - el.clientHeight < 320) {
      onLoadMore();
    }
  }, [hasMore, loadingMore, onLoadMore]);

  const st = (id: string, field: string): CellStatus => cellStatus[`${id}:${field}`];

  const HEAD = 'px-2 py-2.5 text-left text-xs font-semibold text-white/90 uppercase tracking-wide whitespace-nowrap border-r border-white/10';
  const CELL = 'border-r border-gray-100 align-middle';

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div ref={scrollRef} onScroll={handleScroll} className="max-h-[68vh] overflow-auto">
        <table className="min-w-[1180px] w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr style={{ background: 'linear-gradient(90deg, #004d4f, #007476)' }}>
              <th className={`${HEAD} w-12 text-center`}>#</th>
              <th className={`${HEAD} min-w-[200px]`}>Item Name</th>
              <th className={`${HEAD} min-w-[160px]`}>Generic Name</th>
              <th className={`${HEAD} min-w-[140px]`}>Barcode</th>
              <th className={`${HEAD} min-w-[150px]`}>Manufacturer</th>
              <th className={`${HEAD} min-w-[130px]`}>Group</th>
              <th className={`${HEAD} w-32`}>Drug Class</th>
              <th className={`${HEAD} w-28 text-right`}>Buy Price</th>
              <th className={`${HEAD} w-28 text-right`}>Sell Price</th>
              <th className={`${HEAD} w-28`}>Status</th>
              <th className={`${HEAD} w-20 text-center border-r-0`}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-sm text-gray-400">No items found</td>
              </tr>
            ) : (
              items.map((row, idx) => (
                <tr key={row.id} className="hover:bg-[#007476]/[0.03] transition-colors">
                  <td className="border-r border-gray-100 px-2 py-1.5 text-center text-xs text-gray-400 tabular-nums">{idx + 1}</td>
                  <td className={CELL}>
                    <EditableCell value={row.item_name ?? ''} status={st(row.id, 'item_name')} onCommit={(v) => commitField(row, 'item_name', v)} />
                  </td>
                  <td className={CELL}>
                    <EditableCell value={row.generic_name ?? ''} placeholder="—" status={st(row.id, 'generic_name')} onCommit={(v) => commitField(row, 'generic_name', v)} />
                  </td>
                  <td className={CELL}>
                    <EditableCell value={row.barcode ?? ''} status={st(row.id, 'barcode')} onCommit={(v) => commitField(row, 'barcode', v)} />
                  </td>
                  <td className="border-r border-gray-100 px-3 py-1.5 text-sm text-gray-500 whitespace-nowrap">
                    {row.manufacturer?.name ?? '—'}
                  </td>
                  <td className="border-r border-gray-100 px-3 py-1.5 text-sm text-gray-500 whitespace-nowrap">
                    {row.itemGroup?.name ?? '—'}
                  </td>
                  <td className={CELL}>
                    <EditableSelect
                      value={row.drug_class}
                      status={st(row.id, 'drug_class')}
                      options={DRUG_CLASS_OPTIONS.map((d) => ({ value: d, label: d }))}
                      onCommit={(v) => commitField(row, 'drug_class', v)}
                    />
                  </td>
                  <td className={CELL}>
                    <EditableCell value={String(row.buying_price ?? '')} type="number" align="right" status={st(row.id, 'buying_price')} onCommit={(v) => commitField(row, 'buying_price', v)} />
                  </td>
                  <td className={CELL}>
                    <EditableCell value={String(row.selling_price ?? '')} type="number" align="right" status={st(row.id, 'selling_price')} onCommit={(v) => commitField(row, 'selling_price', v)} />
                  </td>
                  <td className={CELL}>
                    <EditableSelect
                      value={String(row.enabled)}
                      status={st(row.id, 'enabled')}
                      options={[{ value: 'true', label: 'Enabled' }, { value: 'false', label: 'Disabled' }]}
                      onCommit={(v) => commitField(row, 'enabled', v)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center justify-center gap-0.5">
                      <button
                        onClick={() => onEditFull(row)}
                        title="Full edit"
                        className="p-1.5 rounded-md text-[#007476] hover:bg-[#007476]/10 transition-colors"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(row.id)}
                        title="Delete"
                        className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Infinite-scroll footer */}
        {(loadingMore || hasMore) && items.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-400 border-t border-gray-100">
            {loadingMore ? (
              <>
                <span className="block h-4 w-4 rounded-full border-2 border-gray-200 border-t-[#007476] animate-spin" />
                Loading more…
              </>
            ) : (
              <span>Scroll to load more</span>
            )}
          </div>
        )}
        {!hasMore && items.length > 0 && (
          <div className="py-3 text-center text-xs text-gray-300 border-t border-gray-100">— End of list —</div>
        )}
      </div>
    </div>
  );
}
