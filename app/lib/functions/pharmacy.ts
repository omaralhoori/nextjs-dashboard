'use server';

// ============================================================================
// PHARMACY MANAGEMENT FUNCTIONS
// ============================================================================

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import type {
  PharmaciesResponse,
  AllPharmaciesResponse,
} from '@/app/lib/definitions/pharmacy';

export async function approvePharmacy(pharmacyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pharmacies/${pharmacyId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to approve pharmacy: ${response.statusText}`);
    }

    revalidatePath('/dashboard');
    return { success: true, message: 'Pharmacy approved successfully' };
  } catch (error) {
    console.error('Error approving pharmacy:', error);
    return { success: false, message: 'Failed to approve pharmacy' };
  }
}

export async function rejectPharmacy(pharmacyId: string, reason?: string) {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pharmacies/${pharmacyId}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(`Failed to reject pharmacy: ${response.statusText}`);
    }

    revalidatePath('/dashboard');
    return { success: true, message: 'Pharmacy rejected successfully' };
  } catch (error) {
    console.error('Error rejecting pharmacy:', error);
    return { success: false, message: 'Failed to reject pharmacy' };
  }
}

export async function fetchPendingPharmaciesAction(): Promise<PharmaciesResponse | { error: 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR' }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      console.log('No access token available');
      return { error: 'UNAUTHORIZED' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error('NEXT_PUBLIC_API_URL environment variable is not set');
      return { error: 'NETWORK_ERROR' };
    }

    const url = `${apiUrl}/admin/pharmacies?status=Pending&limit=5`;
    console.log('Fetching from URL:', url);
    console.log('Using access token:', session.user.accessToken.substring(0, 20) + '...');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (response.status === 401) {
      console.log('Unauthorized - token may be expired');
      return { error: 'UNAUTHORIZED' };
    }

    if (response.status === 403) {
      console.log('Permission denied');
      return { error: 'PERMISSION_DENIED' };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', response.status, errorText);
      return { error: 'NETWORK_ERROR' };
    }

    const data: PharmaciesResponse = await response.json();
    console.log('Successfully fetched pharmacies:', data.pharmacies.length);
    return data;
  } catch (error) {
    console.error('API Error Details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - check if API server is running and accessible');
    }
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchAllPharmaciesAction(page: number = 1, limit: number = 20): Promise<AllPharmaciesResponse | { error: 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR' }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      console.log('No access token available');
      return { error: 'UNAUTHORIZED' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error('NEXT_PUBLIC_API_URL environment variable is not set');
      return { error: 'NETWORK_ERROR' };
    }

    const url = `${apiUrl}/admin/pharmacies?page=${page}&limit=${limit}`;
    console.log('Fetching all pharmacies from URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (response.status === 401) {
      console.log('Unauthorized - token may be expired');
      return { error: 'UNAUTHORIZED' };
    }

    if (response.status === 403) {
      console.log('Permission denied');
      return { error: 'PERMISSION_DENIED' };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', response.status, errorText);
      return { error: 'NETWORK_ERROR' };
    }

    const data: AllPharmaciesResponse = await response.json();
    console.log('Successfully fetched all pharmacies:', data.pharmacies.length);
    return data;
  } catch (error) {
    console.error('API Error Details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - check if API server is running and accessible');
    }
    return { error: 'NETWORK_ERROR' };
  }
}
