'use client';

import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { City, State } from '@/app/lib/definitions/address';
import { Button } from '@/app/ui/button';

interface CitiesTableProps {
  states: State[];
  cities: City[];
  selectedStateId: string;
  onChangeState: (stateId: string) => void;
  onCreateNew: () => void;
  onEdit: (city: City) => void;
  onDelete: (cityId: string) => Promise<void> | void;
}

export default function CitiesTable({ states, cities, selectedStateId, onChangeState, onCreateNew, onEdit, onDelete }: CitiesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 flow-root">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <label htmlFor="state_filter" className="text-sm text-gray-700">State:</label>
          <select
            id="state_filter"
            value={selectedStateId}
            onChange={(e) => onChangeState(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <Button onClick={onCreateNew} style={{ backgroundColor: '#007476' }}>
          <PlusIcon className="h-5 w-5 mr-2" /> New City
        </Button>
      </div>

      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">Name</th>
                <th className="px-3 py-5 font-medium">State</th>
                <th className="px-3 py-5 font-medium">Districts</th>
                <th className="px-3 py-5 font-medium">Created</th>
                <th className="px-3 py-5 font-medium">Updated</th>
                <th className="px-3 py-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {cities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No cities found</td>
                </tr>
              ) : (
                cities.map((city) => (
                  <tr key={city.id} className="w-full border-b py-3 text-sm">
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">{city.name}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">{city.stateName || '-'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">{city.districtsCount ?? '-'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">{new Date(city.createdAt).toLocaleString()}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">{new Date(city.updatedAt).toLocaleString()}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="flex justify-end space-x-3">
                        <button onClick={() => onEdit(city)} className="text-blue-600 hover:text-blue-800" title="Edit">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(city.id)}
                          disabled={deletingId === city.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


