'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, PhoneIcon, MapPinIcon, CalendarIcon, BuildingOfficeIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { fetchWarehouseDetailsAction, fetchWarehouseDistrictsAction } from '@/app/lib/actions';
import type { WarehouseDetailsResponse, WarehouseUser, WarehouseDistrict } from '@/app/lib/definitions/warehouse';
import WarehouseDistrictManagementModal from './warehouse-district-management-modal';

interface WarehouseDetailsModalProps {
  warehouseId: string | null;
  warehouseName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function WarehouseDetailsModal({ 
  warehouseId, 
  warehouseName, 
  isOpen, 
  onClose 
}: WarehouseDetailsModalProps) {
  const [warehouseDetails, setWarehouseDetails] = useState<WarehouseDetailsResponse | null>(null);
  const [warehouseDistricts, setWarehouseDistricts] = useState<WarehouseDistrict[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);

  const fetchWarehouseDetails = async () => {
    if (!warehouseId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchWarehouseDetailsAction(warehouseId);
      
      if ('error' in result) {
        switch (result.error) {
          case 'UNAUTHORIZED':
            setError('You are not authorized to view warehouse details.');
            break;
          case 'PERMISSION_DENIED':
            setError('You do not have permission to view warehouse details.');
            break;
          case 'NETWORK_ERROR':
            setError('Unable to connect to the server. Please check your connection and try again.');
            break;
          default:
            setError('An unexpected error occurred.');
        }
      } else {
        setWarehouseDetails(result);
      }
    } catch (err) {
      console.error('Error fetching warehouse details:', err);
      setError('An unexpected error occurred while fetching warehouse details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouseDistricts = async () => {
    if (!warehouseId) return;
    
    try {
      const result = await fetchWarehouseDistrictsAction(warehouseId);
      
      if ('error' in result) {
        console.error('Error fetching warehouse districts:', result.error);
      } else {
        setWarehouseDistricts(result.districts);
      }
    } catch (err) {
      console.error('Error fetching warehouse districts:', err);
    }
  };

  useEffect(() => {
    if (isOpen && warehouseId) {
      fetchWarehouseDetails();
      fetchWarehouseDistricts();
    }
  }, [isOpen, warehouseId, fetchWarehouseDetails, fetchWarehouseDistricts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'warehouse_manager':
        return 'bg-blue-100 text-blue-800';
      case 'warehouse_user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'enabled':
        return 'bg-green-100 text-green-800';
      case 'disabled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <BuildingOfficeIcon className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Warehouse Details
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
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading warehouse details...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XMarkIcon className="h-5 w-5 text-red-400" />
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

          {warehouseDetails && (
            <div className="space-y-6">
              {/* Warehouse Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {warehouseDetails.warehouse.warehouse_name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{warehouseDetails.warehouse.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{warehouseDetails.warehouse.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Created</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(warehouseDetails.warehouse.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(warehouseDetails.warehouse.status)}`}>
                        {warehouseDetails.warehouse.status}
                      </span>
                    </div>
                  </div>
                </div>

                {warehouseDetails.warehouse.adminNotes && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900">Admin Notes</p>
                    <p className="text-sm text-gray-600 mt-1">{warehouseDetails.warehouse.adminNotes}</p>
                  </div>
                )}
              </div>

              {/* Users Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Users ({warehouseDetails.userCount})
                  </h3>
                </div>

                {warehouseDetails.users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <UserIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No users assigned to this warehouse</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {warehouseDetails.users.map((user: WarehouseUser) => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.userName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.mobileNo}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                  {user.role.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.enabled ? 'enabled' : 'disabled')}`}>
                                  {user.enabled ? 'Enabled' : 'Disabled'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(user.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Districts Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    Covered Districts ({warehouseDistricts.length})
                  </h3>
                  <button
                    onClick={() => setIsDistrictModalOpen(true)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Cog6ToothIcon className="h-4 w-4" />
                    Manage Districts
                  </button>
                </div>

                {warehouseDistricts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPinIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No districts assigned to this warehouse</p>
                    <button
                      onClick={() => setIsDistrictModalOpen(true)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Add districts
                    </button>
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

      {/* Warehouse District Management Modal */}
      <WarehouseDistrictManagementModal
        warehouseId={warehouseId}
        warehouseName={warehouseName}
        isOpen={isDistrictModalOpen}
        onClose={() => {
          setIsDistrictModalOpen(false);
          // Refresh districts when modal closes
          fetchWarehouseDistricts();
        }}
      />
    </div>
  );
}
