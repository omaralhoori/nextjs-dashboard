import { Suspense } from 'react';
import { fetchWarehousesAction } from '@/app/lib/actions';
import WarehousesTable from '@/app/ui/warehouses/warehouses-table';
import { WarehousesTableSkeleton } from '@/app/ui/warehouses/warehouses-table-skeleton';
import Pagination from '@/app/ui/pagination';
import { lusitana } from '@/app/ui/fonts';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    page?: string;
  };
}) {
  const page = Number(searchParams?.page) || 1;
  const limit = 20;

  const warehousesData = await fetchWarehousesAction(page, limit);

  // Check if there's an error
  if ('error' in warehousesData) {
    return (
      <main>
        <div className="flex items-center justify-between">
          <h1 className={`${lusitana.className} text-2xl`}>Warehouses</h1>
          <Link href="/dashboard/warehouses/create">
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Create Warehouse
            </Button>
          </Link>
        </div>
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">
            {warehousesData.error === 'UNAUTHORIZED' && 'Please log in to view warehouses.'}
            {warehousesData.error === 'PERMISSION_DENIED' && 'You do not have permission to view warehouses.'}
            {warehousesData.error === 'NETWORK_ERROR' && 'Unable to connect to the server. Please check your connection and try again.'}
          </p>
        </div>
      </main>
    );
  }

  const totalPages = Math.ceil(warehousesData.pagination.total / limit);

  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Warehouses</h1>
        <Link href="/dashboard/warehouses/create">
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Create Warehouse
          </Button>
        </Link>
      </div>
      
      <Suspense key={page} fallback={<WarehousesTableSkeleton />}>
        <WarehousesTable warehouses={warehousesData.warehouses} />
      </Suspense>
      
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} currentPage={page} />
      </div>
    </main>
  );
}
