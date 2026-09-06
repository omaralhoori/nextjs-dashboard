'use server';
import { getServerApiUrl } from '@/app/lib/server-api-url';

import { auth } from '@/auth';
import type {
  RegisteredUsersResponse,
  RegisteredUserDetails,
} from '@/app/lib/definitions/registered-user';

type FetchError = { error: string };

async function getToken(): Promise<string | null> {
  const session = await auth();
  return session?.user?.accessToken ?? null;
}

async function adminFetch(path: string): Promise<Response | null> {
  const token = await getToken();
  if (!token) return null;
  return fetch(`${getServerApiUrl()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export interface RegisteredUsersFilters {
  enabled?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function fetchPharmacyAccountsAction(
  filters: RegisteredUsersFilters = {},
): Promise<RegisteredUsersResponse | FetchError> {
  try {
    const params = new URLSearchParams();
    if (filters.enabled !== undefined) params.set('enabled', String(filters.enabled));
    if (filters.search) params.set('search', filters.search);
    if (filters.limit !== undefined) params.set('limit', String(filters.limit));
    if (filters.offset !== undefined) params.set('offset', String(filters.offset));
    const qs = params.toString();
    const res = await adminFetch(`/admin/registered-users/pharmacy-accounts${qs ? `?${qs}` : ''}`);
    if (!res) return { error: 'UNAUTHORIZED' };
    if (res.status === 401 || res.status === 403) return { error: 'UNAUTHORIZED' };
    if (!res.ok) return { error: 'FETCH_ERROR' };
    return (await res.json()) as RegisteredUsersResponse;
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchIndependentPharmacistsAction(
  filters: RegisteredUsersFilters = {},
): Promise<RegisteredUsersResponse | FetchError> {
  try {
    const params = new URLSearchParams();
    if (filters.enabled !== undefined) params.set('enabled', String(filters.enabled));
    if (filters.search) params.set('search', filters.search);
    if (filters.limit !== undefined) params.set('limit', String(filters.limit));
    if (filters.offset !== undefined) params.set('offset', String(filters.offset));
    const qs = params.toString();
    const res = await adminFetch(`/admin/registered-users/independent-pharmacists${qs ? `?${qs}` : ''}`);
    if (!res) return { error: 'UNAUTHORIZED' };
    if (res.status === 401 || res.status === 403) return { error: 'UNAUTHORIZED' };
    if (!res.ok) return { error: 'FETCH_ERROR' };
    return (await res.json()) as RegisteredUsersResponse;
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchRegisteredUserDetailAction(
  id: string,
): Promise<RegisteredUserDetails | FetchError> {
  try {
    const res = await adminFetch(`/admin/registered-users/${id}`);
    if (!res) return { error: 'UNAUTHORIZED' };
    if (res.status === 401 || res.status === 403) return { error: 'UNAUTHORIZED' };
    if (res.status === 404) return { error: 'NOT_FOUND' };
    if (!res.ok) return { error: 'FETCH_ERROR' };
    return (await res.json()) as RegisteredUserDetails;
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

export async function updatePharmacyAction(
  pharmacyId: string,
  data: import('@/app/lib/definitions/registered-user').UpdatePharmacyRequest,
): Promise<{ success: true; message: string; pharmacy?: any; pharmacyProfile?: any } | { success: false; message: string }> {
  try {
    const token = await getToken();
    if (!token) return { success: false, message: 'No access token available' };

    const res = await fetch(`${getServerApiUrl()}/admin/pharmacies/${pharmacyId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message =
        typeof result?.message === 'string'
          ? result.message
          : Array.isArray(result?.message)
            ? result.message.join(', ')
            : 'Failed to update pharmacy';
      return { success: false, message };
    }

    return {
      success: true,
      message: result.message || 'Pharmacy updated successfully',
      pharmacy: result.pharmacy,
      pharmacyProfile: result.pharmacyProfile,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update pharmacy',
    };
  }
}
