import CreateWarehouseManagerForm from '@/app/ui/warehouses/create-warehouse-manager-form';
import { lusitana } from '@/app/ui/fonts';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{
    warehouseId?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const warehouseId = resolvedSearchParams?.warehouseId;

  return (
    <main>
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard/warehouses"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Warehouses
        </Link>
      </div>
      
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Create Warehouse Manager
      </h1>
      <CreateWarehouseManagerForm warehouseId={warehouseId} />
    </main>
  );
}
