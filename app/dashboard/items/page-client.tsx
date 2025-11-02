'use client';

import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
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
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { Item, CreateItemRequest, UpdateItemRequest } from '@/app/lib/definitions/item';
import type { Manufacturer } from '@/app/lib/definitions/manufacturer';
import type { ItemGroup } from '@/app/lib/definitions/item-group';
import type { Currency } from '@/app/lib/definitions/currency';
import type { Warehouse } from '@/app/lib/definitions/warehouse';

export default function ItemsPageClient() {
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search input
  const debouncedSearch = useDebouncedCallback((term: string) => {
    setDebouncedSearchTerm(term);
    setCurrentPage(1); // Reset to page 1 when search changes
  }, 300);

  useEffect(() => {
    fetchAllData();
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      
      // Build filters for items
      const itemsFilters: any = {
        limit: itemsPerPage,
        offset,
      };
      
      // Add search if provided
      if (debouncedSearchTerm.trim()) {
        itemsFilters.search = debouncedSearchTerm.trim();
      }
      
      // Fetch all required data in parallel
      const [
        itemsResult,
        manufacturersResult,
        itemGroupsResult,
        currenciesResult,
        warehousesResult
      ] = await Promise.all([
        fetchItemsAction(itemsFilters),
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
      setTotalItems(itemsResult.total || itemsResult.items.length);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Items</h1>
      </div>

      {/* Search Box */}
      <div className="mb-6">
        <div className="relative flex flex-1 flex-shrink-0">
          <label htmlFor="search" className="sr-only">
            Search items
          </label>
          <input
            id="search"
            className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 focus:ring-2 focus:ring-[#007476] focus:border-[#007476]"
            placeholder="Search items by name, barcode, Arabic name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              debouncedSearch(e.target.value);
            }}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-[#007476]" />
        </div>
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

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalItems / itemsPerPage), prev + 1))}
              disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                {(() => {
                  const totalPages = Math.ceil(totalItems / itemsPerPage);
                  const pages: (number | string)[] = [];
                  
                  if (totalPages <= 7) {
                    // Show all pages if 7 or less
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    if (currentPage <= 4) {
                      // Show first 5 pages
                      for (let i = 1; i <= 5; i++) {
                        pages.push(i);
                      }
                      pages.push('...');
                      pages.push(totalPages);
                    } else if (currentPage >= totalPages - 3) {
                      // Show last 5 pages
                      pages.push(1);
                      pages.push('...');
                      for (let i = totalPages - 4; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Show middle pages
                      pages.push(1);
                      pages.push('...');
                      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(i);
                      }
                      pages.push('...');
                      pages.push(totalPages);
                    }
                  }
                  
                  return pages.map((page, index) => {
                    if (page === '...') {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                          currentPage === page
                            ? 'z-10 bg-[#007476] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
                            : 'text-gray-900'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalItems / itemsPerPage), prev + 1))}
                  disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

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
