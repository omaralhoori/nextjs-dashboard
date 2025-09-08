'use client';

import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon, 
  MagnifyingGlassIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { 
  fetchItemIngredientsAction, 
  addIngredientToItemAction, 
  updateMedicineIngredientAction, 
  removeIngredientFromItemAction,
  fetchActiveIngredientsAction 
} from '@/app/lib/actions';
import type { 
  MedicineIngredient, 
  CreateMedicineIngredientRequest, 
  UpdateMedicineIngredientRequest,
  ActiveIngredient 
} from '@/app/lib/definitions/medicine-ingredient';

interface MedicineIngredientsManagerProps {
  itemId: string;
  itemName?: string;
}

export default function MedicineIngredientsManager({ 
  itemId, 
  itemName 
}: MedicineIngredientsManagerProps) {
  const [ingredients, setIngredients] = useState<MedicineIngredient[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<ActiveIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // Add ingredient form state
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [strength, setStrength] = useState('');
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // Edit ingredient state
  const [editingIngredient, setEditingIngredient] = useState<MedicineIngredient | null>(null);
  const [editStrength, setEditStrength] = useState('');
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  useEffect(() => {
    if (itemId) {
      fetchIngredients();
      fetchAvailableIngredients();
    }
  }, [itemId]);

  const fetchIngredients = async () => {
    try {
      const result = await fetchItemIngredientsAction(itemId);
      
      if ('error' in result) {
        setError(result.error);
      } else {
        setIngredients(result.ingredients || []);
      }
    } catch (err) {
      console.error('Error fetching ingredients:', err);
      setError('NETWORK_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableIngredients = async () => {
    try {
      const result = await fetchActiveIngredientsAction();
      
      if ('error' in result) {
        console.error('Error fetching available ingredients:', result.error);
      } else {
        setAvailableIngredients(result.activeIngredients || []);
      }
    } catch (err) {
      console.error('Error fetching available ingredients:', err);
    }
  };

  const filteredIngredients = availableIngredients.filter(ingredient =>
    ingredient.active_ingredient_name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedIngredientId || !strength.trim()) {
      setError('Please select an ingredient and enter strength');
      return;
    }

    setFormLoading(true);
    
    try {
      const data: CreateMedicineIngredientRequest = {
        item_id: itemId,
        ingredient_id: selectedIngredientId,
        strength: strength.trim(),
      };

      const result = await addIngredientToItemAction(data);
      
      if (result.success) {
        setMessage(result.message);
        await fetchIngredients();
        setIsAddFormOpen(false);
        setSelectedIngredientId('');
        setStrength('');
        setIngredientSearch('');
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error adding ingredient:', err);
      setError('Failed to add ingredient');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditIngredient = (ingredient: MedicineIngredient) => {
    setEditingIngredient(ingredient);
    setEditStrength(ingredient.strength);
    setIsEditFormOpen(true);
  };

  const handleUpdateIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingIngredient || !editStrength.trim()) {
      setError('Please enter strength');
      return;
    }

    setFormLoading(true);
    
    try {
      const data: UpdateMedicineIngredientRequest = {
        strength: editStrength.trim(),
      };

      const result = await updateMedicineIngredientAction(
        editingIngredient.item_id,
        editingIngredient.ingredient_id,
        data
      );
      
      if (result.success) {
        setMessage(result.message);
        await fetchIngredients();
        setIsEditFormOpen(false);
        setEditingIngredient(null);
        setEditStrength('');
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error updating ingredient:', err);
      setError('Failed to update ingredient');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveIngredient = async (ingredient: MedicineIngredient) => {
    if (!confirm(`Are you sure you want to remove ${ingredient.activeIngredient?.active_ingredient_name} from this item?`)) {
      return;
    }

    try {
      const result = await removeIngredientFromItemAction(
        ingredient.item_id,
        ingredient.ingredient_id
      );
      
      if (result.success) {
        setMessage(result.message);
        await fetchIngredients();
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error removing ingredient:', err);
      setError('Failed to remove ingredient');
    }
  };

  const handleIngredientSelect = (ingredient: ActiveIngredient) => {
    setSelectedIngredientId(ingredient.id);
    setIngredientSearch(ingredient.active_ingredient_name);
    setShowIngredientDropdown(false);
  };

  const closeAddForm = () => {
    setIsAddFormOpen(false);
    setSelectedIngredientId('');
    setStrength('');
    setIngredientSearch('');
    setError(null);
  };

  const closeEditForm = () => {
    setIsEditFormOpen(false);
    setEditingIngredient(null);
    setEditStrength('');
    setError(null);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.ingredient-dropdown')) {
        setShowIngredientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="mt-6 p-4 border rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Medicine Ingredients {itemName && `for ${itemName}`}
        </h3>
        <button
          onClick={() => setIsAddFormOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Add Ingredient
        </button>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Ingredients List */}
      {ingredients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No ingredients added yet.</p>
          <p className="text-sm">Click "Add Ingredient" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ingredients.map((ingredient) => (
            <div key={`${ingredient.item_id}-${ingredient.ingredient_id}`} className="flex items-center justify-between p-3 bg-white border rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {ingredient.activeIngredient?.active_ingredient_name || 'Unknown Ingredient'}
                </div>
                <div className="text-sm text-gray-500">
                  Strength: {ingredient.strength}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditIngredient(ingredient)}
                  className="p-1 text-blue-600 hover:text-blue-900"
                  title="Edit strength"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleRemoveIngredient(ingredient)}
                  className="p-1 text-red-600 hover:text-red-900"
                  title="Remove ingredient"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Ingredient Form Modal */}
      {isAddFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add Ingredient</h3>
              <button
                onClick={closeAddForm}
                className="text-gray-400 hover:text-gray-600"
                disabled={formLoading}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddIngredient} className="p-6 space-y-4">
              {/* Ingredient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Active Ingredient *
                </label>
                <div className="relative ingredient-dropdown">
                  <div className="relative">
                    <input
                      type="text"
                      value={ingredientSearch}
                      onChange={(e) => {
                        setIngredientSearch(e.target.value);
                        setShowIngredientDropdown(true);
                        if (e.target.value === '') {
                          setSelectedIngredientId('');
                        }
                      }}
                      onFocus={() => setShowIngredientDropdown(true)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search ingredients..."
                      disabled={formLoading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {showIngredientDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredIngredients.length > 0 ? (
                        filteredIngredients.map((ingredient) => (
                          <div
                            key={ingredient.id}
                            onClick={() => handleIngredientSelect(ingredient)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          >
                            {ingredient.active_ingredient_name}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No ingredients found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Strength */}
              <div>
                <label htmlFor="strength" className="block text-sm font-medium text-gray-700 mb-1">
                  Strength *
                </label>
                <input
                  type="text"
                  id="strength"
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 500mg, 10ml, 2.5%"
                  disabled={formLoading}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeAddForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? 'Adding...' : 'Add Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Ingredient Form Modal */}
      {isEditFormOpen && editingIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Ingredient Strength</h3>
              <button
                onClick={closeEditForm}
                className="text-gray-400 hover:text-gray-600"
                disabled={formLoading}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateIngredient} className="p-6 space-y-4">
              {/* Ingredient Name (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Active Ingredient
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900">
                  {editingIngredient.activeIngredient?.active_ingredient_name || 'Unknown Ingredient'}
                </div>
              </div>

              {/* Strength */}
              <div>
                <label htmlFor="editStrength" className="block text-sm font-medium text-gray-700 mb-1">
                  Strength *
                </label>
                <input
                  type="text"
                  id="editStrength"
                  value={editStrength}
                  onChange={(e) => setEditStrength(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 500mg, 10ml, 2.5%"
                  disabled={formLoading}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? 'Updating...' : 'Update Strength'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
