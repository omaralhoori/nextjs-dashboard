import { Suspense } from 'react';
import { fetchUsersAction } from '@/app/lib/actions';
import UsersPageClient from './page-client';
import { UsersTableSkeleton } from '@/app/ui/skeletons';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    role?: string;
    enabled?: string;
    search?: string;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  // Build filters
  const filters = {
    role: resolvedSearchParams.role,
    enabled: resolvedSearchParams.enabled === 'true' ? true : resolvedSearchParams.enabled === 'false' ? false : undefined,
    search: resolvedSearchParams.search,
    orderBy: resolvedSearchParams.orderBy || 'userName',
    orderDirection: resolvedSearchParams.orderDirection || 'ASC',
    limit,
    offset,
  };

  const result = await fetchUsersAction(filters);

  if ('error' in result) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
          <p className="text-sm text-gray-500">
            {result.error === 'UNAUTHORIZED' && 'You are not authorized to view users.'}
            {result.error === 'PERMISSION_DENIED' && 'You do not have permission to view users.'}
            {result.error === 'NETWORK_ERROR' && 'Unable to connect to the server. Please check your connection and try again.'}
            {!['UNAUTHORIZED', 'PERMISSION_DENIED', 'NETWORK_ERROR'].includes(result.error) && 'An unexpected error occurred.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<UsersTableSkeleton />}>
      <UsersPageClient usersData={result} currentPage={currentPage} />
    </Suspense>
  );
}
