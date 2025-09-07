'use client';

import { useState } from 'react';
import { Button } from '@/app/ui/button';
import { formatDateToLocal } from '@/app/lib/utils';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  EyeSlashIcon,
  PlusIcon,
  StarIcon,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/outline';
import type { Currency } from '@/app/lib/definitions/currency';

interface CurrenciesTableProps {
  currencies: Currency[];
  onEdit: (currency: Currency) => void;
  onDelete: (currencyId: string) => void;
  onToggleActive: (currencyId: string) => void;
  onSetDefault: (currencyId: string) => void;
  onCreateNew: () => void;
}

export default function CurrenciesTable({
  currencies,
  onEdit,
  onDelete,
  onToggleActive,
  onSetDefault,
  onCreateNew,
}: CurrenciesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (currencyId: string) => {
    if (window.confirm('Are you sure you want to delete this currency?')) {
      setDeletingId(currencyId);
      await onDelete(currencyId);
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (currencyId: string) => {
    if (window.confirm('Are you sure you want to set this as the default currency?')) {
      await onSetDefault(currencyId);
    }
  };

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          {/* Header with Create Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Currencies</h2>
            <Button
              onClick={onCreateNew}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusIcon className="h-4 w-4" />
              Create Currency
            </Button>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            {currencies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No currencies found
              </div>
            ) : (
              currencies.map((currency) => (
                <div key={currency.id} className="mb-2 w-full rounded-md bg-white p-4">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {currency.name}
                        </p>
                        {currency.is_default && (
                          <StarIconSolid className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {currency.code} • {currency.symbol}
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      currency.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {currency.active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">
                        Created: {formatDateToLocal(currency.created_at)}
                      </p>
                      {currency.exchange_rate && (
                        <p className="text-xs text-gray-500">
                          Rate: {currency.exchange_rate}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(currency)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit currency"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {!currency.is_default && (
                        <button
                          onClick={() => handleSetDefault(currency.id)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Set as default"
                        >
                          <StarIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onToggleActive(currency.id)}
                        className={currency.active 
                          ? 'text-orange-600 hover:text-orange-800' 
                          : 'text-green-600 hover:text-green-800'
                        }
                        title={currency.active ? 'Deactivate' : 'Activate'}
                      >
                        {currency.active ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(currency.id)}
                        disabled={deletingId === currency.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        title="Delete currency"
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
                  Currency
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Code
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Symbol
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Exchange Rate
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Created
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {currencies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No currencies found
                  </td>
                </tr>
              ) : (
                currencies.map((currency) => (
                  <tr key={currency.id} className="w-full border-b py-3 text-sm">
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900">
                              {currency.name}
                            </div>
                            {currency.is_default && (
                              <StarIconSolid className="h-4 w-4 text-yellow-500" title="Default currency" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {currency.code}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                      <span className="text-lg font-semibold">{currency.symbol}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                      {currency.exchange_rate ? currency.exchange_rate.toFixed(4) : '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        currency.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {currency.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                      {formatDateToLocal(currency.created_at)}
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(currency)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit currency"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {!currency.is_default && (
                          <button
                            onClick={() => handleSetDefault(currency.id)}
                            className="text-yellow-600 hover:text-yellow-800 p-1"
                            title="Set as default"
                          >
                            <StarIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onToggleActive(currency.id)}
                          className={`p-1 ${
                            currency.active 
                              ? 'text-orange-600 hover:text-orange-800' 
                              : 'text-green-600 hover:text-green-800'
                          }`}
                          title={currency.active ? 'Deactivate' : 'Activate'}
                        >
                          {currency.active ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(currency.id)}
                          disabled={deletingId === currency.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1"
                          title="Delete currency"
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
