'use client';

import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { District, City, State } from '@/app/lib/definitions/address';
import { Button } from '@/app/ui/button';

interface DistrictsTableProps {
  states: State[];
  cities: City[];
  districts: District[];
  selectedStateId: string;
  selectedCityId: string;
  onChangeState: (stateId: string) => void;
  onChangeCity: (cityId: string) => void;
  onCreateNew: () => void;
  onEdit: (district: District) => void;
  onDelete: (districtId: string) => Promise<void> | void;
}

export default function DistrictsTable({ states, cities, districts, selectedStateId, selectedCityId, onChangeState, onChangeCity, onCreateNew, onEdit, onDelete }: DistrictsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCities = selectedStateId ? cities.filter(c => c.stateId === selectedStateId) : cities;

  return (
    <div className="mt-6 flow-root">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700">State:</label>
          <select
            value={selectedStateId}
            onChange={(e) => onChangeState(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <label className="text-sm text-gray-700">City:</label>
          <select
            value={selectedCityId}
            onChange={(e) => onChangeCity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All</option>
            {filteredCities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <Button onClick={onCreateNew} style={{ backgroundColor: '#007476' }}>
          <PlusIcon className="h-5 w-5 mr-2" /> New District
        </Button>
      </div>

      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">Name</th>
                <th className="px-3 py-5 font-medium">City</th>
                <th className="px-3 py-5 font-medium">State</th>
                <th className="px-3 py-5 font-medium">Created</th>
                <th className="px-3 py-5 font-medium">Updated</th>
                <th className="px-3 py-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {districts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No districts found</td>
                </tr>
              ) : (
                districts.map((d) => (
                  <tr key={d.id} className="w-full border-b py-3 text-sm">
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">{d.name}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">{d.cityName || '-'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">{d.stateName || '-'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">{new Date(d.createdAt).toLocaleString()}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">{new Date(d.updatedAt).toLocaleString()}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="flex justify-end space-x-3">
                        <button onClick={() => onEdit(d)} className="text-blue-600 hover:text-blue-800" title="Edit">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          disabled={deletingId === d.id}
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


