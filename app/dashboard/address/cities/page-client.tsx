"use client";

import { useEffect, useState } from 'react';
import {
  fetchStatesAction,
  fetchCitiesAction,
  createCityAction,
  updateCityAction,
  deleteCityAction,
} from '@/app/lib/actions';
import type { State, City } from '@/app/lib/definitions/address';
import CitiesTable from '@/app/ui/address/cities-table';
import CityForm from '@/app/ui/address/city-form';
import PermissionError from '@/app/ui/permission-error';

export default function CitiesPageClient() {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedStateId, setSelectedStateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const loadStates = async () => {
    const res = await fetchStatesAction();
    if ('error' in res) {
      setError(res.error);
      return;
    }
    setStates(res.states);
  };

  const loadCities = async (stateId?: string) => {
    const res = await fetchCitiesAction({ stateId });
    if ('error' in res) {
      setError(res.error);
      return;
    }
    setCities(res.cities);
  };

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    await loadStates();
    await loadCities(selectedStateId || undefined);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStateId]);

  const handleCreateNew = () => {
    setEditingCity(null);
    setIsFormOpen(true);
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setIsFormOpen(true);
  };

  const handleDelete = async (cityId: string) => {
    const res = await deleteCityAction(cityId);
    if (!res.success) {
      setError(res.message);
      return;
    }
    await loadCities(selectedStateId || undefined);
  };

  const handleSubmit = async (payload: { name: string; stateId: string }) => {
    setFormLoading(true);
    try {
      if (editingCity) {
        const res = await updateCityAction(editingCity.id, payload);
        if (!res.success) setError(res.message);
      } else {
        const res = await createCityAction(payload);
        if (!res.success) setError(res.message);
      }
      await loadCities(selectedStateId || undefined);
      setIsFormOpen(false);
      setEditingCity(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Address - Cities</h1>
      </div>

      {loading ? (
        <div className="mt-6 text-gray-600">Loading cities...</div>
      ) : (
        <CitiesTable
          states={states}
          cities={cities}
          selectedStateId={selectedStateId}
          onChangeState={setSelectedStateId}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <CityForm
        city={editingCity}
        states={states}
        isOpen={isFormOpen}
        loading={formLoading}
        onClose={() => { setIsFormOpen(false); setEditingCity(null); }}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
