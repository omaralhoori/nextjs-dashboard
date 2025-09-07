'use server';

// ============================================================================
// WAREHOUSE DISTRICT MANAGEMENT FUNCTIONS
// ============================================================================

import { auth } from '@/auth';
import type {
  WarehouseDistrictsResponse,
} from '@/app/lib/definitions/warehouse';

export async function fetchWarehouseDistrictsAction(warehouseId: string): Promise<WarehouseDistrictsResponse | { error: 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR' }> {
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

    const url = `${apiUrl}/admin/warehouses/${warehouseId}/districts`;
    console.log('Fetching warehouse districts from URL:', url);

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

    const data: WarehouseDistrictsResponse = await response.json();
    console.log('Successfully fetched warehouse districts:', data.districts.length);
    return data;
  } catch (error) {
    console.error('API Error Details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - check if API server is running and accessible');
    }
    return { error: 'NETWORK_ERROR' };
  }
}

export async function addDistrictToWarehouseAction(warehouseId: string, districtId: string): Promise<{ success: true; message: string } | { success: false; message: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'No access token available' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return { success: false, message: 'API URL not configured' };
    }

    const response = await fetch(`${apiUrl}/admin/warehouses/${warehouseId}/districts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ districtId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: `Failed to add district: ${errorText}` };
    }

    return { success: true, message: 'District added successfully' };
  } catch (error) {
    console.error('Error adding district to warehouse:', error);
    return { success: false, message: 'Failed to add district to warehouse' };
  }
}

export async function removeDistrictFromWarehouseAction(warehouseId: string, districtId: string): Promise<{ success: true; message: string } | { success: false; message: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'No access token available' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return { success: false, message: 'API URL not configured' };
    }

    const response = await fetch(`${apiUrl}/admin/warehouses/${warehouseId}/districts/${districtId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: `Failed to remove district: ${errorText}` };
    }

    return { success: true, message: 'District removed successfully' };
  } catch (error) {
    console.error('Error removing district from warehouse:', error);
    return { success: false, message: 'Failed to remove district from warehouse' };
  }
}

export async function updateDistrictStatusAction(warehouseId: string, districtId: string, active: boolean): Promise<{ success: true; message: string } | { success: false; message: string }> {
  console.log('Updating district status:', warehouseId, districtId, active);
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'No access token available' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return { success: false, message: 'API URL not configured' };
    }

    const response = await fetch(`${apiUrl}/admin/warehouses/${warehouseId}/districts/${districtId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ districtId: districtId, active: active }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: `Failed to update district status: ${errorText}` };
    }

    return { success: true, message: 'District status updated successfully' };
  } catch (error) {
    console.error('Error updating district status:', error);
    return { success: false, message: 'Failed to update district status' };
  }
}
