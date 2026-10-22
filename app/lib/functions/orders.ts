'use server';
import { getServerApiUrl } from '@/app/lib/server-api-url';

import { auth } from '@/auth';
import type { AdminOrderDetail, AdminOrdersResponse, OrderStatus } from '@/app/lib/definitions/order';

const API_BASE_URL = getServerApiUrl();

async function getAuthHeaders() {
  const session = await auth();
  if (!session?.user?.accessToken) throw new Error('UNAUTHORIZED');
  return { Authorization: `Bearer ${session.user.accessToken}`, 'Content-Type': 'application/json' };
}

function errorOf(status: number) {
  if (status === 401) return { error: 'UNAUTHORIZED' };
  if (status === 403) return { error: 'PERMISSION_DENIED' };
  return { error: 'NETWORK_ERROR' };
}

export async function fetchAdminOrdersAction(params: {
  status?: OrderStatus;
  warehouse_id?: string;
  q?: string;
  page?: number;
  limit?: number;
} = {}): Promise<AdminOrdersResponse | { error: string }> {
  try {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') query.append(k, String(v));
    const response = await fetch(`${API_BASE_URL}/admin/orders?${query}`, { headers, cache: 'no-store' });
    if (!response.ok) return errorOf(response.status);
    return await response.json();
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchAdminOrderAction(orderId: string): Promise<AdminOrderDetail | { error: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, { headers, cache: 'no-store' });
    if (!response.ok) return errorOf(response.status);
    return await response.json();
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

export async function updateAdminOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  statusNote?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status, status_note: statusNote || undefined }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { success: false, message: data.message || 'Failed to update status' };
    return { success: true, message: data.message };
  } catch {
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

/** Invoice PDF as base64 (the browser turns it into a download). */
export async function downloadAdminOrderPdfAction(orderId: string): Promise<{ base64: string } | { error: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/pdf`, { headers, cache: 'no-store' });
    if (!response.ok) return errorOf(response.status);
    return { base64: Buffer.from(await response.arrayBuffer()).toString('base64') };
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}
