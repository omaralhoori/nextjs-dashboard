export interface MedicineIngredient {
  item_id: string;
  ingredient_id: string;
  strength: string;
  activeIngredient?: ActiveIngredient;
}

export interface MedicineIngredientsResponse {
  message: string;
  ingredients: MedicineIngredient[];
  total: number;
}

export interface CreateMedicineIngredientRequest {
  item_id: string;
  ingredient_id: string;
  strength: string;
}

export interface UpdateMedicineIngredientRequest {
  strength: string;
}

export interface MedicineIngredientResponse {
  message: string;
  medicineIngredient: MedicineIngredient;
}

// Re-export ActiveIngredient for convenience
export interface ActiveIngredient {
  id: string;
  active_ingredient_name: string;
  created_at: string;
  updated_at: string;
}
