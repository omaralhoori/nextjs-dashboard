'use client';

import { ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// ── Status Badge ──────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

export function StatusBadge({ active, activeLabel = 'Active', inactiveLabel = 'Inactive' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

// ── Role Badge ────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700 ring-purple-200',
  warehouse_manager: 'bg-blue-50 text-blue-700 ring-blue-200',
  warehouse_user: 'bg-sky-50 text-sky-700 ring-sky-200',
  pharmacy_manager: 'bg-teal-50 text-teal-700 ring-teal-200',
  pharmacy_user: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
};

export function RoleBadge({ role }: { role: string }) {
  const color = ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-600 ring-gray-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${color}`}>
      {role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
}

// ── Action Button ─────────────────────────────────────────────────────────────

interface ActionBtnProps {
  onClick?: () => void;
  icon: ReactNode;
  label: string;
  variant?: 'edit' | 'delete' | 'toggle-on' | 'toggle-off' | 'view';
  disabled?: boolean;
}

const VARIANT_CLASSES: Record<string, string> = {
  edit: 'text-blue-600 hover:bg-blue-50',
  delete: 'text-red-500 hover:bg-red-50',
  'toggle-on': 'text-amber-600 hover:bg-amber-50',
  'toggle-off': 'text-emerald-600 hover:bg-emerald-50',
  view: 'text-gray-600 hover:bg-gray-100',
};

export function ActionBtn({ onClick, icon, label, variant = 'view', disabled = false }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-40 ${VARIANT_CLASSES[variant]}`}
    >
      {icon}
    </button>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  mobileCard: (row: T) => ReactNode;
}

export function DataTable<T>({ columns, rows, keyExtractor, emptyMessage = 'No records found', mobileCard }: DataTableProps<T>) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, #004d4f, #007476)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-white/90 uppercase tracking-wider ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-sm text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={keyExtractor(row)} className="hover:bg-gray-50/60 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-sm text-gray-700 ${col.className ?? ''}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-gray-100">
        {rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">{emptyMessage}</div>
        ) : (
          rows.map((row) => (
            <div key={keyExtractor(row)} className="p-4">
              {mobileCard(row)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({ currentPage, totalPages, totalItems, pageSize, onPageChange }: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  const pages: (number | '…')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('…');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm text-sm">
      <span className="text-gray-500">
        Showing <strong className="text-gray-800">{from}–{to}</strong> of <strong className="text-gray-800">{totalItems}</strong>
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-2 text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`min-w-[32px] h-8 rounded-md text-sm font-medium transition-colors ${
                currentPage === p
                  ? 'text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={currentPage === p ? { background: '#007476' } : {}}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-40 transition-colors"
        >
          <ChevronRightIcon className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────

export function TableSkeleton({ cols = 5, rows = 6 }: { cols?: number; rows?: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="hidden md:block">
        <div className="h-10" style={{ background: 'linear-gradient(90deg, #004d4f, #007476)' }} />
        <div className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-3">
              {Array.from({ length: cols }).map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded animate-pulse flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="md:hidden divide-y divide-gray-100">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Search + Filter Bar ───────────────────────────────────────────────────────

interface FilterBarProps {
  children: ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      {children}
    </div>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }: SearchInputProps) {
  return (
    <div className={`relative flex-1 min-w-[180px] ${className}`}>
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full h-9 pl-9 pr-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#007476] focus:ring-1 focus:ring-[#007476] outline-none bg-white"
      />
    </div>
  );
}

interface FilterSelectProps {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: { value: string; label: string }[];
}

export function FilterSelect({ value, onChange, label, options }: FilterSelectProps) {
  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 pl-3 pr-8 rounded-lg border border-gray-300 text-sm text-gray-900 focus:border-[#007476] focus:ring-1 focus:ring-[#007476] outline-none bg-white appearance-none cursor-pointer"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '16px' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
