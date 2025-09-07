'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, MapPinIcon, TrashIcon, CheckIcon, XMarkIcon as XIcon } from '@heroicons/react/24/outline';
import { 
  fetchWarehouseDistrictsAction, 
  addDistrictToWarehouseAction, 
  removeDistrictFromWarehouseAction,
  updateDistrictStatusAction 
} from '@/app/lib/actions';
import type { WarehouseDistrict } from '@/app/lib/definitions/warehouse';
import DistrictSelection from './district-selection';
import { District } from '@/app/lib/definitions';

interface WarehouseDistrictManagementModalProps {
  warehouseId: string | null;
  warehouseName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function WarehouseDistrictManagementModal({ 
  warehouseId, 
  warehouseName, 
  isOpen, 
  onClose 
}: WarehouseDistrictManagementModalProps) {
  const [warehouseDistricts, setWarehouseDistricts] = useState<WarehouseDistrict[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [updatingDistrict, setUpdatingDistrict] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && warehouseId) {
      fetchWarehouseDistricts();
    }
  }, [isOpen, warehouseId]);

  useEffect(() => {
    // Listen for remove district events from DistrictSelection component
    const handleRemoveDistrict = (event: CustomEvent) => {
      const { districtId } = event.detail;
      setSelectedDistricts(prev => prev.filter(d => d.id !== districtId));
    };

    window.addEventListener('removeDistrict', handleRemoveDistrict as EventListener);
    return () => {
      window.removeEventListener('removeDistrict', handleRemoveDistrict as EventListener);
    };
  }, []);

  const fetchWarehouseDistricts = async () => {
    if (!warehouseId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchWarehouseDistrictsAction(warehouseId);
      
      if ('error' in result) {
        switch (result.error) {
          case 'UNAUTHORIZED':
            setError('You are not authorized to view warehouse districts.');
            break;
          case 'PERMISSION_DENIED':
            setError('You do not have permission to view warehouse districts.');
            break;
          case 'NETWORK_ERROR':
            setError('Unable to connect to the server. Please check your connection and try again.');
            break;
          default:
            setError('An unexpected error occurred.');
        }
      } else {
        setWarehouseDistricts(result.districts);
      }
    } catch (err) {
      console.error('Error fetching warehouse districts:', err);
      setError('An unexpected error occurred while fetching warehouse districts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictSelect = async (district: District) => {
    if (!warehouseId) return;

    try {
      const result = await addDistrictToWarehouseAction(warehouseId, district.id);
      
      if (result.success) {
        setMessage('District added successfully');
        setSelectedDistricts(prev => [...prev, district]);
        // Refresh the warehouse districts list
        await fetchWarehouseDistricts();
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error adding district:', err);
      setError('Failed to add district');
    }
  };

  const handleRemoveDistrict = async (districtId: string) => {
    if (!warehouseId) return;

    setUpdatingDistrict(districtId);
    try {
      const result = await removeDistrictFromWarehouseAction(warehouseId, districtId);
      
      if (result.success) {
        setMessage('District removed successfully');
        setWarehouseDistricts(prev => prev.filter(d => d.district_id !== districtId));
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error removing district:', err);
      setError('Failed to remove district');
    } finally {
      setUpdatingDistrict(null);
    }
  };

  const handleToggleDistrictStatus = async (districtId: string, currentStatus: boolean) => {
    if (!warehouseId) return;

    setUpdatingDistrict(districtId);
    try {
      const result = await updateDistrictStatusAction(warehouseId, districtId, !currentStatus);
      
      if (result.success) {
        setMessage('District status updated successfully');
        setWarehouseDistricts(prev => 
          prev.map(d => 
            d.district_id === districtId 
              ? { ...d, active: !currentStatus }
              : d
          )
        );
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error updating district status:', err);
      setError('Failed to update district status');
    } finally {
      setUpdatingDistrict(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MapPinIcon className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Districts - {warehouseName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Messages */}
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{message}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading districts...</span>
            </div>
          )}

          {!loading && (
            <div className="space-y-6">
              {/* Add New District */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Add New District
                </h3>
                <DistrictSelection
                  onDistrictSelect={handleDistrictSelect}
                  selectedDistricts={selectedDistricts}
                />
              </div>

              {/* Current Districts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Districts ({warehouseDistricts.length})
                </h3>

                {warehouseDistricts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPinIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No districts assigned to this warehouse</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              District Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {warehouseDistricts.map((district) => (
                            <tr key={district.district_id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {district.district_name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  district.active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {district.active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleToggleDistrictStatus(district.district_id, district.active)}
                                    disabled={updatingDistrict === district.district_id}
                                    className={`${
                                      district.active 
                                        ? 'text-red-600 hover:text-red-800' 
                                        : 'text-green-600 hover:text-green-800'
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                                  >
                                    {district.active ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button
                                    onClick={() => handleRemoveDistrict(district.district_id)}
                                    disabled={updatingDistrict === district.district_id}
                                    className="text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
