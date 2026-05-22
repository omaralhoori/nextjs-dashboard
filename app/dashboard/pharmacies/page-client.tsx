'use client';

import { useState, useEffect, useCallback } from 'react';
import { EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import {
  DataTable, TableSkeleton, PaginationBar,
  FilterBar, SearchInput, FilterSelect, ActionBtn,
} from '@/app/ui/data-table';
import PermissionError from '@/app/ui/permission-error';
import PharmacyFilesModal from '@/app/ui/pharmacies/files-modal';
import { fetchAllPharmaciesAction } from '@/app/lib/functions/pharmacy';
import { approvePharmacy, rejectPharmacy } from '@/app/lib/functions/pharmacy';
import type { PharmacyWithUsers } from '@/app/lib/definitions/pharmacy';
import { formatDateToLocal } from '@/app/lib/utils';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const DOCS_OPTIONS = [
  { value: '', label: 'All Pharmacies' },
  { value: 'yes', label: 'Has Documents' },
  { value: 'no', label: 'No Documents' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
};

export default function PharmaciesPageClient() {
  const [allItems, setAllItems] = useState<PharmacyWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [docsFilter, setDocsFilter] = useState('');
  const [page, setPage] = useState(1);
  const [filesModal, setFilesModal] = useState<{ id: string; name: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let all: PharmacyWithUsers[] = [];
    let p = 1;
    let hasMore = true;
    while (hasMore) {
      const result = await fetchAllPharmaciesAction(p, 100);
      if ('error' in result) { setPermError(result.error); setLoading(false); return; }
      all = [...all, ...result.pharmacies];
      hasMore = p < result.totalPages;
      p++;
    }
    setAllItems(all);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = allItems.filter(item => {
    if (search) {
      const q = search.toLowerCase();
      if (!item.pharmacy_name.toLowerCase().includes(q) && !item.district.toLowerCase().includes(q)) return false;
    }
    if (statusFilter && item.status !== statusFilter) return false;
    if (docsFilter === 'yes' && !item.hasUploadedDocuments) return false;
    if (docsFilter === 'no' && item.hasUploadedDocuments) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = (setter: (v: string) => void) => (v: string) => { setter(v); setPage(1); };

  const handleApprove = async (id: string) => {
    const result = await approvePharmacy(id);
    if (result.success) { setSuccessMsg(result.message); await load(); }
    else setErrorMsg(result.message);
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Reason for rejection (optional):');
    if (reason === null) return;
    const result = await rejectPharmacy(id, reason || undefined);
    if (result.success) { setSuccessMsg(result.message); await load(); }
    else setErrorMsg(result.message);
  };

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  const columns = [
    {
      key: 'name',
      header: 'Pharmacy',
      render: (row: PharmacyWithUsers) => (
        <div>
          <div className="font-medium text-gray-900">{row.pharmacy_name}</div>
          <div className="text-xs text-gray-400">{row.district}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row: PharmacyWithUsers) => <span className="text-sm text-gray-600">{row.phone}</span>,
    },
    {
      key: 'users',
      header: 'Users',
      render: (row: PharmacyWithUsers) => <span className="text-sm text-gray-600">{row.userCount}</span>,
    },
    {
      key: 'documents',
      header: 'Documents',
      render: (row: PharmacyWithUsers) => (
        <button
          onClick={() => setFilesModal({ id: row.id, name: row.pharmacy_name })}
          className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${
            row.hasUploadedDocuments
              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100'
              : 'bg-gray-100 text-gray-500 ring-gray-200 hover:bg-gray-200'
          }`}
        >
          {row.hasUploadedDocuments ? 'View Docs' : 'No Docs'}
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: PharmacyWithUsers) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${STATUS_COLORS[row.status] ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row: PharmacyWithUsers) => <span className="text-xs text-gray-500">{formatDateToLocal(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row: PharmacyWithUsers) => (
        <div className="flex justify-end gap-1">
          <ActionBtn variant="view" icon={<EyeIcon className="h-4 w-4" />} label="View files" onClick={() => setFilesModal({ id: row.id, name: row.pharmacy_name })} />
          {row.status === 'pending' && (
            <>
              <ActionBtn variant="toggle-off" icon={<CheckIcon className="h-4 w-4" />} label="Approve" onClick={() => handleApprove(row.id)} />
              <ActionBtn variant="delete" icon={<XMarkIcon className="h-4 w-4" />} label="Reject" onClick={() => handleReject(row.id)} />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Pharmacies"
      count={filtered.length}
      successMessage={successMsg}
      errorMessage={errorMsg}
      onClearSuccess={() => setSuccessMsg(null)}
      onClearError={() => setErrorMsg(null)}
      filters={
        <FilterBar>
          <SearchInput value={search} onChange={resetPage(setSearch)} placeholder="Search name or district…" />
          <FilterSelect value={statusFilter} onChange={resetPage(setStatusFilter)} label="Status" options={STATUS_OPTIONS} />
          <FilterSelect value={docsFilter} onChange={resetPage(setDocsFilter)} label="Documents" options={DOCS_OPTIONS} />
        </FilterBar>
      }
    >
      {loading ? (
        <TableSkeleton cols={7} rows={6} />
      ) : (
        <div className="space-y-3">
          <DataTable
            columns={columns}
            rows={pageItems}
            keyExtractor={r => r.id}
            emptyMessage="No pharmacies found"
            mobileCard={row => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900">{row.pharmacy_name}</div>
                    <div className="text-xs text-gray-500">{row.district} · {row.phone}</div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ring-1 flex-shrink-0 ${STATUS_COLORS[row.status] ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{formatDateToLocal(row.createdAt)}</span>
                  <div className="flex gap-1">
                    <ActionBtn variant="view" icon={<EyeIcon className="h-4 w-4" />} label="View files" onClick={() => setFilesModal({ id: row.id, name: row.pharmacy_name })} />
                    {row.status === 'pending' && (
                      <>
                        <ActionBtn variant="toggle-off" icon={<CheckIcon className="h-4 w-4" />} label="Approve" onClick={() => handleApprove(row.id)} />
                        <ActionBtn variant="delete" icon={<XMarkIcon className="h-4 w-4" />} label="Reject" onClick={() => handleReject(row.id)} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          />
          <PaginationBar currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </div>
      )}
      {filesModal && (
        <PharmacyFilesModal
          pharmacyId={filesModal.id}
          pharmacyName={filesModal.name}
          isOpen
          onClose={() => setFilesModal(null)}
        />
      )}
    </PageShell>
  );
}
