'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/app/ui/button';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import MedicineIngredientsManager from './medicine-ingredients-manager';
import ImageUpload from './image-upload';
import type { Item, CreateItemRequest, UpdateItemRequest } from '@/app/lib/definitions/item';
import type { Manufacturer } from '@/app/lib/definitions/manufacturer';
import type { ItemGroup } from '@/app/lib/definitions/item-group';
import type { Currency } from '@/app/lib/definitions/currency';
import type { Warehouse } from '@/app/lib/definitions/warehouse';
import type { ItemFile } from '@/app/lib/definitions/item-file';

interface ItemFormProps {
  item?: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateItemRequest | UpdateItemRequest) => Promise<void>;
  loading?: boolean;
  manufacturers: Manufacturer[];
  itemGroups: ItemGroup[];
  currencies: Currency[];
  warehouses: Warehouse[];
}

export default function ItemForm({ 
  item, 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false,
  manufacturers,
  itemGroups,
  currencies,
  warehouses
}: ItemFormProps) {
  const [formData, setFormData] = useState({
    manufacturer_id: '',
    item_group: '',
    item_name: '',
    generic_name: '',
    barcode: '',
    barcode2: '',
    buying_price: '',
    selling_price: '',
    currency: '',
    form: '',
    quantity: '1',
    usage: '',
    importer: '',
    drug_class: 'OTC' as 'OTC' | 'RX' | 'Controlled',
    drug_class_description: '',
    warehouse: '',
    needs_stamp: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Searchable dropdown states
  const [formsSearch, setFormsSearch] = useState('');
  const [showFormsDropdown, setShowFormsDropdown] = useState(false);
  const [formsSuggestions, setFormsSuggestions] = useState<string[]>([]);
  const [selectedForms, setSelectedForms] = useState<Array<{ id: string; volume?: string }>>([]);
  const [itemNameSearch, setItemNameSearch] = useState('');
  const [showItemNameDropdown, setShowItemNameDropdown] = useState(false);
  const [itemNameSuggestions, setItemNameSuggestions] = useState<string[]>([]);
  const [manufacturerSearch, setManufacturerSearch] = useState('');
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [currencySearch, setCurrencySearch] = useState('');
  const [showManufacturerDropdown, setShowManufacturerDropdown] = useState(false);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [itemFiles, setItemFiles] = useState<ItemFile[]>([]);

  const isEditing = !!item;

  // Update form data when item prop changes
  useEffect(() => {
    if (item) {
      setFormData({
        manufacturer_id: item.manufacturer_id || '',
        item_group: item.item_group || '',
        item_name: item.item_name || '',
        generic_name: item.generic_name || '',
        barcode: item.barcode || '',
        barcode2: item.barcode2 || '',
        buying_price: item.buying_price?.toString() || '',
        selling_price: item.selling_price?.toString() || '',
        currency: item.currency || '',
        form: item.form || '',
        quantity: item.quantity?.toString() || '1',
        usage: item.usage || '',
        importer: item.importer || '',
        drug_class: item.drug_class || 'OTC',
        drug_class_description: item.drug_class_description || '',
        warehouse: item.warehouse || '',
        needs_stamp: item.needs_stamp ?? false,
      });
      setItemNameSearch(item.item_name || '');
      // Initialize selected forms from item with volume support
      // API returns forms as: [{ form_id: "Amp", volume: "300mg", form: { id: "Amp" } }]
      const initialForms: Array<{ id: string; volume?: string }> = Array.isArray(item.forms) && item.forms.length > 0
        ? item.forms.map((f: any) => {
            // Handle different possible structures
            if (typeof f === 'string') {
              return { id: f };
            }
            // API structure: { form_id: "Amp", volume: "300mg", form: { id: "Amp" } }
            const formId = f?.form?.id ?? f?.form_id ?? f?.id ?? '';
            const volume = f?.volume && f.volume !== null ? String(f.volume) : undefined;
            return {
              id: formId,
              volume: volume || undefined,
            };
          }).filter((f) => f.id)
        : (item.form ? [{ id: item.form }] : []);
      setSelectedForms(initialForms);
      setFormsSearch('');
    } else {
      setFormData({
        manufacturer_id: '',
        item_group: '',
        item_name: '',
        generic_name: '',
        barcode: '',
        barcode2: '',
        buying_price: '',
        selling_price: '',
        currency: '',
        form: '',
        quantity: '1',
        usage: '',
        importer: '',
        drug_class: 'OTC',
        drug_class_description: '',
        warehouse: '',
        needs_stamp: false,
      });
      
      // Reset search values
      setItemNameSearch('');
      setManufacturerSearch('');
      setWarehouseSearch('');
      setSelectedForms([]);
      setFormsSearch('');
    }
    setErrors({});
  }, [item]);

  // Update search display values when manufacturers/warehouses/currencies change (only for initial load)
  useEffect(() => {
    if (item && manufacturers.length > 0 && warehouses.length > 0 && currencies.length > 0) {
      const selectedManufacturer = manufacturers.find(m => m.id === item.manufacturer_id);
      setManufacturerSearch(selectedManufacturer ? `${selectedManufacturer.name} (${selectedManufacturer.code})` : '');
      
      const selectedWarehouse = warehouses.find(w => w.id === item.warehouse);
      setWarehouseSearch(selectedWarehouse ? selectedWarehouse.warehouse_name : '');
      
      const selectedCurrency = currencies.find(c => c.id === item.currency);
      setCurrencySearch(selectedCurrency ? `${selectedCurrency.name} (${selectedCurrency.symbol})` : '');
    }
  }, [item, manufacturers, warehouses, currencies]);

  // Debounced fetch for item name suggestions (via internal API route with auth)
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ search: itemNameSearch || '', limit: '10' });
        const res = await fetch(`/api/items/names?${params.toString()}`, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!active) return;
        if (!res.ok) {
          setItemNameSuggestions([]);
          return;
        }
        const data = await res.json();
        const names: string[] = Array.isArray(data?.items) ? data.items : [];
        setItemNameSuggestions(names);
      } catch (err) {
        if (active) setItemNameSuggestions([]);
      }
    }, 300);

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [itemNameSearch]);

  // Debounced fetch for forms suggestions
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ search: formsSearch || '', limit: '10' });
        const res = await fetch(`/api/items/forms?${params.toString()}`, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!active) return;
        if (!res.ok) {
          setFormsSuggestions([]);
          return;
        }
        const data = await res.json();
        const items: string[] = Array.isArray(data?.items) ? data.items : [];
        setFormsSuggestions(items);
      } catch (err) {
        if (active) setFormsSuggestions([]);
      }
    }, 300);

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [formsSearch]);

  const fetchItemFiles = useCallback(async () => {
    if (!item?.id) return;
    
    try {
      const { fetchItemWithFilesAction } = await import('@/app/lib/actions');
      const result = await fetchItemWithFilesAction(item.id);
      
      if ('error' in result) {
        console.error('Error fetching item files:', result.error);
      } else {
        setItemFiles(result.files || []);
      }
    } catch (err) {
      console.error('Error fetching item files:', err);
    }
  }, [item?.id]);

  // Fetch item files when editing
  useEffect(() => {
    if (item?.id) {
      fetchItemFiles();
    }
  }, [item?.id, fetchItemFiles]);

  const handleImageUploadSuccess = () => {
    // Refresh the item files after successful upload
    fetchItemFiles();
  };

  const handleImageDeleteSuccess = () => {
    // Refresh the item files after successful deletion
    fetchItemFiles();
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.manufacturer_id) {
      newErrors.manufacturer_id = 'Manufacturer is required';
    }

    if (!formData.item_group) {
      newErrors.item_group = 'Item group is required';
    }

    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Item name is required';
    }

    // Barcode is optional - no validation needed

    if (!formData.buying_price || isNaN(Number(formData.buying_price))) {
      newErrors.buying_price = 'Valid buying price is required';
    }

    if (!formData.selling_price || isNaN(Number(formData.selling_price))) {
      newErrors.selling_price = 'Valid selling price is required';
    }

    if (!formData.currency) {
      newErrors.currency = 'Currency is required';
    }

    // Validate form: at least one form must be selected
    if (selectedForms.length === 0) {
      newErrors.form = 'At least one form is required';
    }

    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) < 1) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (!formData.drug_class) {
      newErrors.drug_class = 'Drug class is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare data for submission
      const submitData = {
        manufacturer_id: formData.manufacturer_id,
        item_group: formData.item_group,
        item_name: formData.item_name.trim(),
        generic_name: formData.generic_name.trim() || undefined,
        barcode: formData.barcode.trim() || undefined,
        barcode2: formData.barcode2.trim() || undefined,
        buying_price: Number(formData.buying_price),
        selling_price: Number(formData.selling_price),
        currency: formData.currency,
        // Send legacy single form only when no multi forms selected
        form: selectedForms.length === 0 ? formData.form.trim() : undefined,
        forms: selectedForms.length > 0 ? selectedForms.map(f => ({
          id: f.id,
          ...(f.volume && f.volume.trim() ? { volume: f.volume.trim() } : {})
        })) : undefined,
        quantity: Number(formData.quantity),
        usage: formData.usage.trim() || undefined,
        importer: formData.importer.trim() || undefined,
        drug_class: formData.drug_class,
        drug_class_description: formData.drug_class_description.trim() || undefined,
        warehouse: formData.warehouse || undefined,
        needs_stamp: formData.needs_stamp,
      };

      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      manufacturer_id: '',
      item_group: '',
      item_name: '',
      generic_name: '',
      barcode: '',
      barcode2: '',
      buying_price: '',
      selling_price: '',
      currency: '',
      form: '',
      quantity: '1',
      usage: '',
      importer: '',
      drug_class: 'OTC',
      drug_class_description: '',
      warehouse: '',
      needs_stamp: false,
    });
    setSelectedForms([]);
    setFormsSearch('');
    setErrors({});
    setManufacturerSearch('');
    setWarehouseSearch('');
    setCurrencySearch('');
    setShowManufacturerDropdown(false);
    setShowWarehouseDropdown(false);
    setShowCurrencyDropdown(false);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Filter manufacturers based on search
  const filteredManufacturers = manufacturers.filter(manufacturer =>
    manufacturer.name.toLowerCase().includes(manufacturerSearch.toLowerCase()) );

  // Filter warehouses based on search
  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.warehouse_name.toLowerCase().includes(warehouseSearch.toLowerCase())
  );

  // Filter currencies based on search
  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    currency.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    currency.symbol.toLowerCase().includes(currencySearch.toLowerCase())
  );

  // Handle manufacturer selection
  const handleManufacturerSelect = (manufacturer: Manufacturer) => {
    setFormData(prev => ({ ...prev, manufacturer_id: manufacturer.id }));
    setManufacturerSearch(`${manufacturer.name} (${manufacturer.code})`);
    setShowManufacturerDropdown(false);
  };

  // Handle warehouse selection
  const handleWarehouseSelect = (warehouse: Warehouse) => {
    setFormData(prev => ({ ...prev, warehouse: warehouse.id }));
    setWarehouseSearch(warehouse.warehouse_name);
    setShowWarehouseDropdown(false);
  };

  // Handle currency selection
  const handleCurrencySelect = (currency: Currency) => {
    setFormData(prev => ({ ...prev, currency: currency.id }));
    setCurrencySearch(`${currency.name} (${currency.symbol})`);
    setShowCurrencyDropdown(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest('.forms-dropdown') &&
        !target.closest('.item-name-dropdown') &&
        !target.closest('.manufacturer-dropdown') &&
        !target.closest('.warehouse-dropdown') &&
        !target.closest('.currency-dropdown')
      ) {
        setShowFormsDropdown(false);
        setShowItemNameDropdown(false);
        setShowManufacturerDropdown(false);
        setShowWarehouseDropdown(false);
        setShowCurrencyDropdown(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Item' : 'Create Item'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
          {/* Item Name with suggestions */}
          <div>
            <label htmlFor="item_name" className="block text-sm font-medium text-gray-700 mb-1">
              Item Name *
            </label>
            <div className="relative item-name-dropdown">
              <input
                type="text"
                id="item_name"
                value={formData.item_name}
                onChange={(e) => {
                  const v = e.target.value;
                  handleInputChange('item_name', v);
                  setItemNameSearch(v);
                  setShowItemNameDropdown(true);
                }}
                onFocus={() => setShowItemNameDropdown(true)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.item_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter or select item name"
                disabled={loading}
              />
              {showItemNameDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {itemNameSuggestions.length > 0 ? (
                    itemNameSuggestions.map((name) => (
                      <div
                        key={name}
                        onClick={() => {
                          handleInputChange('item_name', name);
                          setItemNameSearch(name);
                          setShowItemNameDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {name}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
                  )}
                </div>
              )}
            </div>
            {errors.item_name && (
              <p className="mt-1 text-sm text-red-600">{errors.item_name}</p>
            )}
          </div>

              {/* Manufacturer */}
              <div>
                <label htmlFor="manufacturer_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer *
                </label>
                <div className="relative manufacturer-dropdown">
                  <div className="relative">
                    <input
                      type="text"
                      value={manufacturerSearch}
                      onChange={(e) => {
                        setManufacturerSearch(e.target.value);
                        setShowManufacturerDropdown(true);
                        if (e.target.value === '') {
                          setFormData(prev => ({ ...prev, manufacturer_id: '' }));
                        }
                      }}
                      onFocus={() => setShowManufacturerDropdown(true)}
                      className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.manufacturer_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Search manufacturers..."
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {showManufacturerDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredManufacturers.length > 0 ? (
                        filteredManufacturers.map((manufacturer) => (
                          <div
                            key={manufacturer.id}
                            onClick={() => handleManufacturerSelect(manufacturer)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          >
                            <div className="font-medium">{manufacturer.name}</div>
                            <div className="text-gray-500 text-xs">{manufacturer.code} • {manufacturer.country}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No manufacturers found</div>
                      )}
                    </div>
                  )}
                </div>
                {errors.manufacturer_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.manufacturer_id}</p>
                )}
              </div>

              {/* Item Group */}
              <div>
                <label htmlFor="item_group" className="block text-sm font-medium text-gray-700 mb-1">
                  Item Group *
                </label>
                <select
                  id="item_group"
                  value={formData.item_group}
                  onChange={(e) => handleInputChange('item_group', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.item_group ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">Select Item Group</option>
                  {itemGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                {errors.item_group && (
                  <p className="mt-1 text-sm text-red-600">{errors.item_group}</p>
                )}
              </div>

              {/* Item Name */}
              <div>
                <label htmlFor="item_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  id="item_name"
                  value={formData.item_name}
                  onChange={(e) => handleInputChange('item_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.item_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter item name"
                  disabled={loading}
                />
                {errors.item_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.item_name}</p>
                )}
              </div>

              {/* Arabic Name */}
              <div>
                <label htmlFor="generic_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Arabic Name
                </label>
                <input
                  type="text"
                  id="generic_name"
                  value={formData.generic_name}
                  onChange={(e) => handleInputChange('generic_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Arabic name"
                  disabled={loading}
                />
              </div>

              {/* Forms (Multi-select with suggestions) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forms *
                </label>
                <div className={`border rounded-md p-2 ${errors.form ? 'border-red-300' : 'border-gray-300'}`}>
                  {/* Selected forms with volume inputs */}
                  {selectedForms.length > 0 && (
                    <div className="space-y-2 mb-2">
                      {selectedForms.map((formItem, index) => (
                        <div key={`${formItem.id}-${index}`} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-700">{formItem.id}</div>
                            <input
                              type="text"
                              value={formItem.volume || ''}
                              onChange={(e) => {
                                const updatedForms = [...selectedForms];
                                updatedForms[index] = { ...formItem, volume: e.target.value };
                                setSelectedForms(updatedForms);
                              }}
                              className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Volume (e.g., 100mg, 10ml)"
                              disabled={loading}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedForms(prev => prev.filter((_, i) => i !== index));
                              // Clear error when user removes a form and there are no forms left
                              if (selectedForms.length === 1 && errors.form) {
                                setErrors(prev => ({ ...prev, form: '' }));
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-lg font-bold"
                            aria-label={`Remove ${formItem.id}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Input + suggestions */}
                  <div className="relative forms-dropdown">
                    <input
                      type="text"
                      value={formsSearch}
                      onChange={(e) => {
                        setFormsSearch(e.target.value);
                        setShowFormsDropdown(true);
                        // Clear error when user starts typing/selecting
                        if (errors.form) {
                          setErrors(prev => ({ ...prev, form: '' }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const v = formsSearch.trim();
                          if (v && !selectedForms.some(f => f.id === v)) {
                            setSelectedForms(prev => [...prev, { id: v }]);
                            setFormsSearch('');
                            setShowFormsDropdown(false);
                            // Clear error when a form is added
                            if (errors.form) {
                              setErrors(prev => ({ ...prev, form: '' }));
                            }
                          }
                        }
                      }}
                      onFocus={() => setShowFormsDropdown(true)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.form ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Type to search or add (e.g., Tablets, Amp)"
                      disabled={loading}
                    />
                    {showFormsDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {formsSuggestions.length > 0 ? (
                          formsSuggestions.map((name) => (
                            <div
                              key={name}
                              onClick={() => {
                                if (!selectedForms.some(f => f.id === name)) {
                                  setSelectedForms(prev => [...prev, { id: name }]);
                                  // Clear error when a form is added
                                  if (errors.form) {
                                    setErrors(prev => ({ ...prev, form: '' }));
                                  }
                                }
                                setFormsSearch('');
                                setShowFormsDropdown(false);
                              }}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            >
                              {name}
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Press Enter to add a new form if not found. You can add volume for each form after selecting it.</p>
                </div>
                {errors.form && (
                  <p className="mt-1 text-sm text-red-600">{errors.form}</p>
                )}
              </div>

            </div>

            {/* Pricing & Inventory */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Pricing & Inventory</h3>
              
              {/* Currency */}
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency *
                </label>
                <div className="relative currency-dropdown">
                  <div className="relative">
                    <input
                      type="text"
                      value={currencySearch}
                      onChange={(e) => {
                        setCurrencySearch(e.target.value);
                        setShowCurrencyDropdown(true);
                        if (e.target.value === '') {
                          setFormData(prev => ({ ...prev, currency: '' }));
                        }
                      }}
                      onFocus={() => setShowCurrencyDropdown(true)}
                      className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.currency ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Search currencies..."
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {showCurrencyDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCurrencies.length > 0 ? (
                        filteredCurrencies.map((currency) => (
                          <div
                            key={currency.id}
                            onClick={() => handleCurrencySelect(currency)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          >
                            <div className="font-medium">{currency.name}</div>
                            <div className="text-gray-500 text-xs">{currency.code} • {currency.symbol}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No currencies found</div>
                      )}
                    </div>
                  )}
                </div>
                {errors.currency && (
                  <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
                )}
              </div>

              {/* Buying Price */}
              <div>
                <label htmlFor="buying_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Buying Price *
                </label>
                <input
                  type="number"
                  id="buying_price"
                  value={formData.buying_price}
                  onChange={(e) => handleInputChange('buying_price', e.target.value)}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.buying_price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  disabled={loading}
                />
                {errors.buying_price && (
                  <p className="mt-1 text-sm text-red-600">{errors.buying_price}</p>
                )}
              </div>

              {/* Selling Price */}
              <div>
                <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price *
                </label>
                <input
                  type="number"
                  id="selling_price"
                  value={formData.selling_price}
                  onChange={(e) => handleInputChange('selling_price', e.target.value)}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.selling_price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  disabled={loading}
                />
                {errors.selling_price && (
                  <p className="mt-1 text-sm text-red-600">{errors.selling_price}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.quantity ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="1"
                  disabled={loading}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                )}
              </div>

              {/* Warehouse */}
              <div>
                <label htmlFor="warehouse" className="block text-sm font-medium text-gray-700 mb-1">
                  Warehouse
                </label>
                <div className="relative warehouse-dropdown">
                  <div className="relative">
                    <input
                      type="text"
                      value={warehouseSearch}
                      onChange={(e) => {
                        setWarehouseSearch(e.target.value);
                        setShowWarehouseDropdown(true);
                        if (e.target.value === '') {
                          setFormData(prev => ({ ...prev, warehouse: '' }));
                        }
                      }}
                      onFocus={() => setShowWarehouseDropdown(true)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search warehouses..."
                      disabled={loading}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {showWarehouseDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      <div
                        onClick={() => {
                          setFormData(prev => ({ ...prev, warehouse: '' }));
                          setWarehouseSearch('');
                          setShowWarehouseDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-500"
                      >
                        No warehouse (Optional)
                      </div>
                      {filteredWarehouses.length > 0 ? (
                        filteredWarehouses.map((warehouse) => (
                          <div
                            key={warehouse.id}
                            onClick={() => handleWarehouseSelect(warehouse)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          >
                            <div className="font-medium">{warehouse.warehouse_name}</div>
                            <div className="text-gray-500 text-xs">{warehouse.location}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No warehouses found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Barcode Information */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Barcode Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primary Barcode */}
              <div>
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Barcode
                </label>
                <input
                  type="text"
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange('barcode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.barcode ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter primary barcode"
                  disabled={loading}
                />
                {errors.barcode && (
                  <p className="mt-1 text-sm text-red-600">{errors.barcode}</p>
                )}
              </div>

              {/* Secondary Barcode */}
              <div>
                <label htmlFor="barcode2" className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Barcode
                </label>
                <input
                  type="text"
                  id="barcode2"
                  value={formData.barcode2}
                  onChange={(e) => handleInputChange('barcode2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter secondary barcode"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Drug Classification */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Drug Classification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Drug Class */}
              <div>
                <label htmlFor="drug_class" className="block text-sm font-medium text-gray-700 mb-1">
                  Drug Class *
                </label>
                <select
                  id="drug_class"
                  value={formData.drug_class}
                  onChange={(e) => handleInputChange('drug_class', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.drug_class ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="OTC">OTC (Over-the-Counter)</option>
                  <option value="RX">RX (Prescription)</option>
                  <option value="Controlled">Controlled Substance</option>
                </select>
                {errors.drug_class && (
                  <p className="mt-1 text-sm text-red-600">{errors.drug_class}</p>
                )}
              </div>

              {/* Importer */}
              <div>
                <label htmlFor="importer" className="block text-sm font-medium text-gray-700 mb-1">
                  Importer
                </label>
                <input
                  type="text"
                  id="importer"
                  value={formData.importer}
                  onChange={(e) => handleInputChange('importer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter importer name"
                  disabled={loading}
                />
              </div>

              {/* Needs Stamp */}
              <div className="flex items-center pt-6">
                <input
                  id="needs_stamp"
                  type="checkbox"
                  checked={formData.needs_stamp}
                  onChange={(e) => setFormData(prev => ({ ...prev, needs_stamp: e.target.checked }))}
                  disabled={loading}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="needs_stamp" className="ml-2 block text-sm text-gray-700">
                  Needs Stamp
                </label>
              </div>
            </div>

            {/* Drug Class Description */}
            <div>
              <label htmlFor="drug_class_description" className="block text-sm font-medium text-gray-700 mb-1">
                Drug Class Description
              </label>
              <textarea
                id="drug_class_description"
                value={formData.drug_class_description}
                onChange={(e) => handleInputChange('drug_class_description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter drug class description"
                disabled={loading}
              />
            </div>

            {/* Usage */}
            <div>
              <label htmlFor="usage" className="block text-sm font-medium text-gray-700 mb-1">
                Usage Instructions
              </label>
              <textarea
                id="usage"
                value={formData.usage}
                onChange={(e) => handleInputChange('usage', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter usage instructions"
                disabled={loading}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditing ? 'Update Item' : 'Create Item'
              )}
            </Button>
          </div>
        </form>

        {/* Medicine Ingredients Manager - Only show when editing */}
        {isEditing && item?.id && (
          <MedicineIngredientsManager 
            itemId={item.id} 
            itemName={formData.item_name || item.item_name} 
          />
        )}

        {/* Image Upload - Only show when editing */}
        {isEditing && item?.id && (
          <ImageUpload 
            itemId={item.id}
            existingFiles={itemFiles}
            onUploadSuccess={handleImageUploadSuccess}
            onDeleteSuccess={handleImageDeleteSuccess}
          />
        )}
      </div>
    </div>
  );
}
