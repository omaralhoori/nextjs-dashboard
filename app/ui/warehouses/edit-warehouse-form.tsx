'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/app/ui/button';
import { XMarkIcon, PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import type { Warehouse, UpdateWarehouseRequest } from '@/app/lib/definitions/warehouse';

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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.warehouse_name.trim()) newErrors.warehouse_name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
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
