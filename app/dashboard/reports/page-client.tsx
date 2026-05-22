'use client';

import { useState, useCallback } from 'react';
import {
  ChartBarIcon,
  CubeIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import { TableSkeleton } from '@/app/ui/data-table';
import {
  fetchWarehouseSalesReportAction,
} from '@/app/lib/functions/stats';
import type { WarehouseSalesReport, WarehouseSalesManufacturer } from '@/app/lib/functions/stats';

const ALL_STATUSES = ['Pending', 'Processing', 'Delivery', 'Completed', 'Rejected', 'Undeliverable'];

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Processing: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  Delivery: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  Undeliverable: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
};

function formatCurrency(amount: number, currency: string) {
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Summary Cards ─────────────────────────────────────────────────────────────

function SummaryCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}>
          {icon}
        </div>
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Manufacturer Table ────────────────────────────────────────────────────────

function ManufacturerTable({ rows, totalSales }: { rows: WarehouseSalesManufacturer[]; totalSales: number }) {
  if (!rows.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-400">
        No manufacturer data for this period
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'linear-gradient(90deg, #004d4f, #007476)' }}>
              {['#', 'Manufacturer', 'Total Sales', 'Share', 'Orders', 'Items'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/90 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, i) => {
              const share = totalSales > 0 ? ((row.total_sales / totalSales) * 100).toFixed(1) : '0.0';
              return (
                <tr key={row.manufacturer_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.manufacturer_name}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(row.total_sales, row.currency)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 max-w-[80px] rounded-full bg-gray-100">
                        <div className="h-1.5 rounded-full" style={{ width: `${share}%`, background: 'linear-gradient(90deg, #007476, #2E8BC0)' }} />
                      </div>
                      <span className="text-xs text-gray-500 w-10">{share}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{row.order_count}</td>
                  <td className="px-4 py-3 text-gray-600">{row.item_count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-gray-100">
        {rows.map((row, i) => {
          const share = totalSales > 0 ? ((row.total_sales / totalSales) * 100).toFixed(1) : '0.0';
          return (
            <div key={row.manufacturer_id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs text-gray-400 font-mono mr-2">#{i + 1}</span>
                  <span className="font-medium text-gray-900">{row.manufacturer_name}</span>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{share}%</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(row.total_sales, row.currency)}</p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>{row.order_count} orders</span>
                <span>{row.item_count} items</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
                <div className="h-1.5 rounded-full" style={{ width: `${share}%`, background: 'linear-gradient(90deg, #007476, #2E8BC0)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ReportsPageClient() {
  const today = new Date();
  const firstOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  const toISO = (d: Date) => d.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(toISO(firstOfPrevMonth));
  const [endDate, setEndDate] = useState(toISO(lastOfPrevMonth));
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Completed', 'Processing', 'Delivery']);
  const [report, setReport] = useState<WarehouseSalesReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleStatus = (s: string) => {
    setSelectedStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const runReport = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setErrorMsg(null);
    const result = await fetchWarehouseSalesReportAction({
      start_date: startDate,
      end_date: endDate,
      status: selectedStatuses.length ? selectedStatuses.join(',') : undefined,
    });
    if ('error' in result) {
      setErrorMsg('Failed to load report. Please try again.');
    } else {
      setReport(result);
    }
    setLoading(false);
  }, [startDate, endDate, selectedStatuses]);

  return (
    <PageShell
      title="Warehouse Sales Report"
      errorMessage={errorMsg}
      onClearError={() => setErrorMsg(null)}
      filters={
        <div className="space-y-4">
          {/* Date Range */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
              />
            </div>
            <button
              onClick={runReport}
              disabled={loading || !startDate || !endDate}
              className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}
            >
              <FunnelIcon className="h-4 w-4" />
              {loading ? 'Loading…' : 'Generate Report'}
            </button>
          </div>

          {/* Status Filter */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Order Statuses</p>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map(s => {
                const active = selectedStatuses.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${
                      active
                        ? STATUS_COLORS[s]
                        : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-2xl border border-gray-200 bg-white animate-pulse" />
            ))}
          </div>
          <TableSkeleton cols={6} rows={8} />
        </div>
      ) : report ? (
        <div className="space-y-4">
          {/* Period info */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">Period:</span>
            {formatDate(report.period.start)} → {formatDate(report.period.end)}
            {report.filters.status.length > 0 && (
              <span className="ml-2 text-gray-400">· {report.filters.status.join(', ')}</span>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              icon={<CurrencyDollarIcon className="h-4 w-4" />}
              label="Total Sales"
              value={formatCurrency(report.summary.total_sales, report.summary.currency)}
              sub={`${report.by_manufacturer.length} manufacturers contributed`}
            />
            <SummaryCard
              icon={<ShoppingCartIcon className="h-4 w-4" />}
              label="Total Orders"
              value={report.summary.total_orders.toLocaleString()}
              sub="Across all warehouses"
            />
            <SummaryCard
              icon={<CubeIcon className="h-4 w-4" />}
              label="Top Manufacturer"
              value={report.by_manufacturer[0]?.manufacturer_name ?? '—'}
              sub={report.by_manufacturer[0] ? formatCurrency(report.by_manufacturer[0].total_sales, report.by_manufacturer[0].currency) : undefined}
            />
          </div>

          {/* Manufacturer Table */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ChartBarIcon className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Sales by Manufacturer</h2>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #007476, #2E8BC0)' }}
              >
                {report.by_manufacturer.length}
              </span>
            </div>
            <ManufacturerTable rows={report.by_manufacturer} totalSales={report.summary.total_sales} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
          <ChartBarIcon className="h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No report generated yet</p>
          <p className="text-xs text-gray-400 mt-1">Select a date range and click Generate Report</p>
        </div>
      )}
    </PageShell>
  );
}
