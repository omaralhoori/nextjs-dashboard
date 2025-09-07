'use server';

// ============================================================================
// PHARMACY FILE MANAGEMENT FUNCTIONS
// ============================================================================

import { auth } from '@/auth';

export async function fetchPharmacyFilesAction(pharmacyId: string) {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { error: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pharmacy-files/pharmacy/${pharmacyId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      return { error: 'UNAUTHORIZED' };
    }

    if (response.status === 403) {
      return { error: 'PERMISSION_DENIED' };
    }

    if (!response.ok) {
      return { error: 'NETWORK_ERROR' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function downloadPharmacyFileAction(fileId: string) {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { error: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/pharmacy-files/download/${fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
    });

    if (response.status === 401) {
      return { error: 'UNAUTHORIZED' };
    }

    if (response.status === 403) {
      return { error: 'PERMISSION_DENIED' };
    }

    if (!response.ok) {
      return { error: 'NETWORK_ERROR' };
    }

    const blob = await response.blob();
    return { success: true, blob };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'NETWORK_ERROR' };
  }
}
