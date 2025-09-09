'use server';

import { auth } from '@/auth';
import type { UsersResponse, UsersFilters } from '@/app/lib/definitions/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function getAuthHeaders() {
  const session = await auth();
  if (!session?.user?.accessToken) {
    throw new Error('Unauthorized: No access token found');
  }
  return {
    Authorization: `Bearer ${session.user.accessToken}`,
    'Content-Type': 'application/json',
  };
}

// Fetch users with filters
export async function fetchUsersAction(filters: UsersFilters = {}): Promise<UsersResponse | { error: string }> {
  try {
    const headers = await getAuthHeaders();

    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.enabled !== undefined) queryParams.append('enabled', filters.enabled.toString());
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.orderBy) queryParams.append('orderBy', filters.orderBy);
    if (filters.orderDirection) queryParams.append('orderDirection', filters.orderDirection);
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.offset) queryParams.append('offset', filters.offset.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/admin/users${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'UNAUTHORIZED' };
      }
      if (response.status === 403) {
        return { error: 'PERMISSION_DENIED' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

// Create admin user
export async function createAdminUserAction(userData: {
  userName: string;
  mobileNo: string;
  password: string;
}): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/admin/users/create-admin`, {
      method: 'POST',
      headers,
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, message: 'UNAUTHORIZED' };
      }
      if (response.status === 403) {
        return { success: false, message: 'PERMISSION_DENIED' };
      }
      if (response.status === 400) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Bad Request' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, message: data.message, user: data.user };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

// Enable user
export async function enableUserAction(userId: string): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/enable`, {
      method: 'PUT',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, message: 'UNAUTHORIZED' };
      }
      if (response.status === 403) {
        return { success: false, message: 'PERMISSION_DENIED' };
      }
      if (response.status === 400) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Bad Request' };
      }
      if (response.status === 404) {
        return { success: false, message: 'USER_NOT_FOUND' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, message: data.message, user: data.user };
  } catch (error) {
    console.error('Error enabling user:', error);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

// Disable user
export async function disableUserAction(userId: string): Promise<{ success: boolean; message: string; user?: any }> {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/disable`, {
      method: 'PUT',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, message: 'UNAUTHORIZED' };
      }
      if (response.status === 403) {
        return { success: false, message: 'PERMISSION_DENIED' };
      }
      if (response.status === 400) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Bad Request' };
      }
      if (response.status === 404) {
        return { success: false, message: 'USER_NOT_FOUND' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, message: data.message, user: data.user };
  } catch (error) {
    console.error('Error disabling user:', error);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}
