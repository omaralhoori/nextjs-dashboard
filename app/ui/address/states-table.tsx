'use client';

import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { State } from '@/app/lib/definitions/address';
import { Button } from '@/app/ui/button';

interface StatesTableProps {
  states: State[];
  onCreateNew: () => void;
  onEdit: (state: State) => void;
  onDelete: (stateId: string) => Promise<void> | void;
}

export default function StatesTable({ states, onCreateNew, onEdit, onDelete }: StatesTableProps) {
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
        <h2 className="text-lg font-medium text-gray-900">States</h2>
        <Button onClick={onCreateNew} style={{ backgroundColor: '#007476' }}>
          <PlusIcon className="h-5 w-5 mr-2" /> New State
        </Button>
      </div>

      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">Name</th>
                <th className="px-3 py-5 font-medium">Cities</th>
                <th className="px-3 py-5 font-medium">Created</th>
                <th className="px-3 py-5 font-medium">Updated</th>
                <th className="px-3 py-5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {states.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No states found</td>
                </tr>
              ) : (
                states.map((state) => (
                  <tr key={state.id} className="w-full border-b py-3 text-sm">
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">{state.name}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">{state.citiesCount ?? '-'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">{new Date(state.createdAt).toLocaleString()}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">{new Date(state.updatedAt).toLocaleString()}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="flex justify-end space-x-3">
                        <button onClick={() => onEdit(state)} className="text-blue-600 hover:text-blue-800" title="Edit">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(state.id)}
                          disabled={deletingId === state.id}
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


