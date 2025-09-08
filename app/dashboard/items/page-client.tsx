'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  fetchItemsAction, 
  createItemAction, 
  updateItemAction, 
  deleteItemAction, 
  toggleItemEnabledAction
} from '@/app/lib/actions';
import { 
  fetchManufacturersAction,
  fetchItemGroupsAction,
  fetchCurrenciesAction,
  fetchWarehousesAction
} from '@/app/lib/actions';
import ItemsTable from '@/app/ui/items/items-table';
import ItemForm from '@/app/ui/items/item-form';
import PermissionError from '@/app/ui/permission-error';
import type { Item, CreateItemRequest, UpdateItemRequest } from '@/app/lib/definitions/item';
import type { Manufacturer } from '@/app/lib/definitions/manufacturer';
import type { ItemGroup } from '@/app/lib/definitions/item-group';
import type { Currency } from '@/app/lib/definitions/currency';
import type { Warehouse } from '@/app/lib/definitions/warehouse';

export default function ItemsPageClient() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [itemGroups, setItemGroups] = useState<ItemGroup[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all required data in parallel
      const [
        itemsResult,
        manufacturersResult,
        itemGroupsResult,
        currenciesResult,
        warehousesResult
      ] = await Promise.all([
        fetchItemsAction(),
        fetchManufacturersAction(),
        fetchItemGroupsAction(),
        fetchCurrenciesAction(),
        fetchWarehousesAction(1, 100) // Get warehouses (max 100 per API limit)
      ]);

      // Check for errors
      if ('error' in itemsResult) {
        setError(itemsResult.error);
        return;
      }
      if ('error' in manufacturersResult) {
        setError(manufacturersResult.error);
        return;
      }
      if ('error' in itemGroupsResult) {
        setError(itemGroupsResult.error);
        return;
      }
      if ('error' in currenciesResult) {
        setError(currenciesResult.error);
        return;
      }
      if ('error' in warehousesResult) {
        setError(warehousesResult.error);
        return;
      }

      // Set data
      setItems(itemsResult.items);
      setManufacturers(manufacturersResult.manufacturers);
      setItemGroups(itemGroupsResult.itemGroups);
      setCurrencies(currenciesResult.currencies);
      setWarehouses(warehousesResult.warehouses);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('NETWORK_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateItemRequest | UpdateItemRequest) => {
    setFormLoading(true);
    
    try {
      let result;
      if (editingItem) {
        result = await updateItemAction(editingItem.id, data);
      } else {
        result = await createItemAction(data as CreateItemRequest);
      }
      
      if (result.success) {
        setMessage(result.message);
        await fetchAllData();
        setIsFormOpen(false);
        setEditingItem(null);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save item');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      const result = await deleteItemAction(itemId);
      
      if (result.success) {
        setMessage(result.message);
        await fetchAllData();
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };

  const handleToggleEnabled = async (itemId: string) => {
    try {
      const result = await toggleItemEnabledAction(itemId);
      
      if (result.success) {
        setMessage(result.message);
        await fetchAllData();
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error toggling item status:', err);
      setError('Failed to update item status');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  if (error) {
    return <PermissionError errorType={error as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;
  }

  if (loading) {
    return <ItemsTableSkeleton />;
  }

  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Items</h1>
      </div>

      {/* Success/Error Messages */}
      {message && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <ItemsTable
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleEnabled={handleToggleEnabled}
        onCreateNew={handleCreateNew}
      />

      {/* Item Form Modal */}
      <ItemForm
        item={editingItem}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        loading={formLoading}
        manufacturers={manufacturers}
        itemGroups={itemGroups}
        currencies={currencies}
        warehouses={warehouses}
      />
    </main>
  );
}

// Loading skeleton for the table
function ItemsTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="md:hidden">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mb-2 w-full rounded-md bg-white p-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                {[...Array(8)].map((_, i) => (
                  <th key={i} className="px-4 py-5 font-medium sm:pl-6">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="w-full border-b py-3 text-sm">
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-3 py-3">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
