'use client';

import { useState } from 'react';
import { Button } from '@/app/ui/button';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import type { Item } from '@/app/lib/definitions/item';

interface ItemsTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (itemId: string) => void;
  onToggleEnabled: (itemId: string) => void;
  onCreateNew: () => void;
}

export default function ItemsTable({
  items,
  onEdit,
  onDelete,
  onToggleEnabled,
  onCreateNew,
}: ItemsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setDeletingId(itemId);
      await onDelete(itemId);
      setDeletingId(null);
    }
  };

  const getDrugClassBadgeColor = (drugClass: string) => {
    switch (drugClass) {
      case 'OTC':
        return 'bg-green-100 text-green-800';
      case 'RX':
        return 'bg-blue-100 text-blue-800';
      case 'Controlled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Header with Create Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <Button
              onClick={onCreateNew}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusIcon className="h-4 w-4" />
              Create Item
            </Button>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No items found
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="mb-2 w-full rounded-md bg-white p-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-900">
                        {item.item_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.generic_name && `${item.generic_name} • `}
                        {item.barcode}
                      </p>
                      <p className="text-xs text-gray-500">
                        Needs Stamp: {item.needs_stamp ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      item.enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.enabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">
                        {item.manufacturer?.name} • {item.itemGroup?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.buying_price} - {item.selling_price} {item.currencyEntity?.symbol}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDrugClassBadgeColor(item.drug_class)}`}>
                        {item.drug_class}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit item"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onToggleEnabled(item.id)}
                        className={item.enabled 
                          ? 'text-orange-600 hover:text-orange-800' 
                          : 'text-green-600 hover:text-green-800'
                        }
                        title={item.enabled ? 'Disable' : 'Enable'}
                      >
                        {item.enabled ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Delete item"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View */}
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Item Name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Generic Name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Barcode
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Manufacturer
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Prices
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Drug Class
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Needs Stamp
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="w-full border-b py-3 text-sm">
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.item_name}
                          </div>
                      <div className="text-gray-500 text-xs">
                        {Array.isArray(item.forms) && item.forms.length > 0
                          ? (item.forms as any[]).map((f) => (typeof f === 'string' ? f : (f?.id ?? ''))).filter(Boolean).join(', ')
                          : item.form}
                        {item.volume ? ` • ${item.volume}` : ''}
                      </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                      {item.generic_name || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="space-y-1">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {item.barcode}
                        </span>
                        {item.barcode2 && (
                          <span className="font-mono text-xs bg-gray-50 px-1 py-0.5 rounded block">
                            {item.barcode2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                      <div>
                        <div className="font-medium">{item.manufacturer?.name}</div>
                        <div className="text-xs text-gray-400">{item.itemGroup?.name}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                      <div className="space-y-1">
                        <div className="text-sm">
                          Buy: {item.buying_price} {item.currencyEntity?.symbol}
                        </div>
                        <div className="text-sm font-medium">
                          Sell: {item.selling_price} {item.currencyEntity?.symbol}
                        </div>
                        <div className="text-xs text-gray-400">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDrugClassBadgeColor(item.drug_class)}`}>
                        {item.drug_class}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                      {item.needs_stamp ? 'Yes' : 'No'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit item"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onToggleEnabled(item.id)}
                          className={`p-1 ${
                            item.enabled 
                              ? 'text-orange-600 hover:text-orange-800' 
                              : 'text-green-600 hover:text-green-800'
                          }`}
                          title={item.enabled ? 'Disable' : 'Enable'}
                        >
                          {item.enabled ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1"
                          title="Delete item"
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
    </div>
  );
}
