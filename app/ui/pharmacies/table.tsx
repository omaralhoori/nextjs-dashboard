'use client';

import { useState } from 'react';
import { Pharmacy } from '@/app/lib/data';
import { EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { approvePharmacy, rejectPharmacy } from '@/app/lib/actions';
import PharmacyFilesModal from './files-modal';

interface PharmaciesTableProps {
  pharmacies: Pharmacy[];
}

export default function PharmaciesTable({ pharmacies }: PharmaciesTableProps) {
  const [selectedPharmacy, setSelectedPharmacy] = useState<{ id: string; name: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApprove = async (pharmacyId: string) => {
    const result = await approvePharmacy(pharmacyId);
    if (result.success) {
      // You could add a toast notification here
      console.log('Pharmacy approved successfully');
    } else {
      console.error('Failed to approve pharmacy:', result.message);
    }
  };

  const handleReject = async (pharmacyId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    const result = await rejectPharmacy(pharmacyId, reason || undefined);
    if (result.success) {
      // You could add a toast notification here
      console.log('Pharmacy rejected successfully');
    } else {
      console.error('Failed to reject pharmacy:', result.message);
    }
  };

  const handlePreview = (pharmacyId: string, pharmacyName: string) => {
    setSelectedPharmacy({ id: pharmacyId, name: pharmacyName });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPharmacy(null);
  };
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {pharmacies?.map((pharmacy) => (
              <div
                key={pharmacy.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {pharmacy.pharmacy_name}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">{pharmacy.phone}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handlePreview(pharmacy.id, pharmacy.pharmacy_name)}
                      className="rounded-md border p-2 hover:bg-gray-100"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleApprove(pharmacy.id)}
                      className="rounded-md border p-2 hover:bg-gray-100 text-green-600"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleReject(pharmacy.id)}
                      className="rounded-md border p-2 hover:bg-gray-100 text-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Pharmacy Name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Phone
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Documents
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Created Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {pharmacies?.map((pharmacy) => (
                <tr
                  key={pharmacy.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{pharmacy.pharmacy_name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {pharmacy.phone}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                      pharmacy.hasUploadedDocuments 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {pharmacy.hasUploadedDocuments ? 'Uploaded' : 'Not Uploaded'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(pharmacy.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                      {pharmacy.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handlePreview(pharmacy.id, pharmacy.pharmacy_name)}
                        className="rounded-md border p-2 hover:bg-gray-100"
                        title="Preview Documents"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleApprove(pharmacy.id)}
                        className="rounded-md border p-2 hover:bg-gray-100 text-green-600"
                        title="Approve Pharmacy"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleReject(pharmacy.id)}
                        className="rounded-md border p-2 hover:bg-gray-100 text-red-600"
                        title="Reject Pharmacy"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pharmacy Files Modal */}
      {selectedPharmacy && (
        <PharmacyFilesModal
          pharmacyId={selectedPharmacy.id}
          pharmacyName={selectedPharmacy.name}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
