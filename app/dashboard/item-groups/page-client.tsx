'use client';

import { useState, useEffect } from 'react';
import { 
  fetchItemGroupsAction, 
  createItemGroupAction, 
  updateItemGroupAction, 
  deleteItemGroupAction, 
  toggleItemGroupActiveAction 
} from '@/app/lib/actions';
import ItemGroupsTable from '@/app/ui/item-groups/item-groups-table';
import ItemGroupForm from '@/app/ui/item-groups/item-group-form';
import PermissionError from '@/app/ui/permission-error';
import type { ItemGroup, CreateItemGroupRequest, UpdateItemGroupRequest } from '@/app/lib/definitions/item-group';

export default function ItemGroupsPageClient() {
  const [itemGroups, setItemGroups] = useState<ItemGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItemGroup, setEditingItemGroup] = useState<ItemGroup | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchItemGroups();
  }, []);

  const fetchItemGroups = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchItemGroupsAction();
      
      if ('error' in result) {
        setError(result.error);
      } else {
        setItemGroups(result.itemGroups);
      }
    } catch (err) {
      console.error('Error fetching item groups:', err);
      setError('NETWORK_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingItemGroup(null);
    setIsFormOpen(true);
  };

  const handleEdit = (itemGroup: ItemGroup) => {
    setEditingItemGroup(itemGroup);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateItemGroupRequest | UpdateItemGroupRequest) => {
    setFormLoading(true);
    
    try {
      let result;
      if (editingItemGroup) {
        result = await updateItemGroupAction(editingItemGroup.id, data);
      } else {
        result = await createItemGroupAction(data as CreateItemGroupRequest);
      }
      
      if (result.success) {
        setMessage(result.message);
        await fetchItemGroups();
        setIsFormOpen(false);
        setEditingItemGroup(null);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save item group');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (itemGroupId: string) => {
    try {
      const result = await deleteItemGroupAction(itemGroupId);
      
      if (result.success) {
        setMessage(result.message);
        await fetchItemGroups();
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error deleting item group:', err);
      setError('Failed to delete item group');
    }
  };

  const handleToggleActive = async (itemGroupId: string) => {
    try {
      const result = await toggleItemGroupActiveAction(itemGroupId);
      
      if (result.success) {
        setMessage(result.message);
        await fetchItemGroups();
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error toggling item group status:', err);
      setError('Failed to update item group status');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItemGroup(null);
  };

  if (error) {
    return <PermissionError errorType={error as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;
  }

  if (loading) {
    return <ItemGroupsTableSkeleton />;
  }

  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Item Groups</h1>
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

      <ItemGroupsTable
        itemGroups={itemGroups}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onCreateNew={handleCreateNew}
      />

      {/* Item Group Form Modal */}
      <ItemGroupForm
        itemGroup={editingItemGroup}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />
    </main>
  );
}

// Loading skeleton for the table
function ItemGroupsTableSkeleton() {
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
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="px-4 py-5 font-medium sm:pl-6">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="w-full border-b py-3 text-sm">
                  {[...Array(6)].map((_, j) => (
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
