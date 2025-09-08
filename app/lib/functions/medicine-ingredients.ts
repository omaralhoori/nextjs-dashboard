'use server';

import { auth } from '@/auth';
import type { 
  MedicineIngredient, 
  MedicineIngredientsResponse, 
  CreateMedicineIngredientRequest, 
  UpdateMedicineIngredientRequest,
  MedicineIngredientResponse 
} from '@/app/lib/definitions/medicine-ingredient';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Get ingredients for a specific item
export async function fetchItemIngredientsAction(itemId: string): Promise<MedicineIngredientsResponse | { error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { error: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/medicine-ingredients/item/${itemId}`, {
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
    console.error('Error fetching item ingredients:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

// Get items that contain a specific ingredient
export async function fetchIngredientItemsAction(ingredientId: string): Promise<MedicineIngredientsResponse | { error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { error: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/medicine-ingredients/ingredient/${ingredientId}`, {
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
    console.error('Error fetching ingredient items:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

// Get specific ingredient-item combination
export async function fetchMedicineIngredientAction(itemId: string, ingredientId: string): Promise<MedicineIngredientResponse | { error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { error: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/medicine-ingredients/${itemId}/${ingredientId}`, {
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
    console.error('Error fetching medicine ingredient:', error);
    return { error: 'NETWORK_ERROR' };
  }
}

// Add ingredient to item
export async function addIngredientToItemAction(data: CreateMedicineIngredientRequest): Promise<{ success: boolean; message: string; medicineIngredient?: MedicineIngredient }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/medicine-ingredients`, {
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
      return { success: false, message: errorData.message || 'Failed to add ingredient to item' };
    }

    const result = await response.json();
    return { success: true, message: result.message, medicineIngredient: result.medicineIngredient };
  } catch (error) {
    console.error('Error adding ingredient to item:', error);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

// Update ingredient strength
export async function updateMedicineIngredientAction(itemId: string, ingredientId: string, data: UpdateMedicineIngredientRequest): Promise<{ success: boolean; message: string; medicineIngredient?: MedicineIngredient }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/medicine-ingredients/${itemId}/${ingredientId}`, {
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
      return { success: false, message: errorData.message || 'Failed to update ingredient strength' };
    }

    const result = await response.json();
    return { success: true, message: result.message, medicineIngredient: result.medicineIngredient };
  } catch (error) {
    console.error('Error updating medicine ingredient:', error);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}

// Remove ingredient from item
export async function removeIngredientFromItemAction(itemId: string, ingredientId: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return { success: false, message: 'UNAUTHORIZED' };
    }

    const response = await fetch(`${API_URL}/medicine-ingredients/${itemId}/${ingredientId}`, {
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
      return { success: false, message: errorData.message || 'Failed to remove ingredient from item' };
    }

    const result = await response.json();
    return { success: true, message: result.message };
  } catch (error) {
    console.error('Error removing ingredient from item:', error);
    return { success: false, message: 'NETWORK_ERROR' };
  }
}
