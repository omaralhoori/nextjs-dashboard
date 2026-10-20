'use client';

import { useState, useEffect, useRef } from 'react';
import { EyeIcon, EyeSlashIcon, MagnifyingGlassIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { fetchItemsAction } from '@/app/lib/functions/items';
import type { Item } from '@/app/lib/definitions/item';

// ── Helpers ───────────────────────────────────────────────────────────────────

export const imgUrl = (path: string | null) =>
  path ? `${process.env.NEXT_PUBLIC_API_URL}/${path.replace(/^\//, '')}` : null;

export const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]';
export const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

// ── Shared Modal ──────────────────────────────────────────────────────────────

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative z-10 w-full rounded-2xl bg-white shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ── Status Toggle ─────────────────────────────────────────────────────────────

export function StatusToggle({ active, onToggle, loading }: { active: boolean; onToggle: () => void; loading: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 transition-all ${
        active ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-gray-100 text-gray-500 ring-gray-200'
      } disabled:opacity-50`}
    >
      {active ? <EyeIcon className="h-3 w-3" /> : <EyeSlashIcon className="h-3 w-3" />}
      {active ? 'Active' : 'Inactive'}
    </button>
  );
}

// ── Tab Button ────────────────────────────────────────────────────────────────

export function TabBtn({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-white text-[#007476] shadow-sm ring-1 ring-gray-200'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 py-0.5 text-xs ${active ? 'bg-[#007476] text-white' : 'bg-gray-200 text-gray-600'}`}>
        {count}
      </span>
    </button>
  );
}

// ══ Item Search Modal ═════════════════════════════════════════════════════════

export function itemFormLabel(item: Item): string {
  const formName = item.form || (Array.isArray(item.forms) && item.forms[0]
    ? (typeof item.forms[0] === 'string' ? item.forms[0] : item.forms[0].id)
    : '');
  const volume = item.volume || undefined;
  const qty = item.quantity != null ? String(item.quantity) : undefined;
  return [formName, volume, qty].filter(Boolean).join(' · ');
}

export function itemIngredientsLabel(item: Item): string | null {
  const ingredients = item.active_ingredients;
  if (!ingredients?.length) return null;
  return ingredients
    .slice(0, 3)
    .map(i => [i.active_ingredient_name, i.strength].filter(Boolean).join(' '))
    .join(', ') + (ingredients.length > 3 ? '…' : '');
}

export function ItemSearchModal({ onSelect, onClose }: { onSelect: (item: Item) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await fetchItemsAction({ search: query, limit: 15 });
      if (!('error' in res)) setResults(res.items ?? []);
      setSearching(false);
    }, 300);
  }, [query]);

  return (
    <Modal title="Search Items" onClose={onClose} wide>
      <div className="space-y-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, barcode, or ingredient…"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
          />
        </div>

        {searching && <p className="text-center text-xs text-gray-400 py-4">Searching…</p>}

        {!searching && results.length === 0 && query.trim() && (
          <p className="text-center text-xs text-gray-400 py-4">No items found</p>
        )}

        {!searching && results.length === 0 && !query.trim() && (
          <p className="text-center text-xs text-gray-400 py-4">Type to search items</p>
        )}

        <div className="space-y-1.5 max-h-80 overflow-y-auto">
          {results.map(item => {
            const formLabel = itemFormLabel(item);
            const ingredients = itemIngredientsLabel(item);
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="w-full flex items-start gap-3 rounded-xl border border-gray-100 px-3 py-2.5 text-left hover:bg-[#007476]/5 hover:border-[#007476]/20 transition-colors"
              >
                <CheckCircleIcon className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{item.item_name}</p>
                    {item.drug_class && (
                      <span className="flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                        {item.drug_class}
                      </span>
                    )}
                  </div>

                  {item.generic_name && (
                    <p className="text-xs text-gray-500 truncate">{item.generic_name}</p>
                  )}

                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-500">
                    {item.manufacturer?.name && (
                      <span><span className="text-gray-400">Mfr:</span> {item.manufacturer.name}</span>
                    )}
                    {formLabel && (
                      <span><span className="text-gray-400">Form:</span> {formLabel}</span>
                    )}
                    {item.barcode && (
                      <span className="font-mono"><span className="text-gray-400">Barcode:</span> {item.barcode}</span>
                    )}
                    {item.itemGroup?.name && (
                      <span><span className="text-gray-400">Group:</span> {item.itemGroup.name}</span>
                    )}
                    {typeof item.buying_price === 'number' && (
                      <span>
                        <span className="text-gray-400">Price:</span>{' '}
                        {item.buying_price}
                        {item.currencyEntity?.symbol ? ` ${item.currencyEntity.symbol}` : ''}
                      </span>
                    )}
                  </div>

                  {ingredients && (
                    <p className="text-[11px] text-gray-400 truncate">
                      <span className="text-gray-400">Ingredients:</span> {ingredients}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

// ── Shared Small Components ───────────────────────────────────────────────────

export function ActionIcon({ icon, label, onClick, color }: { icon: React.ReactNode; label: string; onClick: () => void; color: 'blue' | 'red' }) {
  const cls = color === 'blue'
    ? 'text-blue-500 hover:bg-blue-50'
    : 'text-red-500 hover:bg-red-50';
  return (
    <button onClick={onClick} title={label} className={`rounded-lg p-1.5 transition-colors ${cls}`}>
      {icon}
    </button>
  );
}

export function EmptyState({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
      <div className="text-gray-300 mb-3">{icon}</div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

