'use client';

import { useState, useEffect } from 'react';
import { 
  fetchActiveIngredientsAction, 
  createActiveIngredientAction, 
  updateActiveIngredientAction, 
  deleteActiveIngredientAction 
} from '@/app/lib/actions';
import ActiveIngredientsTable from '@/app/ui/active-ingredients/active-ingredients-table';
import ActiveIngredientForm from '@/app/ui/active-ingredients/active-ingredient-form';
import PermissionError from '@/app/ui/permission-error';
import type { 
  ActiveIngredient, 
  CreateActiveIngredientRequest, 
  UpdateActiveIngredientRequest 
} from '@/app/lib/definitions/active-ingredient';

export default function ActiveIngredientsPageClient() {
  const [activeIngredients, setActiveIngredients] = useState<ActiveIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActiveIngredient, setEditingActiveIngredient] = useState<ActiveIngredient | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveIngredients();
  }, []);

  const fetchActiveIngredients = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchActiveIngredientsAction();
      
      if ('error' in result) {
        setError(result.error);
      } else {
        // Ensure activeIngredients is always an array
        setActiveIngredients(result.activeIngredients || []);
      }
    } catch (err) {
      console.error('Error fetching active ingredients:', err);
      setError('NETWORK_ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingActiveIngredient(null);
    setIsFormOpen(true);
  };

  const handleEdit = (activeIngredient: ActiveIngredient) => {
    setEditingActiveIngredient(activeIngredient);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateActiveIngredientRequest | UpdateActiveIngredientRequest) => {
    setFormLoading(true);
    
    try {
      let result;
      if (editingActiveIngredient) {
        result = await updateActiveIngredientAction(editingActiveIngredient.id, data);
      } else {
        result = await createActiveIngredientAction(data as CreateActiveIngredientRequest);
      }
      
      if (result.success) {
        setMessage(result.message);
        await fetchActiveIngredients();
        setIsFormOpen(false);
        setEditingActiveIngredient(null);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save active ingredient');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (activeIngredientId: string) => {
    try {
      const result = await deleteActiveIngredientAction(activeIngredientId);
      
      if (result.success) {
        setMessage(result.message);
        await fetchActiveIngredients();
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error deleting active ingredient:', err);
      setError('Failed to delete active ingredient');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingActiveIngredient(null);
  };

  if (error) {
    return <PermissionError errorType={error as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;
  }

  if (loading) {
    return <ActiveIngredientsTableSkeleton />;
  }

  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Active Ingredients</h1>
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

      <ActiveIngredientsTable
        activeIngredients={activeIngredients}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateNew={handleCreateNew}
      />

      {/* Active Ingredient Form Modal */}
      <ActiveIngredientForm
        activeIngredient={editingActiveIngredient}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />
    </main>
  );
}

// Loading skeleton for the table
function ActiveIngredientsTableSkeleton() {
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
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                {[...Array(4)].map((_, i) => (
                  <th key={i} className="px-4 py-5 font-medium sm:pl-6">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="w-full border-b py-3 text-sm">
                  {[...Array(4)].map((_, j) => (
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
