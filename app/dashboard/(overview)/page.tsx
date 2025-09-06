import PharmaciesTable from '@/app/ui/pharmacies/table';
import PermissionError from '@/app/ui/permission-error';
import { lusitana } from '@/app/ui/fonts';
import { Suspense } from 'react';
import { fetchPendingPharmacies } from '@/app/lib/data';
import { PharmaciesTableSkeleton } from '@/app/ui/skeletons';
 
export default async function Page() {
  const pharmaciesData = await fetchPendingPharmacies();

  // Check if there's an error
  if ('error' in pharmaciesData) {
    return (
      <main>
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Dashboard
        </h1>
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