'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/ui/button';
import { 
  AddressState, 
  City, 
  District 
} from '@/app/lib/definitions';
import { 
  fetchStatesAction, 
  fetchCitiesAction, 
  fetchDistrictsAction, 
  createWarehouseAction 
} from '@/app/lib/actions';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CreateWarehouseForm() {
  const [formData, setFormData] = useState({
    warehouse_name: '',
    district: '',
    phone: '',
    location: '',
  });
  
  const [states, setStates] = useState<AddressState[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingStates, setLoadingStates] = useState(true);

  // Load states on component mount
  useEffect(() => {
    const loadStates = async () => {
      const result = await fetchStatesAction();
      if ('error' in result) {
        setMessage({ type: 'error', text: 'Failed to load states' });
      } else {
        setStates(result.states);
      }
      setLoadingStates(false);
    };
    
    loadStates();
  }, []);

  // Load cities when state changes
  useEffect(() => {
    if (selectedState) {
      const loadCities = async () => {
        const result = await fetchCitiesAction(selectedState);
        if ('error' in result) {
          setMessage({ type: 'error', text: 'Failed to load cities' });
        } else {
          setCities(result.cities);
          setSelectedCity('');
          setSelectedDistrict('');
          setDistricts([]);
        }
      };
      
      loadCities();
    } else {
      setCities([]);
      setDistricts([]);
      setSelectedCity('');
      setSelectedDistrict('');
    }
  }, [selectedState]);

  // Load districts when city changes
  useEffect(() => {
    if (selectedCity) {
      const loadDistricts = async () => {
        const result = await fetchDistrictsAction(selectedCity);
        if ('error' in result) {
          setMessage({ type: 'error', text: 'Failed to load districts' });
        } else {
          setDistricts(result.districts);
          setSelectedDistrict('');
        }
      };
      
      loadDistricts();
    } else {
      setDistricts([]);
      setSelectedDistrict('');
    }
  }, [selectedCity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'state') {
      setSelectedState(value);
    } else if (name === 'city') {
      setSelectedCity(value);
    } else if (name === 'district') {
      setSelectedDistrict(value);
      setFormData(prev => ({
        ...prev,
        district: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDistrict) {
      setMessage({ type: 'error', text: 'Please select a district' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await createWarehouseAction({
        ...formData,
        district: selectedDistrict,
      });

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Reset form
        setFormData({
          warehouse_name: '',
          district: '',
          phone: '',
          location: '',
        });
        setSelectedState('');
        setSelectedCity('');
        setSelectedDistrict('');
        setCities([]);
        setDistricts([]);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (loadingStates) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Warehouse</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Warehouse Name */}
        <div>
          <label htmlFor="warehouse_name" className="block text-sm font-medium text-gray-700 mb-2">
            Warehouse Name *
          </label>
          <input
            type="text"
            id="warehouse_name"
            name="warehouse_name"
            value={formData.warehouse_name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter warehouse name"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="+963933335555"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="123 Main Street, Downtown Area"
          />
        </div>

        {/* Address Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Address Selection</h3>
          
          {/* State */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <select
              id="state"
              name="state"
              value={selectedState}
              onChange={handleSelectChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a state</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name} ({state.citiesCount} cities)
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <select
              id="city"
              name="city"
              value={selectedCity}
              onChange={handleSelectChange}
              required
              disabled={!selectedState}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} ({city.districtsCount} districts)
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
              District *
            </label>
            <select
              id="district"
              name="district"
              value={selectedDistrict}
              onChange={handleSelectChange}
              required
              disabled={!selectedCity}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select a district</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`flex items-center space-x-2 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading || !selectedDistrict}
            className="px-6 py-2"
          >
            {loading ? 'Creating...' : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </div>
  );
}
