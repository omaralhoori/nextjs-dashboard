'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/ui/button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { ItemGroup, CreateItemGroupRequest, UpdateItemGroupRequest } from '@/app/lib/definitions/item-group';

interface ItemGroupFormProps {
  itemGroup?: ItemGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateItemGroupRequest | UpdateItemGroupRequest) => Promise<void>;
  loading?: boolean;
}

export default function ItemGroupForm({ 
  itemGroup, 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false 
}: ItemGroupFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!itemGroup;

  // Update form data when itemGroup prop changes
  useEffect(() => {
    if (itemGroup) {
      setFormData({
        name: itemGroup.name || '',
        description: itemGroup.description || '',
        active: itemGroup.active ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        active: true,
      });
    }
    setErrors({});
  }, [itemGroup]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      active: true,
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Item Group' : 'Create Item Group'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter item group name"
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter item group description"
              disabled={loading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Active item groups are available for use in the system
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditing ? 'Update Item Group' : 'Create Item Group'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
