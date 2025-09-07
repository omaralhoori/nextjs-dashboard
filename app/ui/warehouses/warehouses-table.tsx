'use client';

import { Warehouse } from '@/app/lib/actions';
import { formatDateToLocal } from '@/app/lib/utils';
import Link from 'next/link';
import { UserPlusIcon } from '@heroicons/react/24/outline';

export default function WarehousesTable({ warehouses }: { warehouses: Warehouse[] }) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {warehouses?.map((warehouse) => (
              <div
                key={warehouse.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {warehouse.warehouse_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {warehouse.phone}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      warehouse.status === 'enabled' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {warehouse.status}
                    </span>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Location: {warehouse.location}
                    </p>
                    <p className="text-sm text-gray-500">
                      Created: {formatDateToLocal(warehouse.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/warehouses/managers/create?warehouseId=${warehouse.id}`}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <UserPlusIcon className="h-4 w-4" />
                      Create Manager
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Warehouse Name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Phone
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Location
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Created At
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Updated At
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {warehouses?.map((warehouse) => (
                <tr
                  key={warehouse.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{warehouse.warehouse_name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {warehouse.phone}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {warehouse.location}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      warehouse.status === 'enabled' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {warehouse.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(warehouse.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(warehouse.updatedAt)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/dashboard/warehouses/managers/create?warehouseId=${warehouse.id}`}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <UserPlusIcon className="h-4 w-4" />
                        Create Manager
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
