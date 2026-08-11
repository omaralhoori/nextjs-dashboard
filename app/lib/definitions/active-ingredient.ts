export interface ActiveIngredient {
  id: string;
  active_ingredient_name: string;
  arabic_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActiveIngredientPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  returned: number;
}

export interface ActiveIngredientsResponse {
  message: string;
  activeIngredients: ActiveIngredient[];
  total: number;
  pagination?: ActiveIngredientPagination;
}

export interface CreateActiveIngredientRequest {
  active_ingredient_name: string;
  arabic_name?: string;
}

export interface UpdateActiveIngredientRequest {
  active_ingredient_name?: string;
  arabic_name?: string | null;
}

export interface ActiveIngredientResponse {
  message: string;
  activeIngredient: ActiveIngredient;
}
