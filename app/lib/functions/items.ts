'use server';

import { auth } from '@/auth';
import type { 
  ItemsResponse, 
  ItemStatsResponse,
  CreateItemRequest,
  UpdateItemRequest,
  ItemSearchFilters
} from '@/app/lib/definitions/item';
import type { ItemWithFiles } from '@/app/lib/definitions/item-file';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAuthHeaders() {
  const session = await auth();
  
  if (!session?.user?.accessToken) {
    throw new Error('UNAUTHORIZED');
  }

  return {
    'Authorization': `Bearer ${session.user.accessToken}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchItemsAction(filters?: ItemSearchFilters) {
  try {
    const headers = await getAuthHeaders();
    
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters?.manufacturer_id) queryParams.append('manufacturer_id', filters.manufacturer_id);
    if (filters?.item_group) queryParams.append('item_group', filters.item_group);
    if (filters?.warehouse) queryParams.append('warehouse', filters.warehouse);
    if (filters?.drug_class) queryParams.append('drug_class', filters.drug_class);
    if (filters?.enabled !== undefined) queryParams.append('enabled', filters.enabled.toString());
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.offset) queryParams.append('offset', filters.offset.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${API_BASE_URL}/items?${queryString}` : `${API_BASE_URL}/items`;
    
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

    const data: ItemsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching items:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchEnabledItemsAction() {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/items/enabled`, {
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

    const data: ItemsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching enabled items:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function searchItemsAction(filters: ItemSearchFilters) {
  try {
    const headers = await getAuthHeaders();
    
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.manufacturer_id) queryParams.append('manufacturer_id', filters.manufacturer_id);
    if (filters.item_group) queryParams.append('item_group', filters.item_group);
    if (filters.warehouse) queryParams.append('warehouse', filters.warehouse);
    if (filters.drug_class) queryParams.append('drug_class', filters.drug_class);
    if (filters.enabled !== undefined) queryParams.append('enabled', filters.enabled.toString());
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.offset) queryParams.append('offset', filters.offset.toString());

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/items/search?${queryString}`;
    
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

    const data: ItemsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching items:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchItemStatsAction() {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/items/stats`, {
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

    const data: ItemStatsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching item stats:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

// Fetch previous item names for suggestions
export async function fetchItemNamesAction(search: string, limit = 10): Promise<string[] | { error: string }> {
  try {
    const headers = await getAuthHeaders();

    const queryParams = new URLSearchParams();
    queryParams.append('search', search ?? '');
    queryParams.append('limit', String(limit));

    const url = `${API_BASE_URL}/items/names?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) return { error: 'UNAUTHORIZED' };
      if (response.status === 403) return { error: 'PERMISSION_DENIED' };
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Normalize various possible response shapes to a string[]
    let names: string[] = [];
    if (Array.isArray(data)) {
      // Could be ["Paracetamol", { name: "..." }]
      names = data
        .map((n: any) => typeof n === 'string' ? n : (n?.item_name || n?.name || n?.title))
        .filter((v: any) => typeof v === 'string');
    } else if (Array.isArray((data as any)?.names)) {
      names = (data as any).names
        .map((n: any) => typeof n === 'string' ? n : (n?.item_name || n?.name || n?.title))
        .filter((v: any) => typeof v === 'string');
    } else if (Array.isArray((data as any)?.items)) {
      names = (data as any).items
        .map((n: any) => n?.item_name || n?.name || n?.title)
        .filter((v: any) => typeof v === 'string');
    } else if (Array.isArray((data as any)?.results)) {
      names = (data as any).results
        .map((n: any) => typeof n === 'string' ? n : (n?.item_name || n?.name || n?.title))
        .filter((v: any) => typeof v === 'string');
    }
    return names;
  } catch (error) {
    console.error('Error fetching item names:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchItemByBarcodeAction(barcode: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/items/barcode/${barcode}`, {
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
      if (response.status === 404) {
        return { error: 'NOT_FOUND' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching item by barcode:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchItemByIdAction(itemId: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
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
      if (response.status === 404) {
        return { error: 'NOT_FOUND' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching item by ID:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function createItemAction(data: CreateItemRequest) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to create item',
      };
    }

    return {
      success: true,
      message: result.message,
      item: result.item,
    };
  } catch (error) {
    console.error('Error creating item:', error);
    return {
      success: false,
      message: 'Failed to create item',
    };
  }
}

export async function updateItemAction(itemId: string, data: UpdateItemRequest) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to update item',
      };
    }

    return {
      success: true,
      message: result.message,
      item: result.item,
    };
  } catch (error) {
    console.error('Error updating item:', error);
    return {
      success: false,
      message: 'Failed to update item',
    };
  }
}

export async function toggleItemEnabledAction(itemId: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/toggle-enabled`, {
      method: 'PATCH',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to toggle item status',
      };
    }

    return {
      success: true,
      message: result.message,
      item: result.item,
    };
  } catch (error) {
    console.error('Error toggling item status:', error);
    return {
      success: false,
      message: 'Failed to toggle item status',
    };
  }
}

export async function deleteItemAction(itemId: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
      method: 'DELETE',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to delete item',
      };
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('Error deleting item:', error);
    return {
      success: false,
      message: 'Failed to delete item',
    };
  }
}

// Fetch item with files
export async function fetchItemWithFilesAction(itemId: string): Promise<ItemWithFiles | { error: string }> {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/items/${itemId}/details`, {
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
      if (response.status === 404) {
        return { error: 'NOT_FOUND' };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching item with files:', error);
    return { error: 'NETWORK_ERROR' };
  }
}
