'use server';
import { getServerApiUrl } from '@/app/lib/server-api-url';

import { auth } from '@/auth';
import type {
  ActiveIngredient,
  ActiveIngredientsResponse,
  CreateActiveIngredientRequest,
  UpdateActiveIngredientRequest,
  ActiveIngredientResponse,
} from '@/app/lib/definitions/active-ingredient';

const API_URL = getServerApiUrl();

function normalizeListResponse(data: any): ActiveIngredientsResponse {
  const list =
    data.activeIngredients ||
    data.ingredients ||
    data.active_ingredients ||
    (Array.isArray(data) ? data : []);

  const total =
    data.pagination?.total ??
    data.total ??
    (Array.isArray(list) ? list.length : 0);

  return {
    message: data.message || 'Active ingredients retrieved successfully',
    activeIngredients: list,
    total,
    pagination: data.pagination
      ? {
          total: data.pagination.total ?? total,
          limit: data.pagination.limit ?? list.length,
          offset: data.pagination.offset ?? 0,
          hasMore: data.pagination.hasMore ?? false,
          returned: data.pagination.returned ?? list.length,
        }
      : {
          total,
          limit: list.length,
          offset: 0,
          hasMore: false,
          returned: list.length,
        },
  };
}

function extractIngredient(result: any): ActiveIngredient | undefined {
  return result.activeIngredient || result.ingredient || result.active_ingredient;
}

// Fetch active ingredients with server-side pagination/search
export async function fetchActiveIngredientsAction(
  page: number = 1,
  limit: number = 20,
  search?: string,
): Promise<ActiveIngredientsResponse | { error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { error: 'UNAUTHORIZED' };
    }

    const offset = (page - 1) * limit;
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      orderBy: 'active_ingredient_name',
      orderDirection: 'ASC',
    });
    if (search?.trim()) {
      params.set('search', search.trim());
    }

    const response = await fetch(`${API_URL}/active-ingredients?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 401) return { error: 'UNAUTHORIZED' };
      if (response.status === 403) return { error: 'PERMISSION_DENIED' };
      return { error: 'NETWORK_ERROR' };
    }

    const data = await response.json();
    return normalizeListResponse(data);
  } catch (error) {
    console.error('Error fetching active ingredients:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

// Search active ingredients by name
export async function searchActiveIngredientsAction(name: string): Promise<ActiveIngredientsResponse | { error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { error: 'UNAUTHORIZED' };
    }

    const response = await fetch(
      `${API_URL}/active-ingredients/search?name=${encodeURIComponent(name)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) return { error: 'UNAUTHORIZED' };
      if (response.status === 403) return { error: 'PERMISSION_DENIED' };
      return { error: 'NETWORK_ERROR' };
    }

    const data = await response.json();
    return normalizeListResponse(data);
  } catch (error) {
    console.error('Error searching active ingredients:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

// Fetch active ingredient by ID
export async function fetchActiveIngredientByIdAction(
  id: string,
): Promise<ActiveIngredientResponse | { error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { error: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/active-ingredients/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) return { error: 'UNAUTHORIZED' };
      if (response.status === 403) return { error: 'PERMISSION_DENIED' };
      return { error: 'NETWORK_ERROR' };
    }

    const data = await response.json();
    const activeIngredient = extractIngredient(data);
    if (!activeIngredient) {
      return { error: 'NETWORK_ERROR' };
    }
    return {
      message: data.message || 'Active ingredient retrieved successfully',
      activeIngredient,
    };
  } catch (error) {
    console.error('Error fetching active ingredient:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

// Create active ingredient
export async function createActiveIngredientAction(
  data: CreateActiveIngredientRequest,
): Promise<{ success: boolean; message: string; activeIngredient?: ActiveIngredient }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/active-ingredients`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) return { success: false, message: 'UNAUTHORIZED' };
      if (response.status === 403) return { success: false, message: 'PERMISSION_DENIED' };
      const errorData = await response.json().catch(() => ({}));
      return { success: false, message: errorData.message || 'Failed to create active ingredient' };
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message,
      activeIngredient: extractIngredient(result),
    };
  } catch (error) {
    console.error('Error creating active ingredient:', error);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

// Update active ingredient
export async function updateActiveIngredientAction(
  id: string,
  data: UpdateActiveIngredientRequest,
): Promise<{ success: boolean; message: string; activeIngredient?: ActiveIngredient }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/active-ingredients/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) return { success: false, message: 'UNAUTHORIZED' };
      if (response.status === 403) return { success: false, message: 'PERMISSION_DENIED' };
      const errorData = await response.json().catch(() => ({}));
      return { success: false, message: errorData.message || 'Failed to update active ingredient' };
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message,
      activeIngredient: extractIngredient(result),
    };
  } catch (error) {
    console.error('Error updating active ingredient:', error);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

// Delete active ingredient
export async function deleteActiveIngredientAction(
  id: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/active-ingredients/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) return { success: false, message: 'UNAUTHORIZED' };
      if (response.status === 403) return { success: false, message: 'PERMISSION_DENIED' };
      const errorData = await response.json().catch(() => ({}));
      return { success: false, message: errorData.message || 'Failed to delete active ingredient' };
    }

    const result = await response.json();
    return { success: true, message: result.message };
  } catch (error) {
    console.error('Error deleting active ingredient:', error);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}
