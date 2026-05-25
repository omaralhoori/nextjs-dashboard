'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MagnifyingGlassIcon, XMarkIcon, CheckCircleIcon,
  NoSymbolIcon, PhotoIcon, DocumentTextIcon,
  BuildingOfficeIcon, UserIcon, PhoneIcon,
  MapPinIcon, IdentificationIcon, ArrowDownTrayIcon,
  ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import { TableSkeleton } from '@/app/ui/data-table';
import PermissionError from '@/app/ui/permission-error';
import {
  fetchPharmacyAccountsAction,
  fetchIndependentPharmacistsAction,
  fetchRegisteredUserDetailAction,
  type RegisteredUsersFilters,
} from '@/app/lib/functions/registered-users';
import { enableUserAction, disableUserAction } from '@/app/lib/functions/users';
import type {
  RegisteredUser,
  RegisteredUserDetails,
  PharmacyProfile,
  IndependentPharmacistProfile,
} from '@/app/lib/definitions/registered-user';

// ── Helpers ───────────────────────────────────────────────────────────────────

const PAGE_LIMIT = 12;

function resolveUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_API_URL}/${url.replace(/^\//, '')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function initials(user: RegisteredUser): string {
  const p = user.profile;
  if (p && 'pharmacyNameEn' in p) return p.pharmacyNameEn.slice(0, 2).toUpperCase();
  if (p && 'pharmacistName' in p) return p.pharmacistName.slice(0, 2).toUpperCase();
  return user.mobileNo.slice(-2);
}

function displayName(user: RegisteredUser): string {
  const p = user.profile;
  if (p && 'pharmacyNameEn' in p) return p.pharmacyNameEn;
  if (p && 'pharmacistName' in p) return p.pharmacistName;
  return user.mobileNo;
}

function subName(user: RegisteredUser): string {
  const p = user.profile;
  if (p && 'pharmacyNameAr' in p) return p.pharmacyNameAr;
  if (p && 'pharmacistName' in p) return p.governorate;
  return 'No profile submitted yet';
}

// ── Shared UI Primitives ──────────────────────────────────────────────────────

function StatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
      enabled
        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
        : 'bg-amber-50 text-amber-700 ring-amber-200'
    }`}>
      {enabled ? <CheckCircleIcon className="h-3 w-3" /> : <NoSymbolIcon className="h-3 w-3" />}
      {enabled ? 'Active' : 'Pending'}
    </span>
  );
}

function ProfileMissingBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 ring-1 ring-gray-200">
      No Profile
    </span>
  );
}

function TabBtn({ label, count, active, onClick }: { label: string; count: number | null; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        active
          ? 'bg-white text-[#007476] shadow-sm ring-1 ring-gray-200'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
      {count !== null && (
        <span className={`rounded-full px-1.5 py-0.5 text-xs ${active ? 'bg-[#007476] text-white' : 'bg-gray-200 text-gray-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-900">{value || '—'}</span>
    </div>
  );
}

function UserDetailModal({
  userId,
  onClose,
  onStatusChange,
  onError,
}: {
  userId: string;
  onClose: () => void;
  onStatusChange: () => void;
  onError: (msg: string) => void;
}) {
  const [details, setDetails] = useState<RegisteredUserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchRegisteredUserDetailAction(userId).then(res => {
      if (!('error' in res)) setDetails(res);
      setLoading(false);
    });
  }, [userId]);

  const handleToggle = async () => {
    if (!details) return;
    setToggling(true);
    const { user } = details;
    const res = user.enabled
      ? await disableUserAction(user.id)
      : await enableUserAction(user.id);
    setToggling(false);
    if (res.success) {
      setDetails(d => d ? { ...d, user: { ...d.user, enabled: !d.user.enabled } } : d);
      onStatusChange();
    } else {
      onError(res.message);
    }
  };

  const isPharmacy = details?.user.accountType === 'Pharmacy_Account';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 px-5 py-4 bg-white">
          <h2 className="text-base font-semibold text-gray-900">User Details</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : !details ? (
          <div className="p-8 text-center text-sm text-gray-400">Failed to load user details.</div>
        ) : (
          <div className="flex flex-col gap-0 divide-y divide-gray-100">
            {/* User hero */}
            <div className="px-5 py-4 flex items-center gap-4">
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}
              >
                {initials(details.user)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-gray-900 truncate">{displayName(details.user)}</p>
                <p className="text-sm text-gray-500 truncate">{subName(details.user)}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <StatusBadge enabled={details.user.enabled} />
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {isPharmacy ? 'Pharmacy Account' : 'Independent Pharmacist'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50 ${
                  details.user.enabled
                    ? 'bg-red-50 text-red-700 hover:bg-red-100 ring-1 ring-red-200'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200'
                }`}
              >
                {details.user.enabled
                  ? <><NoSymbolIcon className="h-3.5 w-3.5" />{toggling ? '…' : 'Disable'}</>
                  : <><CheckCircleIcon className="h-3.5 w-3.5" />{toggling ? '…' : 'Enable'}</>
                }
              </button>
            </div>

            {/* Account info */}
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Account</p>
              <div className="grid grid-cols-2 gap-3">
                <InfoRow label="Mobile" value={<span className="flex items-center gap-1"><PhoneIcon className="h-3.5 w-3.5 text-gray-400" />{details.user.mobileNo}</span>} />
                <InfoRow label="Username" value={details.user.userName} />
                <InfoRow label="Joined" value={formatDate(details.user.createdAt)} />
                <InfoRow label="User ID" value={<span className="font-mono text-xs">{details.user.id.slice(0, 8)}…</span>} />
              </div>
            </div>

            {/* Profile */}
            {details.user.profile ? (
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  {isPharmacy ? 'Pharmacy Profile' : 'Pharmacist Profile'}
                </p>
                {isPharmacy ? (
                  <PharmacyProfileSection profile={details.user.profile as PharmacyProfile} />
                ) : (
                  <IndependentProfileSection profile={details.user.profile as IndependentPharmacistProfile} />
                )}
              </div>
            ) : (
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Profile</p>
                <p className="text-sm text-gray-400 italic">User has not submitted their profile yet.</p>
              </div>
            )}

            {/* Profile Images */}
            {details.profileImages.length > 0 && (
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Profile Images</p>
                <div className="grid grid-cols-2 gap-3">
                  {details.profileImages.map((img, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-gray-500">{img.label}</span>
                      <a href={resolveUrl(img.url)} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                          src={resolveUrl(img.url)}
                          alt={img.label}
                          className="w-full h-28 rounded-xl object-cover border border-gray-200 hover:opacity-90 transition-opacity"
                          onError={e => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).className = 'hidden'; }}
                        />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Documents */}
            {details.uploadedDocuments.length > 0 && (
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Uploaded Documents ({details.uploadedDocuments.length})
                </p>
                <div className="space-y-2">
                  {details.uploadedDocuments.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                        <p className="text-xs text-gray-400">{doc.fileType.replace(/_/g, ' ')} · {formatBytes(doc.fileSize)}</p>
                      </div>
                      <a
                        href={resolveUrl(doc.filePath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 rounded-lg p-1.5 text-[#007476] hover:bg-[#007476]/10 transition-colors"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PharmacyProfileSection({ profile }: { profile: PharmacyProfile }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <InfoRow label="Pharmacy (EN)" value={profile.pharmacyNameEn} />
      <InfoRow label="Pharmacy (AR)" value={<span dir="rtl">{profile.pharmacyNameAr}</span>} />
      <InfoRow label="License Owner" value={<span className="flex items-center gap-1"><IdentificationIcon className="h-3.5 w-3.5 text-gray-400" />{profile.licenseOwnerName}</span>} />
      <InfoRow label="Landline" value={profile.landlineNumber} />
      <div className="col-span-2">
        <InfoRow
          label="Address"
          value={<span className="flex items-start gap-1"><MapPinIcon className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />{[profile.detailedAddress, profile.area, profile.administrativeDivision, profile.governorate].filter(Boolean).join(', ')}</span>}
        />
      </div>
    </div>
  );
}

function IndependentProfileSection({ profile }: { profile: IndependentPharmacistProfile }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <InfoRow label="Pharmacist Name" value={<span className="flex items-center gap-1"><UserIcon className="h-3.5 w-3.5 text-gray-400" />{profile.pharmacistName}</span>} />
      <InfoRow label="Governorate" value={<span className="flex items-center gap-1"><MapPinIcon className="h-3.5 w-3.5 text-gray-400" />{profile.governorate}</span>} />
    </div>
  );
}

// ── User Card ─────────────────────────────────────────────────────────────────

function UserCard({ user, onView }: { user: RegisteredUser; onView: () => void }) {
  const isPharmacy = user.accountType === 'Pharmacy_Account';
  const name = displayName(user);
  const sub = subName(user);
  const hasProfile = !!user.profile;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #007476, #2E8BC0)' }}
        >
          {initials(user)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 text-sm truncate">{name}</p>
          <p className="text-xs text-gray-500 truncate" dir={isPharmacy && hasProfile ? 'rtl' : 'ltr'}>{sub}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge enabled={user.enabled} />
        {!hasProfile && <ProfileMissingBadge />}
        <span className="text-xs text-gray-400 flex items-center gap-1">
          {isPharmacy ? <BuildingOfficeIcon className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
          {isPharmacy ? 'Pharmacy' : 'Pharmacist'}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
        <span className="flex items-center gap-1"><PhoneIcon className="h-3 w-3" />{user.mobileNo}</span>
        <span>{formatDate(user.createdAt)}</span>
      </div>

      <button
        onClick={onView}
        className="w-full rounded-xl py-2 text-sm font-semibold text-[#007476] bg-[#007476]/5 hover:bg-[#007476]/10 transition-colors"
      >
        View Details
      </button>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ offset, limit, total, hasMore, onPrev, onNext }: {
  offset: number; limit: number; total: number; hasMore: boolean;
  onPrev: () => void; onNext: () => void;
}) {
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + limit, total);
  return (
    <div className="flex items-center justify-between text-sm text-gray-500">
      <span>{total === 0 ? 'No results' : `${from}–${to} of ${total}`}</span>
      <div className="flex gap-1">
        <button
          onClick={onPrev}
          disabled={offset === 0}
          className="rounded-lg p-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <button
          onClick={onNext}
          disabled={!hasMore}
          className="rounded-lg p-1.5 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Tab Content ───────────────────────────────────────────────────────────────

type AccountTab = 'pharmacy' | 'pharmacist';

interface TabState {
  users: RegisteredUser[];
  total: number;
  hasMore: boolean;
  offset: number;
  search: string;
  enabledFilter: string;
  loading: boolean;
}

const DEFAULT_TAB_STATE: TabState = {
  users: [], total: 0, hasMore: false, offset: 0,
  search: '', enabledFilter: '', loading: true,
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function PharmaciesPageClient() {
  const [tab, setTab] = useState<AccountTab>('pharmacy');
  const [pharmacyState, setPharmacyState] = useState<TabState>(DEFAULT_TAB_STATE);
  const [pharmacistState, setPharmacistState] = useState<TabState>(DEFAULT_TAB_STATE);
  const [permError, setPermError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const state = tab === 'pharmacy' ? pharmacyState : pharmacistState;
  const setState = tab === 'pharmacy' ? setPharmacyState : setPharmacistState;

  const fetchTab = useCallback(async (
    which: AccountTab,
    filters: RegisteredUsersFilters,
    setter: React.Dispatch<React.SetStateAction<TabState>>,
  ) => {
    setter(s => ({ ...s, loading: true }));
    const res = which === 'pharmacy'
      ? await fetchPharmacyAccountsAction(filters)
      : await fetchIndependentPharmacistsAction(filters);
    if ('error' in res) {
      if (res.error === 'UNAUTHORIZED') setPermError('UNAUTHORIZED');
      setter(s => ({ ...s, loading: false }));
      return;
    }
    setter(s => ({
      ...s,
      users: res.users,
      total: res.pagination.total,
      hasMore: res.pagination.hasMore,
      loading: false,
    }));
  }, []);

  // Initial load for both tabs
  useEffect(() => {
    fetchTab('pharmacy', { limit: PAGE_LIMIT, offset: 0 }, setPharmacyState);
    fetchTab('pharmacist', { limit: PAGE_LIMIT, offset: 0 }, setPharmacistState);
  }, [fetchTab]);

  const buildFilters = (s: TabState): RegisteredUsersFilters => ({
    limit: PAGE_LIMIT,
    offset: s.offset,
    search: s.search || undefined,
    enabled: s.enabledFilter === 'enabled' ? true : s.enabledFilter === 'disabled' ? false : undefined,
  });

  const handleSearch = (value: string) => {
    setState(s => ({ ...s, search: value, offset: 0 }));
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setState(prev => {
        fetchTab(tab, { ...buildFilters(prev), search: value || undefined, offset: 0 }, setState);
        return prev;
      });
    }, 400);
  };

  const handleFilterChange = (value: string) => {
    const next: TabState = { ...state, enabledFilter: value, offset: 0 };
    setState(next);
    fetchTab(tab, buildFilters(next), setState);
  };

  const handlePrev = () => {
    const next: TabState = { ...state, offset: Math.max(0, state.offset - PAGE_LIMIT) };
    setState(next);
    fetchTab(tab, buildFilters(next), setState);
  };

  const handleNext = () => {
    const next: TabState = { ...state, offset: state.offset + PAGE_LIMIT };
    setState(next);
    fetchTab(tab, buildFilters(next), setState);
  };

  const handleTabSwitch = (t: AccountTab) => {
    setTab(t);
  };

  const refreshCurrentTab = () => {
    fetchTab(tab, buildFilters(state), setState);
  };

  if (permError) return <PermissionError errorType={permError as 'UNAUTHORIZED'} />;

  const tabBar = (
    <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
      <TabBtn
        label="Pharmacy Accounts"
        count={pharmacyState.loading ? null : pharmacyState.total}
        active={tab === 'pharmacy'}
        onClick={() => handleTabSwitch('pharmacy')}
      />
      <TabBtn
        label="Independent Pharmacists"
        count={pharmacistState.loading ? null : pharmacistState.total}
        active={tab === 'pharmacist'}
        onClick={() => handleTabSwitch('pharmacist')}
      />
    </div>
  );

  const filterBar = (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={state.search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
        />
      </div>
      {/* Status filter */}
      <select
        value={state.enabledFilter}
        onChange={e => handleFilterChange(e.target.value)}
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
      >
        <option value="">All Status</option>
        <option value="enabled">Active</option>
        <option value="disabled">Pending / Disabled</option>
      </select>
    </div>
  );

  return (
    <PageShell
      title="Registered Users"
      successMessage={successMsg}
      errorMessage={errorMsg}
      onClearSuccess={() => setSuccessMsg(null)}
      onClearError={() => setErrorMsg(null)}
      filters={
        <div className="space-y-3">
          {tabBar}
          {filterBar}
        </div>
      }
    >
      {state.loading ? (
        <TableSkeleton cols={3} rows={4} />
      ) : state.users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
          {tab === 'pharmacy'
            ? <BuildingOfficeIcon className="h-10 w-10 text-gray-300 mb-3" />
            : <UserIcon className="h-10 w-10 text-gray-300 mb-3" />
          }
          <p className="text-sm font-medium text-gray-500">No users found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {state.users.map(user => (
              <UserCard key={user.id} user={user} onView={() => setDetailUserId(user.id)} />
            ))}
          </div>
          <Pagination
            offset={state.offset}
            limit={PAGE_LIMIT}
            total={state.total}
            hasMore={state.hasMore}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      )}

      {detailUserId && (
        <UserDetailModal
          userId={detailUserId}
          onClose={() => setDetailUserId(null)}
          onStatusChange={refreshCurrentTab}
          onError={msg => setErrorMsg(msg)}
        />
      )}
    </PageShell>
  );
}
