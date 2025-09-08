'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { 
  ActiveIngredient, 
  CreateActiveIngredientRequest, 
  UpdateActiveIngredientRequest 
} from '@/app/lib/definitions/active-ingredient';

interface ActiveIngredientFormProps {
  activeIngredient?: ActiveIngredient | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateActiveIngredientRequest | UpdateActiveIngredientRequest) => void;
  loading?: boolean;
}

export default function ActiveIngredientForm({
  activeIngredient,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: ActiveIngredientFormProps) {
  const [formData, setFormData] = useState({
    active_ingredient_name: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!activeIngredient;

  // Update form data when activeIngredient prop changes
  useEffect(() => {
    if (activeIngredient) {
      setFormData({
        active_ingredient_name: activeIngredient.active_ingredient_name || '',
      });
    } else {
      setFormData({
        active_ingredient_name: '',
      });
    }
    setErrors({});
  }, [activeIngredient]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.active_ingredient_name.trim()) {
      newErrors.active_ingredient_name = 'Active ingredient name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      active_ingredient_name: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Active Ingredient' : 'Add New Active Ingredient'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Active Ingredient Name */}
          <div>
            <label htmlFor="active_ingredient_name" className="block text-sm font-medium text-gray-700 mb-1">
              Active Ingredient Name *
            </label>
            <input
              type="text"
              id="active_ingredient_name"
              value={formData.active_ingredient_name}
              onChange={(e) => handleInputChange('active_ingredient_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.active_ingredient_name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter active ingredient name"
              disabled={loading}
            />
            {errors.active_ingredient_name && (
              <p className="mt-1 text-sm text-red-600">{errors.active_ingredient_name}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
