export interface ActiveIngredient {
  id: string;
  active_ingredient_name: string;
  created_at: string;
  updated_at: string;
}

export interface ActiveIngredientsResponse {
  message: string;
  activeIngredients: ActiveIngredient[];
  total: number;
}

// Alternative response structures that might be returned by the API
export interface ActiveIngredientsApiResponse {
  message: string;
  active_ingredients: ActiveIngredient[];
  total: number;
}

// Actual API response structure
export interface ActiveIngredientsActualResponse {
  message: string;
  ingredients: ActiveIngredient[];
  total: number;
}

export interface CreateActiveIngredientRequest {
  active_ingredient_name: string;
}

export interface UpdateActiveIngredientRequest {
  active_ingredient_name: string;
}

export interface ActiveIngredientResponse {
  message: string;
  activeIngredient: ActiveIngredient;
}
