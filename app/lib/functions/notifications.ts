'use server';

import { getServerApiUrl } from '@/app/lib/server-api-url';
import { auth } from '@/auth';
import type {
  BroadcastNotificationRequest,
  BroadcastNotificationResponse,
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
