'use server';

import { auth } from '@/auth';
import type { 
  ManufacturersResponse, 
  ManufacturerStatsResponse,
  CreateManufacturerRequest,
  UpdateManufacturerRequest 
} from '@/app/lib/definitions/manufacturer';

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

export async function fetchManufacturersAction() {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/manufacturers?limit=500`, {
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

    const data: ManufacturersResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchActiveManufacturersAction() {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/manufacturers/active`, {
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

    const data: ManufacturersResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching active manufacturers:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchManufacturerStatsAction() {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/manufacturers/stats`, {
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

    const data: ManufacturerStatsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching manufacturer stats:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchManufacturerByIdAction(manufacturerId: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/manufacturers/${manufacturerId}`, {
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
    console.error('Error fetching manufacturer by ID:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function createManufacturerAction(data: CreateManufacturerRequest) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/manufacturers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to create manufacturer',
      };
    }

    return {
      success: true,
      message: result.message,
      manufacturer: result.manufacturer,
    };
  } catch (error) {
    console.error('Error creating manufacturer:', error);
    return {
      success: false,
      message: 'Failed to create manufacturer',
    };
  }
}

export async function updateManufacturerAction(manufacturerId: string, data: UpdateManufacturerRequest) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/manufacturers/${manufacturerId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to update manufacturer',
      };
    }

    return {
      success: true,
      message: result.message,
      manufacturer: result.manufacturer,
    };
  } catch (error) {
    console.error('Error updating manufacturer:', error);
    return {
      success: false,
      message: 'Failed to update manufacturer',
    };
  }
}

export async function toggleManufacturerActiveAction(manufacturerId: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/manufacturers/${manufacturerId}/toggle-active`, {
      method: 'PATCH',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to toggle manufacturer status',
      };
    }

    return {
      success: true,
      message: result.message,
      manufacturer: result.manufacturer,
    };
  } catch (error) {
    console.error('Error toggling manufacturer status:', error);
    return {
      success: false,
      message: 'Failed to toggle manufacturer status',
    };
  }
}

export async function deleteManufacturerAction(manufacturerId: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/manufacturers/${manufacturerId}`, {
      method: 'DELETE',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to delete manufacturer',
      };
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('Error deleting manufacturer:', error);
    return {
      success: false,
      message: 'Failed to delete manufacturer',
    };
  }
}
