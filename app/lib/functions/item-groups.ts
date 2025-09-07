'use server';

// ============================================================================
// ITEM GROUP MANAGEMENT FUNCTIONS
// ============================================================================

import { auth } from '@/auth';
import type {
  ItemGroup,
  ItemGroupsResponse,
  ItemGroupStatsResponse,
  CreateItemGroupRequest,
  UpdateItemGroupRequest,
} from '@/app/lib/definitions/item-group';

export async function fetchItemGroupsAction(): Promise<ItemGroupsResponse | { error: 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR' }> {
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

    const url = `${apiUrl}/item-groups`;
    console.log('Fetching item groups from URL:', url);

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

    const data: ItemGroupsResponse = await response.json();
    console.log('Successfully fetched item groups:', data.itemGroups.length);
    return data;
  } catch (error) {
    console.error('API Error Details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - check if API server is running and accessible');
    }
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchActiveItemGroupsAction(): Promise<ItemGroupsResponse | { error: 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR' }> {
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

    const url = `${apiUrl}/item-groups/active`;
    console.log('Fetching active item groups from URL:', url);

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

    const data: ItemGroupsResponse = await response.json();
    console.log('Successfully fetched active item groups:', data.itemGroups.length);
    return data;
  } catch (error) {
    console.error('API Error Details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - check if API server is running and accessible');
    }
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchItemGroupStatsAction(): Promise<ItemGroupStatsResponse | { error: 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR' }> {
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

    const url = `${apiUrl}/item-groups/stats`;
    console.log('Fetching item group stats from URL:', url);

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

    const data: ItemGroupStatsResponse = await response.json();
    console.log('Successfully fetched item group stats');
    return data;
  } catch (error) {
    console.error('API Error Details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - check if API server is running and accessible');
    }
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchItemGroupByIdAction(itemGroupId: string): Promise<ItemGroup | { error: 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR' }> {
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

    const url = `${apiUrl}/item-groups/${itemGroupId}`;
    console.log('Fetching item group by ID from URL:', url);

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

    const data: ItemGroup = await response.json();
    console.log('Successfully fetched item group:', data.name);
    return data;
  } catch (error) {
    console.error('API Error Details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - check if API server is running and accessible');
    }
    return { error: 'NETWORK_ERROR' };
  }
}

export async function createItemGroupAction(itemGroupData: CreateItemGroupRequest): Promise<{ success: true; message: string; itemGroup: ItemGroup } | { success: false; message: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'No access token available' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return { success: false, message: 'API URL not configured' };
    }

    const response = await fetch(`${apiUrl}/item-groups`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemGroupData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: `Failed to create item group: ${errorText}` };
    }

    const data = await response.json();
    return { success: true, message: 'Item group created successfully', itemGroup: data };
  } catch (error) {
    console.error('Error creating item group:', error);
    return { success: false, message: 'Failed to create item group' };
  }
}

export async function updateItemGroupAction(itemGroupId: string, itemGroupData: UpdateItemGroupRequest): Promise<{ success: true; message: string; itemGroup: ItemGroup } | { success: false; message: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'No access token available' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return { success: false, message: 'API URL not configured' };
    }

    const response = await fetch(`${apiUrl}/item-groups/${itemGroupId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemGroupData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: `Failed to update item group: ${errorText}` };
    }

    const data = await response.json();
    return { success: true, message: 'Item group updated successfully', itemGroup: data };
  } catch (error) {
    console.error('Error updating item group:', error);
    return { success: false, message: 'Failed to update item group' };
  }
}

export async function toggleItemGroupActiveAction(itemGroupId: string): Promise<{ success: true; message: string; itemGroup: ItemGroup } | { success: false; message: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'No access token available' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return { success: false, message: 'API URL not configured' };
    }

    const response = await fetch(`${apiUrl}/item-groups/${itemGroupId}/toggle-active`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: `Failed to toggle item group status: ${errorText}` };
    }

    const data = await response.json();
    return { success: true, message: 'Item group status updated successfully', itemGroup: data };
  } catch (error) {
    console.error('Error toggling item group status:', error);
    return { success: false, message: 'Failed to toggle item group status' };
  }
}

export async function deleteItemGroupAction(itemGroupId: string): Promise<{ success: true; message: string } | { success: false; message: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'No access token available' };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return { success: false, message: 'API URL not configured' };
    }

    const response = await fetch(`${apiUrl}/item-groups/${itemGroupId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: `Failed to delete item group: ${errorText}` };
    }

    return { success: true, message: 'Item group deleted successfully' };
  } catch (error) {
    console.error('Error deleting item group:', error);
    return { success: false, message: 'Failed to delete item group' };
  }
}
