'use client';

import { useEffect, useState } from 'react';
import { 
  fetchStatesAction,
  createStateAction,
  updateStateAction,
  deleteStateAction,
} from '@/app/lib/actions';
import type { State } from '@/app/lib/definitions/address';
import StatesTable from '@/app/ui/address/states-table';
import StateForm from '@/app/ui/address/state-form';
import PermissionError from '@/app/ui/permission-error';

export default function StatesPageClient() {
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingState, setEditingState] = useState<State | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const loadStates = async () => {
    setLoading(true);
    setError(null);
    const result = await fetchStatesAction();
    if ('error' in result) {
      setError(result.error);
    } else {
      setStates(result.states);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStates();
  }, []);

  const handleCreateNew = () => {
    setEditingState(null);
    setIsFormOpen(true);
  };

  const handleEdit = (state: State) => {
    setEditingState(state);
    setIsFormOpen(true);
  };

  const handleDelete = async (stateId: string) => {
    const res = await deleteStateAction(stateId);
    if (res.success) {
      await loadStates();
    } else {
      setError(res.message);
    }
  };

  const handleSubmit = async (payload: { name: string }) => {
    setFormLoading(true);
    try {
      if (editingState) {
        const res = await updateStateAction(editingState.id, payload);
        if (!res.success) setError(res.message);
      } else {
        const res = await createStateAction(payload);
        if (!res.success) setError(res.message);
      }
      await loadStates();
      setIsFormOpen(false);
      setEditingState(null);
    } finally {
      setFormLoading(false);
    }
  };

  if (error) {
    return <PermissionError errorType={error as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;
  }

  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Address - States</h1>
      </div>

      {loading ? (
        <div className="mt-6 text-gray-600">Loading states...</div>
      ) : (
        <StatesTable
          states={states}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <StateForm
        state={editingState}
        isOpen={isFormOpen}
        loading={formLoading}
        onClose={() => { setIsFormOpen(false); setEditingState(null); }}
        onSubmit={handleSubmit}
      />
    </main>
  );
}


