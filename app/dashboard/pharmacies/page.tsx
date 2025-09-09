import AllPharmaciesTable from '@/app/ui/pharmacies/all-pharmacies-table';
import PermissionError from '@/app/ui/permission-error';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { fetchAllPharmaciesAction } from '@/app/lib/actions';
import Pagination from '@/app/ui/pagination';
import { AllPharmaciesTableSkeleton } from '@/app/ui/skeletons';

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const pharmaciesData = await fetchAllPharmaciesAction(currentPage, 20);

  // Check if there's an error
  if ('error' in pharmaciesData) {
    return (
      <main>
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          All Pharmacies
        </h1>
        <PermissionError errorType={pharmaciesData.error} />
      </main>
    );
  }

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        All Pharmacies
      </h1>
      <div className="mt-6">
        <Suspense fallback={<AllPharmaciesTableSkeleton />}>
          <AllPharmaciesTable pharmacies={pharmaciesData.pharmacies} />
        </Suspense>
      </div>
      
      {/* Pagination */}
      {pharmaciesData.totalPages > 1 && (
        <Pagination 
          totalPages={pharmaciesData.totalPages} 
          currentPage={currentPage} 
        />
      )}
      
      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          Showing {pharmaciesData.pharmacies.length} of {pharmaciesData.total} pharmacies
        </p>
      </div>
    </main>
  );
}
