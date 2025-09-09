'use server';

// ============================================================================
// WAREHOUSE MANAGEMENT FUNCTIONS
// ============================================================================

import { auth } from '@/auth';
import type {
  WarehousesResponse,
  CreateWarehouseManagerResponse,
  WarehouseDetailsResponse,
} from '@/app/lib/definitions/warehouse';

export async function createWarehouseAction(warehouseData: {
  warehouse_name: string;
  district: string;
  phone: string;
  location: string;
}): Promise<{ success: true; message: string } | { success: false; message: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'No access token available' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return { success: false, message: 'API URL not configured' };
    }

    const response = await fetch(`${apiUrl}/admin/warehouses/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(warehouseData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: `Failed to create warehouse: ${errorText}` };
    }

    return { success: true, message: 'Warehouse created successfully' };
  } catch (error) {
    console.error('Error creating warehouse:', error);
    return { success: false, message: 'Failed to create warehouse' };
  }
}

export async function fetchWarehousesAction(
  page: number = 1,
  limit: number = 20,
  filters: {
    status?: string;
    search?: string;
    district?: string;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  } = {}
): Promise<WarehousesResponse | { error: 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR' }> {
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

    const offset = (page - 1) * limit;
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    // Add optional filters
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.district) params.append('district', filters.district);
    if (filters.orderBy) params.append('orderBy', filters.orderBy);
    if (filters.orderDirection) params.append('orderDirection', filters.orderDirection);

    const url = `${apiUrl}/admin/warehouses?${params.toString()}`;
    console.log('Fetching warehouses from URL:', url);

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

    const data: WarehousesResponse = await response.json();
    console.log('Successfully fetched warehouses:', data.warehouses.length);
    return data;
  } catch (error) {
    console.error('API Error Details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - check if API server is running and accessible');
    }
    return { error: 'NETWORK_ERROR' };
  }
}

export async function createWarehouseManagerAction(managerData: {
  userName: string;
  mobileNo: string;
  password: string;
  warehouseId: string;
}): Promise<CreateWarehouseManagerResponse | { success: false; message: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'No access token available' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return { success: false, message: 'API URL not configured' };
    }

    const response = await fetch(`${apiUrl}/admin/warehouses/users/warehouse-manager`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(managerData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: `Failed to create warehouse manager: ${errorText}` };
    }

    const data: CreateWarehouseManagerResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating warehouse manager:', error);
    return { success: false, message: 'Failed to create warehouse manager' };
  }
}

export async function fetchWarehouseDetailsAction(warehouseId: string): Promise<WarehouseDetailsResponse | { error: 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR' }> {
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

    const url = `${apiUrl}/admin/warehouses/${warehouseId}`;
    console.log('Fetching warehouse details from URL:', url);

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

    const data: WarehouseDetailsResponse = await response.json();
    console.log('Successfully fetched warehouse details:', data.warehouse.warehouse_name);
    return data;
  } catch (error) {
    console.error('API Error Details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - check if API server is running and accessible');
    }
    return { error: 'NETWORK_ERROR' };
  }
}
