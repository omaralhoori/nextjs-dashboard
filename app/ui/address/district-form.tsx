'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { District, City } from '@/app/lib/definitions/address';
import { Button } from '@/app/ui/button';

interface DistrictFormProps {
  district?: District | null;
  cities: City[];
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; cityId: string }) => Promise<void> | void;
}

export default function DistrictForm({ district, cities, isOpen, loading = false, onClose, onSubmit }: DistrictFormProps) {
  const [name, setName] = useState('');
  const [cityId, setCityId] = useState('');
  const [errors, setErrors] = useState<{ name?: string; cityId?: string }>({});

  useEffect(() => {
    if (district) {
      setName(district.name || '');
      setCityId(district.cityId || '');
    } else {
      setName('');
      setCityId('');
    }
    setErrors({});
  }, [district]);

  if (!isOpen) return null;

  const validate = () => {
    const e: { name?: string; cityId?: string } = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!cityId) e.cityId = 'City is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ name: name.trim(), cityId });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{district ? 'Edit District' : 'Create District'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="district_name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              id="district_name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007476] focus:border-[#007476] ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Enter district name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="district_city" className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <select
              id="district_city"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007476] focus:border-[#007476] ${errors.cityId ? 'border-red-300' : 'border-gray-300'}`}
            >
              <option value="">Select a city</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.cityId && <p className="mt-1 text-sm text-red-600">{errors.cityId}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:text-gray-900">Cancel</button>
            <Button type="submit" disabled={loading} style={{ backgroundColor: '#007476' }}>
              {district ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


