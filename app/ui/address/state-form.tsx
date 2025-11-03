'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { State } from '@/app/lib/definitions/address';
import { Button } from '@/app/ui/button';

interface StateFormProps {
  state?: State | null;
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string }) => Promise<void> | void;
}

export default function StateForm({ state, isOpen, loading = false, onClose, onSubmit }: StateFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (state) {
      setName(state.name || '');
    } else {
      setName('');
    }
    setError(null);
  }, [state]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    await onSubmit({ name: name.trim() });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{state ? 'Edit State' : 'Create State'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="state_name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              id="state_name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007476] focus:border-[#007476] ${error ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Enter state name"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:text-gray-900">Cancel</button>
            <Button type="submit" disabled={loading} style={{ backgroundColor: '#007476' }}>
              {state ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


