'use server';

import { getServerApiUrl } from '@/app/lib/server-api-url';
import { auth } from '@/auth';
import type {
  BroadcastNotificationRequest,
  BroadcastNotificationResponse,
  PriceUpdatesResponse,
} from '@/app/lib/definitions/notification';

const API_BASE_URL = getServerApiUrl() || 'http://localhost:3001';

async function getAuthHeaders() {
  const session = await auth();
  if (!session?.user?.accessToken) {
    throw new Error('UNAUTHORIZED');
  }
  return {
    Authorization: `Bearer ${session.user.accessToken}`,
    'Content-Type': 'application/json',
  };
}

export async function broadcastNotificationAction(
  payload: BroadcastNotificationRequest,
): Promise<
  | { success: true; message: string; result: BroadcastNotificationResponse }
  | { success: false; message: string }
> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/notifications/broadcast`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) return { success: false, message: 'UNAUTHORIZED' };
      if (response.status === 403) return { success: false, message: 'PERMISSION_DENIED' };
      const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      return { success: false, message: msg || 'Failed to send notification' };
    }

    return {
      success: true,
      message: data.message || 'Notification sent',
      result: data as BroadcastNotificationResponse,
    };
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

/** «تحديث الأسعار»: latest batches sent to pharmacies and catalog price changes still waiting. */
export async function fetchPriceUpdatesAction(): Promise<PriceUpdatesResponse | { error: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/notifications/price-updates`, { headers, cache: 'no-store' });
    if (response.status === 401) return { error: 'UNAUTHORIZED' };
    if (response.status === 403) return { error: 'PERMISSION_DENIED' };
    if (!response.ok) return { error: 'NETWORK_ERROR' };
    return await response.json();
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

/** Send the waiting price changes now, without waiting for the quiet period. */
export async function sendPriceUpdatesNowAction(): Promise<{ success: boolean; message: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/notifications/price-updates/send-now`, { method: 'POST', headers, cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { success: false, message: data.message || 'Failed to send price updates' };
    if (data.skipped === 'DISABLED') return { success: false, message: 'Price notifications are off (Home Screen → Settings)' };
    if (data.skipped === 'RUNNING') return { success: false, message: 'Already sending — try again in a minute' };
    return { success: true, message: `${data.batches} notification(s) for ${data.items} item(s) sent to ${data.users} user(s)` };
  } catch {
    return { success: false, message: 'NETWORK_ERROR' };
  }
}
