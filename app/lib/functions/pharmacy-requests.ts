'use server';
import { getServerApiUrl } from '@/app/lib/server-api-url';

import { auth } from '@/auth';
import type { AppInfo, PharmacyRequestsResponse } from '@/app/lib/definitions/pharmacy-requests';

type ActionResult<T = undefined> = { success: boolean; message: string; data?: T };
type FetchError = { error: string };

async function adminFetch(path: string, options: RequestInit = {}): Promise<Response | null> {
  const session = await auth();
  const token = session?.user?.accessToken;
  if (!token) return null;
  return fetch(`${getServerApiUrl()}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
    cache: 'no-store',
  });
}

async function read<T>(path: string, pick: (data: any) => T): Promise<T | FetchError> {
  try {
    const res = await adminFetch(path);
    if (!res || res.status === 401 || res.status === 403) return { error: 'UNAUTHORIZED' };
    if (!res.ok) return { error: 'FETCH_ERROR' };
    return pick(await res.json());
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

async function write<T>(path: string, method: string, body: unknown, pick: (data: any) => T | undefined, fallback: string): Promise<ActionResult<T>> {
  try {
    const res = await adminFetch(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
    if (!res) return { success: false, message: 'Unauthorized' };
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      return { success: false, message: msg || fallback };
    }
    return { success: true, message: data.message || 'Done', data: pick(data) };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

// ── Change requests (name/pharmacist, address, documents) ─────────────────────

export async function fetchPharmacyRequestsAction(status = 'pending', kind?: string): Promise<PharmacyRequestsResponse | FetchError> {
  const q = new URLSearchParams({ status, ...(kind && { kind }) });
  return read(`/admin/pharmacy-requests?${q}`, (d) => d as PharmacyRequestsResponse);
}

export async function approvePharmacyRequestAction(id: string, adminNotes?: string): Promise<ActionResult> {
  return write(`/admin/pharmacy-requests/${id}/approve`, 'PUT', { admin_notes: adminNotes || undefined }, () => undefined, 'Failed to approve');
}

export async function rejectPharmacyRequestAction(id: string, adminNotes: string): Promise<ActionResult> {
  return write(`/admin/pharmacy-requests/${id}/reject`, 'PUT', { admin_notes: adminNotes }, () => undefined, 'Failed to reject');
}

// ── App info & notifications ──────────────────────────────────────────────────

export async function fetchAppInfoAction(): Promise<{ app_info: AppInfo } | FetchError> {
  return read('/admin/app-info', (d) => ({ app_info: d.app_info as AppInfo }));
}

export async function updateAppInfoAction(dto: Partial<AppInfo>): Promise<ActionResult<AppInfo>> {
  return write('/admin/app-info', 'PATCH', dto, (d) => d.app_info, 'Failed to save app info');
}

export async function runOffersDigestAction(pharmacyId?: string): Promise<ActionResult<{ pharmacies: number; offers: number; notified_users: number }>> {
  return write('/admin/notifications/offers-digest/run', 'POST', { pharmacy_id: pharmacyId || undefined }, (d) => d.result, 'Failed to run the digest');
}
