'use server';

import { auth } from '@/auth';
import type {
  PasswordResetRequestsResponse,
  PasswordResetRequest,
} from '@/app/lib/definitions/password-reset';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAuthHeaders() {
  const session = await auth();
  if (!session?.user?.accessToken) throw new Error('UNAUTHORIZED');
  return { Authorization: `Bearer ${session.user.accessToken}`, 'Content-Type': 'application/json' };
}

export async function fetchPasswordResetRequestsAction(params: {
  status?: 'pending' | 'resolved' | 'rejected';
  limit?: number;
  offset?: number;
} = {}): Promise<PasswordResetRequestsResponse | { error: string }> {
  try {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.limit) query.append('limit', String(params.limit));
    if (params.offset !== undefined) query.append('offset', String(params.offset));

    const response = await fetch(`${API_BASE_URL}/admin/password-reset-requests?${query}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (response.status === 401) return { error: 'UNAUTHORIZED' };
    if (response.status === 403) return { error: 'PERMISSION_DENIED' };
    if (!response.ok) return { error: 'NETWORK_ERROR' };

    return await response.json();
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

export async function resolvePasswordResetRequestAction(
  requestId: string,
  adminNotes?: string,
): Promise<{ success: boolean; message: string; request?: PasswordResetRequest }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/password-reset-requests/${requestId}/resolve`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ adminNotes }),
    });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Failed to resolve request' };
    return { success: true, message: data.message, request: data.request };
  } catch {
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

export async function rejectPasswordResetRequestAction(
  requestId: string,
  adminNotes?: string,
): Promise<{ success: boolean; message: string; request?: PasswordResetRequest }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/password-reset-requests/${requestId}/reject`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ adminNotes }),
    });
    const data = await response.json();
    if (!response.ok) return { success: false, message: data.message || 'Failed to reject request' };
    return { success: true, message: data.message, request: data.request };
  } catch {
    return { success: false, message: 'NETWORK_ERROR' };
  }
}
