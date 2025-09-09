'use server';

import { auth } from '@/auth';
import type { 
  CurrenciesResponse, 
  CurrencyStatsResponse,
  CreateCurrencyRequest,
  UpdateCurrencyRequest 
} from '@/app/lib/definitions/currency';

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

export async function fetchCurrenciesAction() {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/currencies`, {
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

    const data: CurrenciesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchActiveCurrenciesAction() {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/currencies/active`, {
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

    const data: CurrenciesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching active currencies:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchDefaultCurrencyAction() {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/currencies/default`, {
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
    console.error('Error fetching default currency:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchCurrencyStatsAction() {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/currencies/stats`, {
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

    const data: CurrencyStatsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching currency stats:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchCurrencyByCodeAction(code: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/currencies/code/${code}`, {
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
    console.error('Error fetching currency by code:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function fetchCurrencyByIdAction(currencyId: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/currencies/${currencyId}`, {
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
    console.error('Error fetching currency by ID:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

export async function createCurrencyAction(data: CreateCurrencyRequest) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/currencies`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to create currency',
      };
    }

    return {
      success: true,
      message: result.message,
      currency: result.currency,
    };
  } catch (error) {
    console.error('Error creating currency:', error);
    return {
      success: false,
      message: 'Failed to create currency',
    };
  }
}

export async function updateCurrencyAction(currencyId: string, data: UpdateCurrencyRequest) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/currencies/${currencyId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to update currency',
      };
    }

    return {
      success: true,
      message: result.message,
      currency: result.currency,
    };
  } catch (error) {
    console.error('Error updating currency:', error);
    return {
      success: false,
      message: 'Failed to update currency',
    };
  }
}

export async function setDefaultCurrencyAction(currencyId: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/currencies/${currencyId}/set-default`, {
      method: 'PATCH',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to set default currency',
      };
    }

    return {
      success: true,
      message: result.message,
      currency: result.currency,
    };
  } catch (error) {
    console.error('Error setting default currency:', error);
    return {
      success: false,
      message: 'Failed to set default currency',
    };
  }
}

export async function toggleCurrencyActiveAction(currencyId: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/currencies/${currencyId}/toggle-active`, {
      method: 'PATCH',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to toggle currency status',
      };
    }

    return {
      success: true,
      message: result.message,
      currency: result.currency,
    };
  } catch (error) {
    console.error('Error toggling currency status:', error);
    return {
      success: false,
      message: 'Failed to toggle currency status',
    };
  }
}

export async function deleteCurrencyAction(currencyId: string) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}/currencies/${currencyId}`, {
      method: 'DELETE',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to delete currency',
      };
    }

    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error('Error deleting currency:', error);
    return {
      success: false,
      message: 'Failed to delete currency',
    };
  }
}
