'use client';

import { useState, useEffect, useCallback } from 'react';
import PageShell from '@/app/ui/page-shell';
import PermissionError from '@/app/ui/permission-error';
import PasswordResetTable from '@/app/ui/password-reset/password-reset-table';
import { fetchPasswordResetRequestsAction } from '@/app/lib/functions/password-reset';
import type { PasswordResetRequest } from '@/app/lib/definitions/password-reset';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
] as const;

export default function PasswordResetPageClient() {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'' | 'pending' | 'resolved' | 'rejected'>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchPasswordResetRequestsAction({
      status: statusFilter || undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    });
    if ('error' in result) {
      setPermError(result.error);
    } else {
      setRequests(result.requests);
      setTotal(result.pagination.total);
    }
    setLoading(false);
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <PageShell
      title="Password Reset Requests"
      count={total}
      filters={
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setStatusFilter(opt.value as typeof statusFilter); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                statusFilter === opt.value
                  ? 'bg-[#007476] text-white border-[#007476]'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-[#007476] hover:text-[#007476]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <PasswordResetTable requests={requests} onRefresh={load} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
