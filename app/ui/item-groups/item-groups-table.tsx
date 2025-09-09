'use client';

import { useState } from 'react';
import { formatDateToLocal } from '@/app/lib/utils';
import { 
  PencilIcon, 
  TrashIcon, 
  PowerIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';
import type { ItemGroup } from '@/app/lib/definitions/item-group';

interface ItemGroupsTableProps {
  itemGroups: ItemGroup[];
  onEdit: (itemGroup: ItemGroup) => void;
  onDelete: (itemGroupId: string) => void;
  onToggleActive: (itemGroupId: string) => void;
  onCreateNew: () => void;
}

export default function ItemGroupsTable({ 
  itemGroups, 
  onEdit, 
  onDelete, 
  onToggleActive,
  onCreateNew 
}: ItemGroupsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleDelete = async (itemGroupId: string) => {
    if (window.confirm('Are you sure you want to delete this item group?')) {
      setDeletingId(itemGroupId);
      await onDelete(itemGroupId);
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (itemGroupId: string) => {
    setTogglingId(itemGroupId);
    await onToggleActive(itemGroupId);
    setTogglingId(null);
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Header with Create Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Item Groups</h2>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Create Item Group
            </button>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            {itemGroups?.map((itemGroup) => (
              <div
                key={itemGroup.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {itemGroup.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {itemGroup.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      itemGroup.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {itemGroup.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Created: {formatDateToLocal(itemGroup.created_at)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Updated: {formatDateToLocal(itemGroup.updated_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(itemGroup)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(itemGroup.id)}
                      disabled={togglingId === itemGroup.id}
                      className={`${
                        itemGroup.active 
                          ? 'text-orange-600 hover:text-orange-800' 
                          : 'text-green-600 hover:text-green-800'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <PowerIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(itemGroup.id)}
                      disabled={deletingId === itemGroup.id}
                      className="text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Description
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Created At
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Updated At
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {itemGroups?.map((itemGroup) => (
                <tr
                  key={itemGroup.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{itemGroup.name}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-gray-600 max-w-xs truncate" title={itemGroup.description}>
                      {itemGroup.description}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      itemGroup.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {itemGroup.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(itemGroup.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(itemGroup.updated_at)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => onEdit(itemGroup)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit item group"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(itemGroup.id)}
                        disabled={togglingId === itemGroup.id}
                        className={`${
                          itemGroup.active 
                            ? 'text-orange-600 hover:text-orange-800' 
                            : 'text-green-600 hover:text-green-800'
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                        title={itemGroup.active ? 'Deactivate' : 'Activate'}
                      >
                        <PowerIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(itemGroup.id)}
                        disabled={deletingId === itemGroup.id}
                        className="text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete item group"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {itemGroups.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No item groups</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new item group.</p>
              <div className="mt-6">
                <button
                  onClick={onCreateNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Item Group
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
