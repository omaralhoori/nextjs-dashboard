'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BuildingStorefrontIcon,
  BuildingOfficeIcon,
  CubeIcon,
  CogIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import {
  fetchWarehouseStatsAction,
  fetchPharmacyStatsAction,
  fetchItemStatsAction,
  fetchManufacturerStatsAction,
} from '@/app/lib/functions/stats';
import type {
  WarehouseStats,
  PharmacyStats,
  ItemStats,
  ManufacturerStats,
} from '@/app/lib/functions/stats';

// ── Skeleton ──────────────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-gray-200" />
        <div className="h-4 w-28 rounded bg-gray-200" />
      </div>
      <div className="h-9 w-20 rounded bg-gray-200 mb-3" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-3/4 rounded bg-gray-100" />
      </div>
    </div>
  );
}

// ── Stat Row ──────────────────────────────────────────────────────────────────

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${color}`}>{value.toLocaleString()}</span>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  total: number;
  rows: Array<{ label: string; value: number; color: string }>;
  href: string;
  accent: string;
}

function StatCard({ icon, title, total, rows, href, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${accent}`}>
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-600">{title}</span>
        </div>
        <Link href={href} className="text-gray-400 hover:text-[#007476] transition-colors">
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-3">{total.toLocaleString()}</p>
      <div className="space-y-1.5 border-t border-gray-100 pt-3">
        {rows.map(r => <StatRow key={r.label} {...r} />)}
      </div>
    </div>
  );
}

// ── Pharmacy Status Bar ───────────────────────────────────────────────────────

function PharmacyStatusBar({ stats }: { stats: PharmacyStats }) {
  const segments = [
    { label: 'Active', value: stats.active, color: '#10b981' },
    { label: 'Pending', value: stats.pending, color: '#f59e0b' },
    { label: 'Disabled', value: stats.disabled, color: '#ef4444' },
  ];
  const total = stats.total || 1;
  return (
    <div className="space-y-2">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
        {segments.map(s => (
          <div
            key={s.label}
            style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
          />
        ))}
      </div>
      <div className="flex gap-4 flex-wrap">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            {s.label}: <span className="font-semibold text-gray-700">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Drug Class Breakdown ──────────────────────────────────────────────────────

const DRUG_CLASS_COLORS: Record<string, string> = {
  OTC: 'bg-emerald-100 text-emerald-700',
  RX: 'bg-blue-100 text-blue-700',
  Controlled: 'bg-red-100 text-red-700',
};

function DrugClassBreakdown({ byDrugClass }: { byDrugClass: Record<string, number> }) {
  const entries = Object.entries(byDrugClass);
  if (!entries.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([cls, count]) => (
        <span key={cls} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${DRUG_CLASS_COLORS[cls] ?? 'bg-gray-100 text-gray-600'}`}>
          {cls}: {count.toLocaleString()}
        </span>
      ))}
    </div>
  );
}

// ── Country Breakdown ─────────────────────────────────────────────────────────

function CountryList({ by_country }: { by_country: Array<{ country: string; count: number }> }) {
  const top = by_country.slice(0, 4);
  return (
    <div className="space-y-1.5">
      {top.map(c => (
        <div key={c.country} className="flex items-center justify-between text-sm">
          <span className="text-gray-500 truncate">{c.country || 'Unknown'}</span>
          <span className="font-semibold text-gray-700 ml-2">{c.count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Quick Action Card ─────────────────────────────────────────────────────────

function QuickAction({ href, icon, label, description }: { href: string; icon: React.ReactNode; label: string; description: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-[#007476] hover:shadow-sm transition-all group">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[#007476] group-hover:bg-[#007476] group-hover:text-white transition-colors" style={{ backgroundColor: '#f0fafa' }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-gray-400 ml-auto flex-shrink-0 group-hover:text-[#007476] transition-colors" />
    </Link>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function DashboardPageClient() {
  const [warehouseStats, setWarehouseStats] = useState<WarehouseStats | null>(null);
  const [pharmacyStats, setPharmacyStats] = useState<PharmacyStats | null>(null);
  const [itemStats, setItemStats] = useState<ItemStats | null>(null);
  const [mfgStats, setMfgStats] = useState<ManufacturerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchWarehouseStatsAction(),
      fetchPharmacyStatsAction(),
      fetchItemStatsAction(),
      fetchManufacturerStatsAction(),
    ]).then(([w, p, i, m]) => {
      if (!('error' in w)) setWarehouseStats(w);
      if (!('error' in p)) setPharmacyStats(p);
      if (!('error' in i)) setItemStats(i);
      if (!('error' in m)) setMfgStats(m);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 mt-4 md:mt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Overview of your PharmaSERV system</p>
        </div>
        <Link
          href="/dashboard/reports"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}
        >
          <ChartBarIcon className="h-4 w-4" />
          Sales Report
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={<BuildingStorefrontIcon className="h-5 w-5" />}
              title="Warehouses"
              total={warehouseStats?.total ?? 0}
              href="/dashboard/warehouses"
              accent="bg-[#007476]"
              rows={[
                { label: 'Enabled', value: warehouseStats?.enabled ?? 0, color: 'text-emerald-600' },
                { label: 'Disabled', value: warehouseStats?.disabled ?? 0, color: 'text-red-500' },
              ]}
            />
            <StatCard
              icon={<BuildingOfficeIcon className="h-5 w-5" />}
              title="Pharmacies"
              total={pharmacyStats?.total ?? 0}
              href="/dashboard/pharmacies"
              accent="bg-amber-500"
              rows={[
                { label: 'Active', value: pharmacyStats?.active ?? 0, color: 'text-emerald-600' },
                { label: 'Pending', value: pharmacyStats?.pending ?? 0, color: 'text-amber-600' },
                { label: 'Disabled', value: pharmacyStats?.disabled ?? 0, color: 'text-red-500' },
              ]}
            />
            <StatCard
              icon={<CubeIcon className="h-5 w-5" />}
              title="Items"
              total={itemStats?.total ?? 0}
              href="/dashboard/items"
              accent="bg-indigo-500"
              rows={[
                { label: 'Enabled', value: itemStats?.enabled ?? 0, color: 'text-emerald-600' },
                { label: 'Disabled', value: itemStats?.disabled ?? 0, color: 'text-red-500' },
              ]}
            />
            <StatCard
              icon={<CogIcon className="h-5 w-5" />}
              title="Manufacturers"
              total={mfgStats?.total ?? 0}
              href="/dashboard/manufacturers"
              accent="bg-purple-500"
              rows={[
                { label: 'Active', value: mfgStats?.active ?? 0, color: 'text-emerald-600' },
                { label: 'Inactive', value: mfgStats?.inactive ?? 0, color: 'text-red-500' },
              ]}
            />
          </>
        )}
      </div>

      {/* Detail Panels */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Pharmacy Status */}
          {pharmacyStats && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Pharmacy Status</h2>
                {pharmacyStats.pending > 0 && (
                  <Link href="/dashboard/pharmacies" className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {pharmacyStats.pending} pending
                  </Link>
                )}
              </div>
              <PharmacyStatusBar stats={pharmacyStats} />
            </div>
          )}

          {/* Drug Class Breakdown */}
          {itemStats && Object.keys(itemStats.byDrugClass).length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Items by Drug Class</h2>
                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  {itemStats.enabled.toLocaleString()} enabled
                </div>
              </div>
              <DrugClassBreakdown byDrugClass={itemStats.byDrugClass} />
              {itemStats.disabled > 0 && (
                <div className="mt-3 flex items-center gap-1 text-xs text-red-500">
                  <XCircleIcon className="h-3.5 w-3.5" />
                  {itemStats.disabled.toLocaleString()} disabled items
                </div>
              )}
            </div>
          )}

          {/* Manufacturers by Country */}
          {mfgStats && mfgStats.by_country.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Manufacturers by Country</h2>
              <CountryList by_country={mfgStats.by_country} />
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction href="/dashboard/pharmacies" icon={<ClockIcon className="h-5 w-5" />} label="Review Pharmacies" description="Approve or reject pending registrations" />
          <QuickAction href="/dashboard/warehouses/create" icon={<BuildingStorefrontIcon className="h-5 w-5" />} label="New Warehouse" description="Create a new warehouse" />
          <QuickAction href="/dashboard/items" icon={<CubeIcon className="h-5 w-5" />} label="Manage Items" description="Search and update inventory items" />
          <QuickAction href="/dashboard/reports" icon={<ChartBarIcon className="h-5 w-5" />} label="Sales Report" description="View warehouse sales by manufacturer" />
        </div>
      </div>
    </div>
  );
}
