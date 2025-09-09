'use client';

import { useState, useEffect } from 'react';
import { fetchStatesAction, fetchCitiesAction, fetchDistrictsAction } from '@/app/lib/actions';
import type { AddressState, City, District } from '@/app/lib/definitions/address';

interface DistrictSelectionProps {
  onDistrictSelect: (district: District) => void;
  selectedDistricts: District[];
  disabled?: boolean;
}

export default function DistrictSelection({ 
  onDistrictSelect, 
  selectedDistricts, 
  disabled = false 
}: DistrictSelectionProps) {
  const [states, setStates] = useState<AddressState[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [tempSelectedDistricts, setTempSelectedDistricts] = useState<string[]>([]);
  
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Fetch states on component mount
  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    setLoadingStates(true);
    try {
      const result = await fetchStatesAction();
      if ('error' in result) {
        console.error('Error fetching states:', result.error);
      } else {
        setStates(result.states);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (stateId: string) => {
    setLoadingCities(true);
    setCities([]);
    setDistricts([]);
    setSelectedCity('');
    setTempSelectedDistricts([]);
    
    try {
      const result = await fetchCitiesAction(stateId);
      if ('error' in result) {
        console.error('Error fetching cities:', result.error);
      } else {
        setCities(result.cities);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchDistricts = async (cityId: string) => {
    setLoadingDistricts(true);
    setDistricts([]);
    setTempSelectedDistricts([]);
    
    try {
      const result = await fetchDistrictsAction(cityId);
      if ('error' in result) {
        console.error('Error fetching districts:', result.error);
      } else {
        setDistricts(result.districts);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    if (stateId) {
      fetchCities(stateId);
    }
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    if (cityId) {
      fetchDistricts(cityId);
    }
  };

  const handleDistrictToggle = (districtId: string) => {
    if (tempSelectedDistricts.includes(districtId)) {
      // Remove district
      setTempSelectedDistricts(prev => prev.filter(id => id !== districtId));
    } else {
      // Add district
      setTempSelectedDistricts(prev => [...prev, districtId]);
    }
  };

  const handleAddSelectedDistricts = () => {
    // Add all selected districts
    tempSelectedDistricts.forEach(districtId => {
      const district = districts.find(d => d.id === districtId);
      if (district) {
        onDistrictSelect(district);
      }
    });
    
    // Reset selections
    setSelectedState('');
    setSelectedCity('');
    setTempSelectedDistricts([]);
    setCities([]);
    setDistricts([]);
  };

  const isDistrictAlreadyAdded = (districtId: string) => {
    return selectedDistricts.some(d => d.id === districtId);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700">
        Select Districts for Warehouse Coverage
      </div>
      
      {/* State Selection */}
      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
          State
        </label>
        <select
          id="state"
          value={selectedState}
          onChange={(e) => handleStateChange(e.target.value)}
          disabled={disabled || loadingStates}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select a state</option>
          {states.map((state) => (
            <option key={state.id} value={state.id}>
              {state.name} ({state.citiesCount} cities)
            </option>
          ))}
        </select>
        {loadingStates && (
          <div className="mt-1 text-xs text-gray-500">Loading states...</div>
        )}
      </div>

      {/* City Selection */}
      {selectedState && (
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <select
            id="city"
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={disabled || loadingCities}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select a city</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name} ({city.districtsCount} districts)
              </option>
            ))}
          </select>
          {loadingCities && (
            <div className="mt-1 text-xs text-gray-500">Loading cities...</div>
          )}
        </div>
      )}

      {/* District Selection */}
      {selectedCity && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Districts ({tempSelectedDistricts.length} selected)
          </label>
          {loadingDistricts ? (
            <div className="text-xs text-gray-500">Loading districts...</div>
          ) : (
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
              {districts.map((district) => {
                const isAlreadyAdded = isDistrictAlreadyAdded(district.id);
                const isChecked = tempSelectedDistricts.includes(district.id);
                
                return (
                  <label 
                    key={district.id} 
                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                      isAlreadyAdded 
                        ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleDistrictToggle(district.id)}
                      disabled={disabled || isAlreadyAdded}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                    <span className={`text-sm ${isAlreadyAdded ? 'text-gray-500' : 'text-gray-700'}`}>
                      {district.name}
                      {isAlreadyAdded && ' (Already added)'}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          
          {tempSelectedDistricts.length > 0 && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleAddSelectedDistricts}
                disabled={disabled}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add Selected Districts ({tempSelectedDistricts.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected Districts Display */}
      {selectedDistricts.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Selected Districts ({selectedDistricts.length})
          </div>
          <div className="space-y-2">
            {selectedDistricts.map((district) => (
              <div 
                key={district.id} 
                className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2"
              >
                <div className="text-sm text-blue-800">
                  <span className="font-medium">{district.name}</span>
                  <span className="text-blue-600 ml-2">
                    ({district.cityName}, {district.stateName})
                  </span>
                </div>
                <button
                  onClick={() => {
                    // This will be handled by the parent component
                    const event = new CustomEvent('removeDistrict', { 
                      detail: { districtId: district.id } 
                    });
                    window.dispatchEvent(event);
                  }}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-800 disabled:cursor-not-allowed"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
