'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  fetchStatesAction,
  fetchCitiesAction,
  fetchDistrictsAction,
  fetchDistrictDetailsAction,
} from '@/app/lib/actions';
import type { State, City, District } from '@/app/lib/definitions/address';
import type {
  PharmacyMoreFields,
  PharmacyProfile,
  UpdatePharmacyRequest,
} from '@/app/lib/definitions/registered-user';

/** "" -> null, "35.1" -> 35.1 */
const toNumber = (v: string) => (v.trim() === '' ? null : Number(v));

interface EditPharmacyFormProps {
  pharmacyId: string;
  pharmacy: {
    pharmacy_name: string;
    phone: string;
    district: string;
    status: string;
    adminNotes: string | null;
  } & PharmacyMoreFields;
  profile: PharmacyProfile | null;
  isOpen: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: UpdatePharmacyRequest) => Promise<void>;
}

export default function EditPharmacyForm({
  pharmacyId,
  pharmacy,
  profile,
  isOpen,
  loading = false,
  onClose,
  onSubmit,
}: EditPharmacyFormProps) {
  const [formData, setFormData] = useState({
    pharmacyNameEn: '',
    pharmacyNameAr: '',
    licenseOwnerName: '',
    phone: '',
    landlineNumber: '',
    governorate: '',
    administrativeDivision: '',
    area: '',
    detailedAddress: '',
    adminNotes: '',
    status: 'Active' as 'Pending' | 'Active' | 'Disabled',
    district: '',
    license_number: '',
    license_expiry: '',
    address_city: '',
    address_street: '',
    address_detail: '',
    address_phone: '',
    latitude: '',
    longitude: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      pharmacyNameEn: profile?.pharmacyNameEn || pharmacy.pharmacy_name || '',
      pharmacyNameAr: profile?.pharmacyNameAr || '',
      licenseOwnerName: profile?.licenseOwnerName || '',
      phone: pharmacy.phone || '',
      landlineNumber: profile?.landlineNumber || '',
      governorate: profile?.governorate || '',
      administrativeDivision: profile?.administrativeDivision || '',
      area: profile?.area || '',
      detailedAddress: profile?.detailedAddress || '',
      adminNotes: pharmacy.adminNotes || '',
      status: (pharmacy.status as 'Pending' | 'Active' | 'Disabled') || 'Active',
      district: pharmacy.district || '',
      license_number: pharmacy.license_number || '',
      license_expiry: pharmacy.license_expiry?.slice(0, 10) || '',
      address_city: pharmacy.address_city || '',
      address_street: pharmacy.address_street || '',
      address_detail: pharmacy.address_detail || '',
      address_phone: pharmacy.address_phone || '',
      latitude: pharmacy.latitude != null ? String(pharmacy.latitude) : '',
      longitude: pharmacy.longitude != null ? String(pharmacy.longitude) : '',
    });
    setErrors({});

    (async () => {
      setLoadingAddress(true);
      const statesRes = await fetchStatesAction();
      if (!('error' in statesRes)) setStates(statesRes.states);

      if (pharmacy.district) {
        const districtRes = await fetchDistrictDetailsAction(pharmacy.district);
        if (!('error' in districtRes) && districtRes.district) {
          const d = districtRes.district;
          setSelectedState(d.stateId || '');
          setSelectedCity(d.cityId || '');
          setFormData(prev => ({ ...prev, district: d.id }));

          if (d.stateId) {
            const citiesRes = await fetchCitiesAction({ stateId: d.stateId });
            if (!('error' in citiesRes)) setCities(citiesRes.cities);
          }
          if (d.cityId) {
            const districtsRes = await fetchDistrictsAction({ cityId: d.cityId });
            if (!('error' in districtsRes)) setDistricts(districtsRes.districts);
          }
        }
      }
      setLoadingAddress(false);
    })();
  }, [isOpen, pharmacy, profile, pharmacyId]);

  const handleStateChange = async (stateId: string) => {
    setSelectedState(stateId);
    setSelectedCity('');
    setFormData(prev => ({ ...prev, district: '' }));
    setDistricts([]);
    if (!stateId) {
      setCities([]);
      return;
    }
    const res = await fetchCitiesAction({ stateId });
    if (!('error' in res)) setCities(res.cities);
    else setCities([]);
  };

  const handleCityChange = async (cityId: string) => {
    setSelectedCity(cityId);
    setFormData(prev => ({ ...prev, district: '' }));
    if (!cityId) {
      setDistricts([]);
      return;
    }
    const res = await fetchDistrictsAction({ cityId });
    if (!('error' in res)) setDistricts(res.districts);
    else setDistricts([]);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!formData.pharmacyNameEn.trim()) next.pharmacyNameEn = 'English name is required';
    if (!formData.phone.trim()) next.phone = 'Phone is required';
    if (!formData.district) next.district = 'District is required';
    const lat = toNumber(formData.latitude);
    const lng = toNumber(formData.longitude);
    if ((lat == null) !== (lng == null)) next.latitude = 'Enter both latitude and longitude';
    if (lat != null && !(lat >= -90 && lat <= 90)) next.latitude = 'Invalid latitude';
    if (lng != null && !(lng >= -180 && lng <= 180)) next.longitude = 'Invalid longitude';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      pharmacy_name: formData.pharmacyNameEn.trim(),
      pharmacyNameEn: formData.pharmacyNameEn.trim(),
      pharmacyNameAr: formData.pharmacyNameAr.trim() || undefined,
      licenseOwnerName: formData.licenseOwnerName.trim() || undefined,
      phone: formData.phone.trim(),
      district: formData.district,
      landlineNumber: formData.landlineNumber.trim() || null,
      governorate: formData.governorate.trim() || undefined,
      administrativeDivision: formData.administrativeDivision.trim() || undefined,
      area: formData.area.trim() || undefined,
      detailedAddress: formData.detailedAddress.trim() || undefined,
      adminNotes: formData.adminNotes.trim() || null,
      status: formData.status,
      license_number: formData.license_number.trim() || null,
      license_expiry: formData.license_expiry || null,
      address_city: formData.address_city.trim() || null,
      address_street: formData.address_street.trim() || null,
      address_detail: formData.address_detail.trim() || null,
      address_phone: formData.address_phone.trim() || null,
      latitude: toNumber(formData.latitude),
      longitude: toNumber(formData.longitude),
    });
  };

  const setField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 px-5 py-4 bg-white">
          <h2 className="text-base font-semibold text-gray-900">Edit Pharmacy</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Pharmacy Name (EN)"
              value={formData.pharmacyNameEn}
              onChange={v => setField('pharmacyNameEn', v)}
              error={errors.pharmacyNameEn}
              required
            />
            <Field
              label="Pharmacy Name (AR)"
              value={formData.pharmacyNameAr}
              onChange={v => setField('pharmacyNameAr', v)}
              dir="rtl"
            />
            <Field
              label="License Owner"
              value={formData.licenseOwnerName}
              onChange={v => setField('licenseOwnerName', v)}
            />
            <Field
              label="Phone"
              value={formData.phone}
              onChange={v => setField('phone', v)}
              error={errors.phone}
              required
            />
            <Field
              label="Landline"
              value={formData.landlineNumber}
              onChange={v => setField('landlineNumber', v)}
            />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setField('status', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
              >
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Location</p>
            {loadingAddress ? (
              <p className="text-sm text-gray-400">Loading address…</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
                  <select
                    value={selectedState}
                    onChange={e => handleStateChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
                  >
                    <option value="">Select state</option>
                    {states.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
                  <select
                    value={selectedCity}
                    onChange={e => handleCityChange(e.target.value)}
                    disabled={!selectedState}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476] disabled:bg-gray-50"
                  >
                    <option value="">Select city</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.district}
                    onChange={e => setField('district', e.target.value)}
                    disabled={!selectedCity}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476] disabled:bg-gray-50 ${
                      errors.district ? 'border-red-300' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select district</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {errors.district && <p className="mt-1 text-xs text-red-600">{errors.district}</p>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Governorate (text)" value={formData.governorate} onChange={v => setField('governorate', v)} />
              <Field label="Administrative Division" value={formData.administrativeDivision} onChange={v => setField('administrativeDivision', v)} />
              <Field label="Area" value={formData.area} onChange={v => setField('area', v)} />
              <Field label="Detailed Address" value={formData.detailedAddress} onChange={v => setField('detailedAddress', v)} />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">App profile («المزيد»)</p>
            <p className="text-xs text-gray-400 mb-3">
              License shown on the pharmacy card (expiring within 60 days is highlighted). The delivery address and map pin are
              sent with every order; the pharmacy changes them by request (Pharmacy Requests).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="License number" value={formData.license_number} onChange={v => setField('license_number', v)} />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">License expiry</label>
                <input
                  type="date"
                  value={formData.license_expiry}
                  onChange={e => setField('license_expiry', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
                />
              </div>
              <Field label="Delivery city" value={formData.address_city} onChange={v => setField('address_city', v)} dir="rtl" />
              <Field label="Delivery street / area" value={formData.address_street} onChange={v => setField('address_street', v)} dir="rtl" />
              <Field label="Details for the driver" value={formData.address_detail} onChange={v => setField('address_detail', v)} dir="rtl" />
              <Field label="Receiving phone" value={formData.address_phone} onChange={v => setField('address_phone', v)} />
              <Field label="Latitude" value={formData.latitude} onChange={v => setField('latitude', v)} error={errors.latitude} />
              <Field label="Longitude" value={formData.longitude} onChange={v => setField('longitude', v)} error={errors.longitude} />
            </div>
            {toNumber(formData.latitude) != null && toNumber(formData.longitude) != null && (
              <a
                href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-semibold text-[#007476] underline"
              >
                Open pin in Google Maps
              </a>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Admin Notes</label>
            <textarea
              value={formData.adminNotes}
              onChange={e => setField('adminNotes', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  required,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        dir={dir}
        className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476] ${
          error ? 'border-red-300' : 'border-gray-200'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
