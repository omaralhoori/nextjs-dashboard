import PharmaciesTable from '@/app/ui/pharmacies/table';
import PermissionError from '@/app/ui/permission-error';
import ConnectionTest from '@/app/ui/connection-test';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { fetchPendingPharmaciesAction } from '@/app/lib/actions';
import { PharmaciesTableSkeleton } from '@/app/ui/skeletons';

// Force dynamic rendering to avoid PPR conflicts
export const dynamic = 'force-dynamic';

export default async function Page() {
  const pharmaciesData = await fetchPendingPharmaciesAction();

  // Check if there's an error
  if ('error' in pharmaciesData) {
    return (
      <main>
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Dashboard
        </h1>
        <div className="mb-6">
          <ConnectionTest />
        </div>
        <PermissionError errorType={pharmaciesData.error} />
      </main>
    );
  }

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Pending Pharmacies
      </h1>
      <div className="mt-6">
        <Suspense fallback={<PharmaciesTableSkeleton />}>
          <PharmaciesTable pharmacies={pharmaciesData.pharmacies} />
        </Suspense>
      </div>
    </main>
  );
}