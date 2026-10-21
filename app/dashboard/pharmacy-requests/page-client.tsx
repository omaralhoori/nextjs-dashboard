'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckIcon, XMarkIcon, MapPinIcon, ArrowLongLeftIcon } from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import PermissionError from '@/app/ui/permission-error';
import { TableSkeleton } from '@/app/ui/data-table';
import {
  approvePharmacyRequestAction,
  fetchPharmacyRequestsAction,
  rejectPharmacyRequestAction,
} from '@/app/lib/functions/pharmacy-requests';
import type { PharmacyChangeRequest } from '@/app/lib/definitions/pharmacy-requests';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all', label: 'All' },
];
const KIND_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'profile', label: 'Name / pharmacist' },
  { value: 'address', label: 'Address' },
  { value: 'document', label: 'Documents' },
];
const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  approved: 'bg-green-50 text-green-700 ring-green-200',
  rejected: 'bg-red-50 text-red-700 ring-red-200',
  cancelled: 'bg-gray-100 text-gray-500 ring-gray-200',
};

function resolveUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_API_URL}/${url.replace(/^\//, '')}`;
}

const mapLink = (lat?: number | null, lng?: number | null) =>
  lat != null && lng != null ? `https://www.google.com/maps?q=${lat},${lng}` : null;

/** One field: current → requested (highlighted when changed). */
function Diff({ label, from, to }: { label: string; from?: string | null; to?: string | null }) {
  const changed = (from ?? '') !== (to ?? '');
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span dir="rtl" className="flex flex-wrap items-center gap-1.5">
        {changed && <span className="text-gray-400 line-through">{from || '—'}</span>}
        {changed && <ArrowLongLeftIcon className="h-4 w-4 text-gray-400" />}
        <span className={changed ? 'font-semibold text-gray-900' : 'text-gray-600'}>{to || '—'}</span>
      </span>
    </div>
  );
}

function RequestBody({ r }: { r: PharmacyChangeRequest }) {
  const p = r.payload;
  const prev = r.previous ?? {};
  if (r.kind === 'profile') {
    return (
      <>
        <Diff label="Pharmacy name" from={prev.name} to={p.name} />
        <Diff label="Pharmacist" from={prev.owner} to={p.owner} />
      </>
    );
  }
  if (r.kind === 'address') {
    const before = mapLink(prev.lat, prev.lng);
    const after = mapLink(p.lat, p.lng);
    return (
      <>
        <Diff label="City" from={prev.city} to={p.city} />
        <Diff label="Street / area" from={prev.street} to={p.street} />
        <Diff label="Details" from={prev.detail} to={p.detail} />
        <Diff label="Receiving phone" from={prev.phone} to={p.phone} />
        <div className="grid grid-cols-[110px_1fr] gap-2 py-1 text-sm">
          <span className="text-gray-500">Map pin</span>
          <span className="flex flex-wrap gap-3">
            {before && <a href={before} target="_blank" rel="noopener noreferrer" className="text-gray-500 underline">Current</a>}
            {after && (
              <a href={after} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#007476] underline">
                <MapPinIcon className="h-4 w-4" /> Requested ({Number(p.lat).toFixed(5)}, {Number(p.lng).toFixed(5)})
              </a>
            )}
          </span>
        </div>
      </>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 pt-1">
      {[['Current', prev.image_url], ['New', p.image_url]].map(([label, url]) => (
        <div key={label}>
          <p className="mb-1 text-xs font-semibold text-gray-500">{label}</p>
          {url ? (
            <a href={resolveUrl(url)} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveUrl(url)} alt={label} className="h-40 w-full object-contain" />
            </a>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-200 text-xs text-gray-400">None</div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function PharmacyRequestsPageClient() {
  const [requests, setRequests] = useState<PharmacyChangeRequest[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [status, setStatus] = useState('pending');
  const [kind, setKind] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchPharmacyRequestsAction(status, kind || undefined);
    if ('error' in res) setPermError(res.error);
    else {
      setRequests(res.requests);
      setPendingCount(res.pending_count);
    }
    setLoading(false);
  }, [status, kind]);

  useEffect(() => { load(); }, [load]);

  const decide = async (r: PharmacyChangeRequest, approve: boolean) => {
    const note = notes[r.id]?.trim();
    if (!approve && !note) {
      setError('Write the reason for the pharmacy before rejecting');
      return;
    }
    setBusy(r.id);
    const res = approve ? await approvePharmacyRequestAction(r.id, note) : await rejectPharmacyRequestAction(r.id, note!);
    setBusy(null);
    if (res.success) {
      setSuccess(approve ? 'Approved — the new data is applied and the pharmacy was notified' : 'Rejected — the pharmacy was notified');
      load();
    } else setError(res.message);
  };

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  return (
    <PageShell
      title="Pharmacy Requests"
      subtitle="Changes sent from the app's «المزيد» page: pharmacy name / pharmacist, delivery address with map pin, license and union card images"
      count={pendingCount}
      successMessage={success}
      errorMessage={error}
      onClearSuccess={() => setSuccess(null)}
      onClearError={() => setError(null)}
      filters={
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setStatus(o.value)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${status === o.value ? 'border-[#007476] bg-[#007476] text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {o.label}
            </button>
          ))}
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="ml-auto rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
            {KIND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      }
    >
      {loading ? (
        <TableSkeleton cols={3} rows={4} />
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">No requests</div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {requests.map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900" dir="rtl">{r.pharmacy.name}</p>
                  <p className="text-xs text-gray-500">
                    {r.kind_label} · {r.requested_by.name || r.requested_by.mobile || '—'} · {new Date(r.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${STATUS_BADGE[r.status]}`}>{r.status}</span>
              </div>

              <div className="mt-3 border-t border-gray-100 pt-2">
                <RequestBody r={r} />
              </div>

              {r.status === 'pending' ? (
                <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                  <input
                    dir="rtl"
                    value={notes[r.id] ?? ''}
                    onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                    placeholder="ملاحظة للصيدلية (مطلوبة عند الرفض)"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => decide(r, false)}
                      disabled={busy === r.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      <XMarkIcon className="h-4 w-4" /> Reject
                    </button>
                    <button
                      onClick={() => decide(r, true)}
                      disabled={busy === r.id}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}
                    >
                      <CheckIcon className="h-4 w-4" /> Approve & apply
                    </button>
                  </div>
                </div>
              ) : (
                (r.admin_notes || r.reviewed_by) && (
                  <p className="mt-3 border-t border-gray-100 pt-2 text-xs text-gray-500" dir="rtl">
                    {r.reviewed_by && <>{r.reviewed_by} · </>}
                    {r.admin_notes}
                  </p>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
