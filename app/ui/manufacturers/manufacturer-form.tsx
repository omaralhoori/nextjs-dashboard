'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/app/ui/button';
import { XMarkIcon, PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import type { Manufacturer, CreateManufacturerRequest, UpdateManufacturerRequest } from '@/app/lib/definitions/manufacturer';

interface ManufacturerFormProps {
  manufacturer?: Manufacturer | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateManufacturerRequest | UpdateManufacturerRequest, imageFile?: File) => Promise<void>;
  loading?: boolean;
}

export default function ManufacturerForm({
  manufacturer,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: ManufacturerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    country: '',
    email: '',
    website: '',
    description: '',
    phone: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!manufacturer;

  useEffect(() => {
    if (manufacturer) {
      setFormData({
        name: manufacturer.name || '',
        code: manufacturer.code || '',
        country: manufacturer.country || '',
        email: manufacturer.email || '',
        website: manufacturer.website || '',
        description: manufacturer.description || '',
        phone: manufacturer.phone || '',
      });
      setImagePreview(manufacturer.imageUrl || null);
    } else {
      setFormData({ name: '', code: '', country: '', email: '', website: '', description: '', phone: '' });
      setImagePreview(null);
    }
    setImageFile(null);
    setErrors({});
  }, [manufacturer]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.code.trim()) newErrors.code = 'Code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Please enter a valid email address';
    if (formData.website && !/^https?:\/\/.+/.test(formData.website))
      newErrors.website = 'Please enter a valid URL (starting with http:// or https://)';
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
    setErrors(prev => { const e = { ...prev }; delete e.image; return e; });
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const submitData = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      country: formData.country.trim(),
      email: formData.email.trim() || undefined,
      website: formData.website.trim() || undefined,
      description: formData.description.trim() || undefined,
      phone: formData.phone.trim() || undefined,
    };
    await onSubmit(submitData, imageFile || undefined);
    handleClose();
  };

  const handleClose = () => {
    setFormData({ name: '', code: '', country: '', email: '', website: '', description: '', phone: '' });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Manufacturer' : 'Create Manufacturer'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo / Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={e => e.target.files?.[0] && handleImageChange(e.target.files[0])}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <Image
                    src={imagePreview}
                    alt="Manufacturer logo"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 block text-xs text-[#007476] hover:underline"
                >
                  Change image
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#007476] hover:text-[#007476] transition-colors w-full justify-center"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                <span>Click to upload image</span>
                <PhotoIcon className="h-4 w-4 opacity-60" />
              </button>
            )}
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
            <p className="mt-1 text-xs text-gray-400">PNG, JPG, GIF, WebP up to 5MB</p>
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007476] focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Enter manufacturer name"
              disabled={loading}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Code Field */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <input
              type="text"
              id="code"
              value={formData.code}
              onChange={e => handleInputChange('code', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007476] focus:border-blue-500 ${errors.code ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Enter manufacturer code"
              disabled={loading}
            />
            {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
          </div>

          {/* Country Field */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <input
              type="text"
              id="country"
              value={formData.country}
              onChange={e => handleInputChange('country', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007476] focus:border-blue-500 ${errors.country ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Enter country"
              disabled={loading}
            />
            {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007476] focus:border-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Enter email address"
              disabled={loading}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Website Field */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={e => handleInputChange('website', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007476] focus:border-blue-500 ${errors.website ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="https://example.com"
              disabled={loading}
            />
            {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007476] focus:border-blue-500"
              placeholder="Enter phone number"
              disabled={loading}
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#007476] focus:border-blue-500"
              placeholder="Enter description"
              disabled={loading}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007476]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#007476] border border-transparent rounded-md hover:bg-[#005a5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007476] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditing ? 'Update Manufacturer' : 'Create Manufacturer'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
