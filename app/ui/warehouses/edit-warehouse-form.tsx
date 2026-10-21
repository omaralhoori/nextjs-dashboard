'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/app/ui/button';
import { XMarkIcon, PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import type { Warehouse, UpdateWarehouseRequest, OrderMode, WarehouseType } from '@/app/lib/definitions/warehouse';
import { fetchActiveManufacturersAction } from '@/app/lib/functions/manufacturers';

const inputCls =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]';

/** "" -> null, "12.5" -> 12.5 */
const toNumber = (v: string) => (v.trim() === '' ? null : Number(v));

interface EditWarehouseFormProps {
  warehouse: Warehouse | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateWarehouseRequest, imageFile?: File) => Promise<void>;
  loading?: boolean;
}

export default function EditWarehouseForm({
  warehouse,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: EditWarehouseFormProps) {
  const [formData, setFormData] = useState({
    warehouse_name: '',
    phone: '',
    location: '',
    adminNotes: '',
    status: 'enabled' as 'enabled' | 'disabled',
  });
  // Suppliers page profile (also editable by the warehouse manager, except type and companies)
  const [profile, setProfile] = useState({
    warehouse_type: 'distributor' as WarehouseType,
    work_days: '',
    work_hours: '',
    eta_label: '',
    min_order_amount: '',
    usd_rate: '',
    default_order_mode: 'split' as OrderMode,
  });
  const [agentIds, setAgentIds] = useState<string[]>([]);
  const [manufacturers, setManufacturers] = useState<Array<{ id: string; name: string }>>([]);
  const [mfrSearch, setMfrSearch] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (warehouse) {
      setFormData({
        warehouse_name: warehouse.warehouse_name || '',
        phone: warehouse.phone || '',
        location: warehouse.location || '',
        adminNotes: warehouse.adminNotes || '',
        status: warehouse.status === 'disabled' ? 'disabled' : 'enabled',
      });
      setProfile({
        warehouse_type: warehouse.warehouse_type ?? 'distributor',
        work_days: warehouse.work_days ?? '',
        work_hours: warehouse.work_hours ?? '',
        eta_label: warehouse.eta_label ?? '',
        min_order_amount: warehouse.min_order_amount != null ? String(warehouse.min_order_amount) : '',
        usd_rate: warehouse.usd_rate != null ? String(warehouse.usd_rate) : '',
        default_order_mode: warehouse.default_order_mode ?? 'split',
      });
      setAgentIds((warehouse.agent_of ?? []).map(a => a.id));
      setImagePreview(warehouse.imageUrl || null);
    } else {
      setFormData({
        warehouse_name: '',
        phone: '',
        location: '',
        adminNotes: '',
        status: 'enabled',
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setErrors({});
  }, [warehouse, isOpen]);

  useEffect(() => {
    if (!isOpen || manufacturers.length) return;
    fetchActiveManufacturersAction().then(res => {
      if (!('error' in res)) setManufacturers(res.manufacturers.map(m => ({ id: m.id, name: m.name })));
    });
  }, [isOpen, manufacturers.length]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.warehouse_name.trim()) newErrors.warehouse_name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    const usd = toNumber(profile.usd_rate);
    if (usd != null && !(usd > 0)) newErrors.usd_rate = 'Rate must be greater than 0';
    const min = toNumber(profile.min_order_amount);
    if (min != null && !(min >= 0)) newErrors.min_order_amount = 'Invalid amount';
    if (profile.warehouse_type === 'agent' && agentIds.length === 0) newErrors.agents = 'Choose the companies this agent represents';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image (JPEG, PNG, GIF, WebP)' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
      return;
    }
    setErrors(prev => {
      const e = { ...prev };
      delete e.image;
      return e;
    });
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(
      {
        warehouse_name: formData.warehouse_name.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim() || undefined,
        adminNotes: formData.adminNotes.trim() || null,
        status: formData.status,
        warehouse_type: profile.warehouse_type,
        agent_manufacturer_ids: profile.warehouse_type === 'agent' ? agentIds : [],
        work_days: profile.work_days.trim() || null,
        work_hours: profile.work_hours.trim() || null,
        eta_label: profile.eta_label.trim() || null,
        min_order_amount: toNumber(profile.min_order_amount),
        usd_rate: toNumber(profile.usd_rate),
        default_order_mode: profile.default_order_mode,
      },
      imageFile || undefined,
    );
  };

  const handleClose = () => {
    setImageFile(null);
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (!isOpen || !warehouse) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Warehouse</h2>
          <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(90vh-64px)]">
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Image</label>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Warehouse" fill className="object-cover" unoptimized />
                ) : (
                  <PhotoIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleImageChange(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <CloudArrowUpIcon className="h-4 w-4" />
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </button>
                {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.warehouse_name}
              onChange={e => handleInputChange('warehouse_name', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
            />
            {errors.warehouse_name && <p className="mt-1 text-xs text-red-600">{errors.warehouse_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={e => handleInputChange('location', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={e => handleInputChange('status', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
            >
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div className="rounded-lg border border-gray-200 p-3 space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Suppliers page (pharmacy app)</p>
              <p className="text-xs text-gray-500">Shown on the warehouse card. The warehouse manager can also edit these, except the type and companies.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Working days</label>
                <input dir="rtl" value={profile.work_days} onChange={e => setProfile(p => ({ ...p, work_days: e.target.value }))} placeholder="السبت – الخميس" maxLength={60} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Working hours</label>
                <input dir="rtl" value={profile.work_hours} onChange={e => setProfile(p => ({ ...p, work_hours: e.target.value }))} placeholder="9 ص – 5 م" maxLength={60} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Delivery time (if no hours)</label>
                <input dir="rtl" value={profile.eta_label} onChange={e => setProfile(p => ({ ...p, eta_label: e.target.value }))} placeholder="خلال 24 ساعة" maxLength={60} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Minimum order (SYP)</label>
                <input type="number" min={0} value={profile.min_order_amount} onChange={e => setProfile(p => ({ ...p, min_order_amount: e.target.value }))} placeholder="None" className={inputCls} />
                {errors.min_order_amount && <p className="mt-1 text-xs text-red-600">{errors.min_order_amount}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">USD rate (SYP per $)</label>
                <input type="number" min={0} step="0.0001" value={profile.usd_rate} onChange={e => setProfile(p => ({ ...p, usd_rate: e.target.value }))} placeholder="Global rate" className={inputCls} />
                {errors.usd_rate && <p className="mt-1 text-xs text-red-600">{errors.usd_rate}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Default order mode ($ + SYP)</label>
                <select value={profile.default_order_mode} onChange={e => setProfile(p => ({ ...p, default_order_mode: e.target.value as OrderMode }))} className={inputCls}>
                  <option value="split">Two orders (SYP and $)</option>
                  <option value="syp">One order in SYP</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Warehouse type</label>
              <select value={profile.warehouse_type} onChange={e => setProfile(p => ({ ...p, warehouse_type: e.target.value as WarehouseType }))} className={inputCls}>
                <option value="distributor">Distributor (all categories)</option>
                <option value="agent">Agent of specific companies (وكيل)</option>
              </select>
            </div>
            {profile.warehouse_type === 'agent' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Companies represented ({agentIds.length})</label>
                <input value={mfrSearch} onChange={e => setMfrSearch(e.target.value)} placeholder="Search companies…" className={`${inputCls} mb-2`} />
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto rounded-md border border-gray-200 p-2">
                  {manufacturers
                    .filter(m => agentIds.includes(m.id) || !mfrSearch.trim() || m.name.includes(mfrSearch.trim()))
                    .slice(0, 80)
                    .map(m => {
                      const on = agentIds.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          dir="rtl"
                          onClick={() => setAgentIds(ids => (on ? ids.filter(x => x !== m.id) : [...ids, m.id]))}
                          className={`rounded-full px-2.5 py-0.5 text-xs ring-1 ${on ? 'bg-[#007476] text-white ring-[#007476]' : 'bg-white text-gray-600 ring-gray-200'}`}
                        >
                          {m.name}
                        </button>
                      );
                    })}
                </div>
                {errors.agents && <p className="mt-1 text-xs text-red-600">{errors.agents}</p>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
            <textarea
              value={formData.adminNotes}
              onChange={e => handleInputChange('adminNotes', e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
            />
          </div>
          </div>

          <div className="flex justify-end gap-2 p-5 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading} className="px-4 py-2 text-sm">
              {loading ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
