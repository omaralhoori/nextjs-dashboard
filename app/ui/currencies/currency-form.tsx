'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/ui/button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Currency, CreateCurrencyRequest, UpdateCurrencyRequest } from '@/app/lib/definitions/currency';

interface CurrencyFormProps {
  currency?: Currency | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCurrencyRequest | UpdateCurrencyRequest) => Promise<void>;
  loading?: boolean;
}

export default function CurrencyForm({ 
  currency, 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false 
}: CurrencyFormProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
    exchange_rate: '',
    is_default: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!currency;

  // Update form data when currency prop changes
  useEffect(() => {
    if (currency) {
      setFormData({
        code: currency.code || '',
        name: currency.name || '',
        symbol: currency.symbol || '',
        exchange_rate: currency.exchange_rate?.toString() || '',
        is_default: currency.is_default || false,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        symbol: '',
        exchange_rate: '',
        is_default: false,
      });
    }
    setErrors({});
  }, [currency]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Code is required';
    } else if (formData.code.length !== 3) {
      newErrors.code = 'Currency code must be exactly 3 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }

    if (formData.exchange_rate && isNaN(Number(formData.exchange_rate))) {
      newErrors.exchange_rate = 'Exchange rate must be a valid number';
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
      // Prepare data for submission
      const submitData = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        symbol: formData.symbol.trim(),
        exchange_rate: formData.exchange_rate ? Number(formData.exchange_rate) : undefined,
        is_default: formData.is_default,
      };

      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      code: '',
      name: '',
      symbol: '',
      exchange_rate: '',
      is_default: false,
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
            {isEditing ? 'Edit Currency' : 'Create Currency'}
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
          {/* Code Field */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Code *
            </label>
            <input
              type="text"
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.code ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="USD"
              maxLength={3}
              disabled={loading}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Currency code (3 letters, e.g., USD, EUR)
            </p>
          </div>

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
              placeholder="US Dollar"
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Symbol Field */}
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
              Symbol *
            </label>
            <input
              type="text"
              id="symbol"
              value={formData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.symbol ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="$"
              disabled={loading}
            />
            {errors.symbol && (
              <p className="mt-1 text-sm text-red-600">{errors.symbol}</p>
            )}
          </div>

          {/* Exchange Rate Field */}
          <div>
            <label htmlFor="exchange_rate" className="block text-sm font-medium text-gray-700 mb-1">
              Exchange Rate
            </label>
            <input
              type="number"
              id="exchange_rate"
              value={formData.exchange_rate}
              onChange={(e) => handleInputChange('exchange_rate', e.target.value)}
              step="0.0001"
              min="0"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.exchange_rate ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="1.0000"
              disabled={loading}
            />
            {errors.exchange_rate && (
              <p className="mt-1 text-sm text-red-600">{errors.exchange_rate}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Exchange rate relative to base currency
            </p>
          </div>

          {/* Default Currency */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => handleInputChange('is_default', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-gray-700">Set as default currency</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Only one currency can be set as default
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
                isEditing ? 'Update Currency' : 'Create Currency'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
