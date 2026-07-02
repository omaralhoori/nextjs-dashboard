'use server';
import { getServerApiUrl } from '@/app/lib/server-api-url';

import { auth } from '@/auth';

export interface WarehouseStats {
  total: number;
  enabled: number;
  disabled: number;
}

export interface PharmacyStats {
  total: number;
  pending: number;
  active: number;
  disabled: number;
}

export interface ItemStats {
  total: number;
  enabled: number;
  disabled: number;
  byDrugClass: Record<string, number>;
  byManufacturer: Record<string, number>;
  byItemGroup: Record<string, number>;
}

export interface ManufacturerStats {
  total: number;
  active: number;
  inactive: number;
  by_country: Array<{ country: string; count: number }>;
}

export interface WarehouseSalesManufacturer {
  manufacturer_id: string;
  manufacturer_name: string;
  total_sales: number;
  order_count: number;
  item_count: number;
  currency: string;
}

export interface WarehouseSalesReport {
  period: { start: string; end: string };
  filters: { warehouse_id: string | null; status: string[] };
  summary: { total_sales: number; total_orders: number; currency: string };
  by_manufacturer: WarehouseSalesManufacturer[];
}

type StatsError = { error: string };

async function getToken(): Promise<string | null> {
  const session = await auth();
  return session?.user?.accessToken ?? null;
}

export async function fetchWarehouseStatsAction(): Promise<WarehouseStats | StatsError> {
  try {
    const token = await getToken();
    if (!token) return { error: 'UNAUTHORIZED' };
    const res = await fetch(`${getServerApiUrl()}/admin/stats/warehouses`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return { error: 'FETCH_ERROR' };
    const data = await res.json();
    return data.statistics as WarehouseStats;
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchPharmacyStatsAction(): Promise<PharmacyStats | StatsError> {
  try {
    const token = await getToken();
    if (!token) return { error: 'UNAUTHORIZED' };
    const res = await fetch(`${getServerApiUrl()}/admin/stats/pharmacies`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return { error: 'FETCH_ERROR' };
    const data = await res.json();
    return data.statistics as PharmacyStats;
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchItemStatsAction(): Promise<ItemStats | StatsError> {
  try {
    const token = await getToken();
    if (!token) return { error: 'UNAUTHORIZED' };
    const res = await fetch(`${getServerApiUrl()}/admin/stats/items`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return { error: 'FETCH_ERROR' };
    const data = await res.json();
    return data.statistics as ItemStats;
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchManufacturerStatsAction(): Promise<ManufacturerStats | StatsError> {
  try {
    const token = await getToken();
    if (!token) return { error: 'UNAUTHORIZED' };
    const res = await fetch(`${getServerApiUrl()}/admin/stats/manufacturers`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return { error: 'FETCH_ERROR' };
    const data = await res.json();
    return data.statistics as ManufacturerStats;
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

export interface WarehouseSalesFilters {
  start_date?: string;
  end_date?: string;
  warehouse_id?: string;
  status?: string;
}

export async function fetchWarehouseSalesReportAction(
  filters: WarehouseSalesFilters = {},
): Promise<WarehouseSalesReport | StatsError> {
  try {
    const token = await getToken();
    if (!token) return { error: 'UNAUTHORIZED' };
    const params = new URLSearchParams();
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.warehouse_id) params.set('warehouse_id', filters.warehouse_id);
    if (filters.status) params.set('status', filters.status);
    const url = `${getServerApiUrl()}/admin/reports/warehouse-sales${params.toString() ? `?${params}` : ''}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return { error: 'FETCH_ERROR' };
    const data = await res.json();
    return data.report as WarehouseSalesReport;
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}
