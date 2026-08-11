'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import {
  fetchWarehouseDetailsAction,
  fetchWarehouseDistrictsAction,
  adminChangeUserPasswordAction,
} from '@/app/lib/actions';
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
  onClose,
}: WarehouseDetailsModalProps) {
  const [warehouseDetails, setWarehouseDetails] = useState<WarehouseDetailsResponse | null>(null);
  const [warehouseDistricts, setWarehouseDistricts] = useState<WarehouseDistrict[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState<WarehouseUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchWarehouseDetails = useCallback(async () => {
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
  }, [warehouseId]);

  const fetchWarehouseDistricts = useCallback(async () => {
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
  }, [warehouseId]);

  useEffect(() => {
    if (isOpen && warehouseId) {
      fetchWarehouseDetails();
      fetchWarehouseDistricts();
    } else if (!isOpen) {
      setWarehouseDetails(null);
      setWarehouseDistricts([]);
      setError(null);
      setLoading(false);
      setPasswordUser(null);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage(null);
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

  const openPasswordForm = (user: WarehouseUser) => {
    setPasswordUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMessage(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser) return;

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);
    const result = await adminChangeUserPasswordAction(passwordUser.id, newPassword);
    setPasswordLoading(false);

    if (!result.success) {
      setPasswordMessage({ type: 'error', text: result.message || 'Failed to change password.' });
      return;
    }

    setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setPasswordUser(null);
      setPasswordMessage(null);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
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
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-4">
                  {warehouseDetails.warehouse.imageUrl ? (
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-white border border-gray-200 shrink-0">
                      <Image
                        src={warehouseDetails.warehouse.imageUrl}
                        alt={warehouseDetails.warehouse.warehouse_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : null}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {warehouseDetails.warehouse.warehouse_name}
                  </h3>
                </div>

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

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Users ({warehouseDetails.userCount})
                  </h3>
                </div>

                {passwordUser && (
                  <form
                    onSubmit={handleChangePassword}
                    className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        Change password for {passwordUser.userName}
                      </p>
                      <button
                        type="button"
                        onClick={() => setPasswordUser(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="New password (min 6)"
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
                      />
                    </div>
                    {passwordMessage && (
                      <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                        {passwordMessage.text}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-3 py-1.5 text-sm font-medium text-white rounded-md disabled:opacity-50"
                      style={{ backgroundColor: '#007476' }}
                    >
                      {passwordLoading ? 'Updating…' : 'Update Password'}
                    </button>
                  </form>
                )}

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
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
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
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <button
                                  type="button"
                                  onClick={() => openPasswordForm(user)}
                                  className="inline-flex items-center gap-1 text-sm text-[#007476] hover:underline"
                                  title="Change password"
                                >
                                  <KeyIcon className="h-4 w-4" />
                                  Password
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

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

        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      <WarehouseDistrictManagementModal
        warehouseId={warehouseId}
        warehouseName={warehouseName}
        isOpen={isDistrictModalOpen}
        onClose={() => {
          setIsDistrictModalOpen(false);
          fetchWarehouseDistricts();
        }}
      />
    </div>
  );
}
