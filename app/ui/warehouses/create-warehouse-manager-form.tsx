'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/ui/button';
import { Warehouse } from '@/app/lib/definitions/warehouse';
import { 
  fetchWarehousesAction, 
  createWarehouseManagerAction 
} from '@/app/lib/actions';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CreateWarehouseManagerForm({ warehouseId }: { warehouseId?: string }) {
  const [formData, setFormData] = useState({
    userName: '',
    mobileNo: '',
    password: '',
    warehouseId: warehouseId || '',
  });
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);

  // Load warehouses on component mount
  useEffect(() => {
    const loadWarehouses = async () => {
      const result = await fetchWarehousesAction(1, 100); // Get all warehouses
      if ('error' in result) {
        setMessage({ type: 'error', text: 'Failed to load warehouses' });
      } else {
        setWarehouses(result.warehouses);
      }
      setLoadingWarehouses(false);
    };
    
    loadWarehouses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.warehouseId) {
      setMessage({ type: 'error', text: 'Please select a warehouse' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await createWarehouseManagerAction(formData);

      if ('success' in result && result.success === false) {
        setMessage({ type: 'error', text: result.message });
      } else if ('message' in result) {
        setMessage({ type: 'success', text: result.message });
        // Reset form
        setFormData({
          userName: '',
          mobileNo: '',
          password: '',
          warehouseId: '',
        });
      } else {
        setMessage({ type: 'error', text: 'An unexpected error occurred' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingWarehouses) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create Warehouse Manager</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Name */}
        <div>
          <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
            Manager Name *
          </label>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter manager name"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number *
          </label>
          <input
            type="tel"
            id="mobileNo"
            name="mobileNo"
            value={formData.mobileNo}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="+963930265553"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter password (minimum 6 characters)"
          />
        </div>

        {/* Warehouse Selection */}
        <div>
          <label htmlFor="warehouseId" className="block text-sm font-medium text-gray-700 mb-2">
            Warehouse *
          </label>
          <select
            id="warehouseId"
            name="warehouseId"
            value={formData.warehouseId}
            onChange={handleInputChange}
            required
            disabled={!!warehouseId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select a warehouse</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.warehouse_name} - {warehouse.location} ({warehouse.status})
              </option>
            ))}
          </select>
          {warehouseId && (
            <p className="mt-1 text-sm text-gray-500">
              Warehouse is pre-selected from the warehouses table
            </p>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`flex items-center space-x-2 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading || !formData.warehouseId}
            className="px-6 py-2"
          >
            {loading ? 'Creating...' : 'Create Manager'}
          </Button>
        </div>
      </form>
    </div>
  );
}
