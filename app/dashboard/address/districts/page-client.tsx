"use client";

import { useEffect, useState } from 'react';
import {
  fetchStatesAction,
  fetchCitiesAction,
  fetchDistrictsAction,
  createDistrictAction,
  updateDistrictAction,
  deleteDistrictAction,
} from '@/app/lib/actions';
import type { State, City, District } from '@/app/lib/definitions/address';
import DistrictsTable from '@/app/ui/address/districts-table';
import DistrictForm from '@/app/ui/address/district-form';
import PermissionError from '@/app/ui/permission-error';

export default function DistrictsPageClient() {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const loadStates = async () => {
    const res = await fetchStatesAction();
    if ('error' in res) { setError(res.error); return; }
    setStates(res.states);
  };

  const loadCities = async () => {
    const res = await fetchCitiesAction({ stateId: selectedStateId || undefined });
    if ('error' in res) { setError(res.error); return; }
    setCities(res.cities);
  };

  const loadDistricts = async () => {
    const res = await fetchDistrictsAction({ cityId: selectedCityId || undefined });
    if ('error' in res) { setError(res.error); return; }
    setDistricts(res.districts);
  };

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    await loadStates();
    await loadCities();
    await loadDistricts();
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStateId, selectedCityId]);

  const handleCreateNew = () => { setEditingDistrict(null); setIsFormOpen(true); };
  const handleEdit = (d: District) => { setEditingDistrict(d); setIsFormOpen(true); };
  const handleDelete = async (districtId: string) => {
    const res = await deleteDistrictAction(districtId);
    if (!res.success) { setError(res.message); return; }
    await loadDistricts();
  };

  const handleSubmit = async (payload: { name: string; cityId: string }) => {
    setFormLoading(true);
    try {
      if (editingDistrict) {
        const res = await updateDistrictAction(editingDistrict.id, payload);
        if (!res.success) setError(res.message);
      } else {
        const res = await createDistrictAction(payload);
        if (!res.success) setError(res.message);
      }
      await loadDistricts();
      setIsFormOpen(false);
      setEditingDistrict(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Address - Districts</h1>
      </div>

      {loading ? (
        <div className="mt-6 text-gray-600">Loading districts...</div>
      ) : (
        <DistrictsTable
          states={states}
          cities={cities}
          districts={districts}
          selectedStateId={selectedStateId}
          selectedCityId={selectedCityId}
          onChangeState={(id) => { setSelectedStateId(id); setSelectedCityId(''); }}
          onChangeCity={setSelectedCityId}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <DistrictForm
        district={editingDistrict}
        cities={cities}
        isOpen={isFormOpen}
        loading={formLoading}
        onClose={() => { setIsFormOpen(false); setEditingDistrict(null); }}
        onSubmit={handleSubmit}
      />
    </main>
  );
}


