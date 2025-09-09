'use server';

import { auth } from '@/auth';
import type { 
  ActiveIngredient, 
  ActiveIngredientsResponse, 
  CreateActiveIngredientRequest, 
  UpdateActiveIngredientRequest,
  ActiveIngredientResponse 
} from '@/app/lib/definitions/active-ingredient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch all active ingredients
export async function fetchActiveIngredientsAction(): Promise<ActiveIngredientsResponse | { error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { error: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/active-ingredients`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'UNAUTHORIZED' };
      }
      if (response.status === 403) {
        return { error: 'PERMISSION_DENIED' };
      }
      return { error: 'NETWORK_ERROR' };
    }

    const data = await response.json();
    
    // Normalize the response structure - handle the actual API response format
    if (data.ingredients) {
      return {
        message: data.message,
        activeIngredients: data.ingredients,
        total: data.total
      } as ActiveIngredientsResponse;
    } else if (data.activeIngredients) {
      return data as ActiveIngredientsResponse;
    } else if (data.active_ingredients) {
      return {
        message: data.message,
        activeIngredients: data.active_ingredients,
        total: data.total
      } as ActiveIngredientsResponse;
    } else {
      // Fallback: assume the data is an array of active ingredients
      return {
        message: 'Active ingredients retrieved successfully',
        activeIngredients: Array.isArray(data) ? data : [],
        total: Array.isArray(data) ? data.length : 0
      } as ActiveIngredientsResponse;
    }
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

    const response = await fetch(`${API_URL}/active-ingredients/search?name=${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'UNAUTHORIZED' };
      }
      if (response.status === 403) {
        return { error: 'PERMISSION_DENIED' };
      }
      return { error: 'NETWORK_ERROR' };
    }

    const data = await response.json();
    
    // Normalize the response structure - handle the actual API response format
    if (data.ingredients) {
      return {
        message: data.message,
        activeIngredients: data.ingredients,
        total: data.total
      } as ActiveIngredientsResponse;
    } else if (data.activeIngredients) {
      return data as ActiveIngredientsResponse;
    } else if (data.active_ingredients) {
      return {
        message: data.message,
        activeIngredients: data.active_ingredients,
        total: data.total
      } as ActiveIngredientsResponse;
    } else {
      // Fallback: assume the data is an array of active ingredients
      return {
        message: 'Active ingredients retrieved successfully',
        activeIngredients: Array.isArray(data) ? data : [],
        total: Array.isArray(data) ? data.length : 0
      } as ActiveIngredientsResponse;
    }
  } catch (error) {
    console.error('Error searching active ingredients:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

// Fetch active ingredient by ID
export async function fetchActiveIngredientByIdAction(id: string): Promise<ActiveIngredientResponse | { error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { error: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/active-ingredients/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'UNAUTHORIZED' };
      }
      if (response.status === 403) {
        return { error: 'PERMISSION_DENIED' };
      }
      return { error: 'NETWORK_ERROR' };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching active ingredient:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

// Create active ingredient
export async function createActiveIngredientAction(data: CreateActiveIngredientRequest): Promise<{ success: boolean; message: string; activeIngredient?: ActiveIngredient }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/active-ingredients`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, message: 'UNAUTHORIZED' };
      }
      if (response.status === 403) {
        return { success: false, message: 'PERMISSION_DENIED' };
      }
      const errorData = await response.json();
      return { success: false, message: errorData.message || 'Failed to create active ingredient' };
    }

    const result = await response.json();
    return { success: true, message: result.message, activeIngredient: result.activeIngredient };
  } catch (error) {
    console.error('Error creating active ingredient:', error);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

// Update active ingredient
export async function updateActiveIngredientAction(id: string, data: UpdateActiveIngredientRequest): Promise<{ success: boolean; message: string; activeIngredient?: ActiveIngredient }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/active-ingredients/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, message: 'UNAUTHORIZED' };
      }
      if (response.status === 403) {
        return { success: false, message: 'PERMISSION_DENIED' };
      }
      const errorData = await response.json();
      return { success: false, message: errorData.message || 'Failed to update active ingredient' };
    }

    const result = await response.json();
    return { success: true, message: result.message, activeIngredient: result.activeIngredient };
  } catch (error) {
    console.error('Error updating active ingredient:', error);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

// Delete active ingredient
export async function deleteActiveIngredientAction(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/active-ingredients/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, message: 'UNAUTHORIZED' };
      }
      if (response.status === 403) {
        return { success: false, message: 'PERMISSION_DENIED' };
      }
      const errorData = await response.json();
      return { success: false, message: errorData.message || 'Failed to delete active ingredient' };
    }

    const result = await response.json();
    return { success: true, message: result.message };
  } catch (error) {
    console.error('Error deleting active ingredient:', error);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}
