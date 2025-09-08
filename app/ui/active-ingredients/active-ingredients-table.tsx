'use client';

import { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { ActiveIngredient } from '@/app/lib/definitions/active-ingredient';

interface ActiveIngredientsTableProps {
  activeIngredients: ActiveIngredient[];
  onEdit: (activeIngredient: ActiveIngredient) => void;
  onDelete: (activeIngredientId: string) => void;
  onCreateNew: () => void;
}

export default function ActiveIngredientsTable({
  activeIngredients,
  onEdit,
  onDelete,
  onCreateNew,
}: ActiveIngredientsTableProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Active Ingredients</h2>
            <button
              onClick={onCreateNew}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Add Active Ingredient
            </button>
          </div>
          
          <div className="md:hidden">
            {!activeIngredients || activeIngredients.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No active ingredients found</p>
              </div>
            ) : (
              activeIngredients.map((activeIngredient) => (
                <div key={activeIngredient.id} className="mb-2 w-full rounded-md bg-white p-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activeIngredient.active_ingredient_name}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(activeIngredient)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(activeIngredient.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <div className="text-xs text-gray-500">
                      Created: {new Date(activeIngredient.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Updated: {new Date(activeIngredient.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Active Ingredient Name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Created
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Updated
                </th>
                <th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {!activeIngredients || activeIngredients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No active ingredients found
                  </td>
                </tr>
              ) : (
                activeIngredients.map((activeIngredient) => (
                  <tr
                    key={activeIngredient.id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  >
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <p className="font-medium">{activeIngredient.active_ingredient_name}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {new Date(activeIngredient.created_at).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {new Date(activeIngredient.updated_at).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap py-3 pl-3 pr-4 sm:pr-6">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => onEdit(activeIngredient)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(activeIngredient.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this active ingredient? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
