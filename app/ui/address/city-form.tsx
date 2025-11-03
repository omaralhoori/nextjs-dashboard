'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { City, State } from '@/app/lib/definitions/address';
import { Button } from '@/app/ui/button';

interface CityFormProps {
  city?: City | null;
  states: State[];
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; stateId: string }) => Promise<void> | void;
}

export default function CityForm({ city, states, isOpen, loading = false, onClose, onSubmit }: CityFormProps) {
  const [name, setName] = useState('');
  const [stateId, setStateId] = useState('');
  const [errors, setErrors] = useState<{ name?: string; stateId?: string }>({});

  useEffect(() => {
    if (city) {
      setName(city.name || '');
      setStateId(city.stateId || '');
    } else {
      setName('');
      setStateId('');
    }
    setErrors({});
  }, [city]);

  if (!isOpen) return null;

  const validate = () => {
    const e: { name?: string; stateId?: string } = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!stateId) e.stateId = 'State is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ name: name.trim(), stateId });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{city ? 'Edit City' : 'Create City'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="city_name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              id="city_name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007476] focus:border-[#007476] ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Enter city name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="city_state" className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <select
              id="city_state"
              value={stateId}
              onChange={(e) => setStateId(e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007476] focus:border-[#007476] ${errors.stateId ? 'border-red-300' : 'border-gray-300'}`}
            >
              <option value="">Select a state</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.stateId && <p className="mt-1 text-sm text-red-600">{errors.stateId}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:text-gray-900">Cancel</button>
            <Button type="submit" disabled={loading} style={{ backgroundColor: '#007476' }}>
              {city ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


