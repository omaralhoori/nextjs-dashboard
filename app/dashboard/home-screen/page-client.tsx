'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PlusIcon, PencilIcon, TrashIcon, PhotoIcon,
  EyeIcon, EyeSlashIcon, ArrowsUpDownIcon,
  TagIcon, MagnifyingGlassIcon, XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import { TableSkeleton } from '@/app/ui/data-table';
import PermissionError from '@/app/ui/permission-error';
import {
  fetchBannersAction, createBannerAction, updateBannerAction, deleteBannerAction, uploadBannerImageAction,
  fetchOffersAction, createOfferAction, updateOfferAction, deleteOfferAction, uploadOfferImageAction,
  fetchFeaturedItemsAction, addFeaturedItemAction, updateFeaturedItemAction, deleteFeaturedItemAction,
  fetchActivePromotionsAction,
} from '@/app/lib/functions/home-screen';
import { fetchItemsAction } from '@/app/lib/functions/items';
import type { Banner, CreateBannerDto, Offer, CreateOfferDto, FeaturedItemEntry, PromotionOption } from '@/app/lib/definitions/home-screen';
import type { Item } from '@/app/lib/definitions/item';
import { formatDateToLocal } from '@/app/lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

const imgUrl = (path: string | null) =>
  path ? `${process.env.NEXT_PUBLIC_API_URL}/${path.replace(/^\//, '')}` : null;

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]';
const labelCls = 'block text-xs font-medium text-gray-500 mb-1';

// ── Shared Modal ──────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ── Promotion Select ──────────────────────────────────────────────────────────

function PromotionSelect({ value, onChange, promotions }: { value: string; onChange: (v: string) => void; promotions: PromotionOption[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
      <option value="">— No promotion —</option>
      {promotions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );
}

// ── Image Cell ────────────────────────────────────────────────────────────────

function ImageCell({
  path, onUpload, uploading,
}: { path: string | null; onUpload: (file: File) => void; uploading: boolean }) {
  const url = imgUrl(path);
  return (
    <div className="flex items-center gap-2">
      {url ? (
        <img src={url} alt="" className="h-10 w-14 rounded object-cover border border-gray-200 flex-shrink-0" />
      ) : (
        <div className="h-10 w-14 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
          <PhotoIcon className="h-5 w-5 text-gray-300" />
        </div>
      )}
      <label className={`cursor-pointer text-xs font-medium ${uploading ? 'text-gray-400' : 'text-[#007476] hover:underline'}`}>
        {uploading ? 'Uploading…' : url ? 'Change' : 'Upload'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={uploading}
          onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ''; }}
        />
      </label>
    </div>
  );
}

// ── Status Toggle ─────────────────────────────────────────────────────────────

function StatusToggle({ active, onToggle, loading }: { active: boolean; onToggle: () => void; loading: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 transition-all ${
        active ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-gray-100 text-gray-500 ring-gray-200'
      } disabled:opacity-50`}
    >
      {active ? <EyeIcon className="h-3 w-3" /> : <EyeSlashIcon className="h-3 w-3" />}
      {active ? 'Active' : 'Inactive'}
    </button>
  );
}

// ── Tab Button ────────────────────────────────────────────────────────────────

function TabBtn({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
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
      <span className={`rounded-full px-1.5 py-0.5 text-xs ${active ? 'bg-[#007476] text-white' : 'bg-gray-200 text-gray-600'}`}>
        {count}
      </span>
    </button>
  );
}

// ══ Banner Form ═══════════════════════════════════════════════════════════════

function BannerForm({
  banner, promotions, loading, onSubmit, onClose,
}: {
  banner?: Banner;
  promotions: PromotionOption[];
  loading: boolean;
  onSubmit: (dto: CreateBannerDto, image?: File) => void;
  onClose: () => void;
}) {
  const [startDate, setStartDate] = useState(banner?.start_date?.slice(0, 10) ?? '');
  const [endDate, setEndDate] = useState(banner?.end_date?.slice(0, 10) ?? '');
  const [isCarousel, setIsCarousel] = useState(banner?.is_carousel ?? false);
  const [promotionId, setPromotionId] = useState(banner?.promotion_id ?? '');
  const [sortOrder, setSortOrder] = useState(String(banner?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(banner?.is_active ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      start_date: startDate,
      end_date: endDate || null,
      is_carousel: isCarousel,
      promotion_id: promotionId || null,
      sort_order: Number(sortOrder),
      is_active: isActive,
    }, imageFile ?? undefined);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {!banner && (
        <div>
          <label className={labelCls}>Banner Image (optional)</label>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="" className="w-full h-32 rounded-lg object-cover border border-gray-200" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 rounded-full bg-white/80 p-1 text-gray-600 hover:bg-white shadow"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#007476] hover:bg-[#f0fafa] transition-colors">
              <PhotoIcon className="h-6 w-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-400">Click to upload image</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Start Date *</label>
          <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Linked Promotion</label>
        <PromotionSelect value={promotionId} onChange={setPromotionId} promotions={promotions} />
        {promotions.length === 0 && (
          <p className="mt-1 text-xs text-gray-400">No active promotions available</p>
        )}
      </div>
      <div>
        <label className={labelCls}>Sort Order</label>
        <input type="number" min={0} value={sortOrder} onChange={e => setSortOrder(e.target.value)} className={inputCls} />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={isCarousel} onChange={e => setIsCarousel(e.target.checked)} className="rounded" />
          Show in carousel
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded" />
          Active
        </label>
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
        <button
          type="submit"
          disabled={loading || !startDate}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}
        >
          {loading ? 'Saving…' : banner ? 'Save Changes' : 'Create Banner'}
        </button>
      </div>
    </form>
  );
}

// ══ Offer Form ════════════════════════════════════════════════════════════════

function OfferForm({
  offer, promotions, loading, onSubmit, onClose,
}: {
  offer?: Offer;
  promotions: PromotionOption[];
  loading: boolean;
  onSubmit: (dto: CreateOfferDto, image?: File) => void;
  onClose: () => void;
}) {
  const [titleEn, setTitleEn] = useState(offer?.title_en ?? '');
  const [titleAr, setTitleAr] = useState(offer?.title_ar ?? '');
  const [details, setDetails] = useState(offer?.details ?? '');
  const [promotionId, setPromotionId] = useState(offer?.promotion_id ?? '');
  const [sortOrder, setSortOrder] = useState(String(offer?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(offer?.is_active ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title_en: titleEn,
      title_ar: titleAr,
      details: details || undefined,
      promotion_id: promotionId || null,
      sort_order: Number(sortOrder),
      is_active: isActive,
    }, imageFile ?? undefined);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {!offer && (
        <div>
          <label className={labelCls}>Offer Image (optional)</label>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="" className="w-full h-32 rounded-lg object-cover border border-gray-200" />
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 rounded-full bg-white/80 p-1 text-gray-600 hover:bg-white shadow"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed border-gray-200 cursor-pointer hover:border-[#007476] hover:bg-[#f0fafa] transition-colors">
              <PhotoIcon className="h-6 w-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-400">Click to upload image</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>
      )}
      <div>
        <label className={labelCls}>Title (English) *</label>
        <input required value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="e.g. Special Offer" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Title (Arabic) *</label>
        <input required dir="rtl" value={titleAr} onChange={e => setTitleAr(e.target.value)} placeholder="مثال: عرض خاص" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Details</label>
        <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} placeholder="Optional description…" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Linked Promotion</label>
        <PromotionSelect value={promotionId} onChange={setPromotionId} promotions={promotions} />
        {promotions.length === 0 && (
          <p className="mt-1 text-xs text-gray-400">No active promotions available</p>
        )}
      </div>
      <div>
        <label className={labelCls}>Sort Order</label>
        <input type="number" min={0} value={sortOrder} onChange={e => setSortOrder(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded" />
          Active
        </label>
      </div>
      <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
        <button
          type="submit"
          disabled={loading || !titleEn || !titleAr}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}
        >
          {loading ? 'Saving…' : offer ? 'Save Changes' : 'Create Offer'}
        </button>
      </div>
    </form>
  );
}

// ══ Item Search Modal ═════════════════════════════════════════════════════════

function ItemSearchModal({ onSelect, onClose }: { onSelect: (item: Item) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await fetchItemsAction({ search: query, limit: 10 });
      if (!('error' in res)) setResults(res.items ?? []);
      setSearching(false);
    }, 300);
  }, [query]);

  return (
    <Modal title="Search Items" onClose={onClose}>
      <div className="space-y-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
          />
        </div>

        {searching && <p className="text-center text-xs text-gray-400 py-4">Searching…</p>}

        {!searching && results.length === 0 && query.trim() && (
          <p className="text-center text-xs text-gray-400 py-4">No items found</p>
        )}

        {!searching && results.length === 0 && !query.trim() && (
          <p className="text-center text-xs text-gray-400 py-4">Type to search items</p>
        )}

        <div className="space-y-1 max-h-64 overflow-y-auto">
          {results.map(item => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
            >
              <CheckCircleIcon className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.item_name}</p>
                <p className="text-xs text-gray-400 truncate">
                  {item.generic_name && `${item.generic_name} · `}{item.form}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ══ Banners Tab ═══════════════════════════════════════════════════════════════

function BannersTab({
  banners, promotions, onRefresh, onSuccess, onError,
}: {
  banners: Banner[];
  promotions: PromotionOption[];
  onRefresh: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; banner?: Banner } | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleSubmit = async (dto: CreateBannerDto, image?: File) => {
    setFormLoading(true);
    let res;
    if (modal?.banner) {
      res = await updateBannerAction(modal.banner.id, dto);
    } else {
      const fd = new FormData();
      fd.append('start_date', dto.start_date);
      if (dto.end_date) fd.append('end_date', dto.end_date);
      fd.append('is_carousel', String(dto.is_carousel ?? false));
      if (dto.promotion_id) fd.append('promotion_id', dto.promotion_id);
      fd.append('sort_order', String(dto.sort_order ?? 0));
      fd.append('is_active', String(dto.is_active ?? true));
      if (image) fd.append('image', image);
      res = await createBannerAction(fd);
    }
    setFormLoading(false);
    if (res.success) { onSuccess(res.message); setModal(null); onRefresh(); }
    else onError(res.message);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this banner?')) return;
    const res = await deleteBannerAction(id);
    if (res.success) { onSuccess(res.message); onRefresh(); } else onError(res.message);
  };

  const handleImageUpload = async (id: string, file: File) => {
    setUploadingId(id);
    const fd = new FormData();
    fd.append('image', file);
    const res = await uploadBannerImageAction(id, fd);
    setUploadingId(null);
    if (res.success) { onSuccess(res.message); onRefresh(); } else onError(res.message);
  };

  const handleToggle = async (banner: Banner) => {
    setTogglingId(banner.id);
    const res = await updateBannerAction(banner.id, { is_active: !banner.is_active });
    setTogglingId(null);
    if (res.success) { onRefresh(); } else onError(res.message);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}
        >
          <PlusIcon className="h-4 w-4" /> New Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <EmptyState icon={<PhotoIcon className="h-8 w-8" />} label="No banners yet" sub="Create a banner to display in the pharmacy app" />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #004d4f, #007476)' }}>
                  {['Image', 'Dates', 'Promotion', 'Carousel', 'Order', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/90 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {banners.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <ImageCell path={b.image_path} onUpload={f => handleImageUpload(b.id, f)} uploading={uploadingId === b.id} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <div className="text-gray-700">{formatDateToLocal(b.start_date)}</div>
                        {b.end_date && <div className="text-gray-400">→ {formatDateToLocal(b.end_date)}</div>}
                        {!b.end_date && <div className="text-gray-400">No expiry</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {b.promotion ? (
                        <span className="flex items-center gap-1 text-xs text-purple-700">
                          <TagIcon className="h-3 w-3" />{b.promotion.name}
                        </span>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${b.is_carousel ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {b.is_carousel ? '✓' : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{b.sort_order}</td>
                    <td className="px-4 py-3">
                      <StatusToggle active={b.is_active} onToggle={() => handleToggle(b)} loading={togglingId === b.id} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <ActionIcon icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => setModal({ mode: 'edit', banner: b })} color="blue" />
                        <ActionIcon icon={<TrashIcon className="h-4 w-4" />} label="Delete" onClick={() => handleDelete(b.id)} color="red" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile */}
          <div className="sm:hidden divide-y divide-gray-100">
            {banners.map(b => (
              <div key={b.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <ImageCell path={b.image_path} onUpload={f => handleImageUpload(b.id, f)} uploading={uploadingId === b.id} />
                  <StatusToggle active={b.is_active} onToggle={() => handleToggle(b)} loading={togglingId === b.id} />
                </div>
                <div className="text-xs text-gray-600">{formatDateToLocal(b.start_date)}{b.end_date ? ` → ${formatDateToLocal(b.end_date)}` : ' (no expiry)'}</div>
                {b.promotion && <div className="flex items-center gap-1 text-xs text-purple-700"><TagIcon className="h-3 w-3" />{b.promotion.name}</div>}
                <div className="flex justify-end gap-2">
                  <ActionIcon icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => setModal({ mode: 'edit', banner: b })} color="blue" />
                  <ActionIcon icon={<TrashIcon className="h-4 w-4" />} label="Delete" onClick={() => handleDelete(b.id)} color="red" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <Modal title={modal.mode === 'create' ? 'New Banner' : 'Edit Banner'} onClose={() => setModal(null)}>
          <BannerForm
            banner={modal.banner}
            promotions={promotions}
            loading={formLoading}
            onSubmit={handleSubmit}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}

// ══ Offers Tab ════════════════════════════════════════════════════════════════

function OffersTab({
  offers, promotions, onRefresh, onSuccess, onError,
}: {
  offers: Offer[];
  promotions: PromotionOption[];
  onRefresh: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; offer?: Offer } | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleSubmit = async (dto: CreateOfferDto, image?: File) => {
    setFormLoading(true);
    let res;
    if (modal?.offer) {
      res = await updateOfferAction(modal.offer.id, dto);
    } else {
      const fd = new FormData();
      fd.append('title_en', dto.title_en);
      fd.append('title_ar', dto.title_ar);
      if (dto.details) fd.append('details', dto.details);
      if (dto.promotion_id) fd.append('promotion_id', dto.promotion_id);
      fd.append('sort_order', String(dto.sort_order ?? 0));
      fd.append('is_active', String(dto.is_active ?? true));
      if (image) fd.append('image', image);
      res = await createOfferAction(fd);
    }
    setFormLoading(false);
    if (res.success) { onSuccess(res.message); setModal(null); onRefresh(); }
    else onError(res.message);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this offer?')) return;
    const res = await deleteOfferAction(id);
    if (res.success) { onSuccess(res.message); onRefresh(); } else onError(res.message);
  };

  const handleImageUpload = async (id: string, file: File) => {
    setUploadingId(id);
    const fd = new FormData();
    fd.append('image', file);
    const res = await uploadOfferImageAction(id, fd);
    setUploadingId(null);
    if (res.success) { onSuccess(res.message); onRefresh(); } else onError(res.message);
  };

  const handleToggle = async (offer: Offer) => {
    setTogglingId(offer.id);
    const res = await updateOfferAction(offer.id, { is_active: !offer.is_active });
    setTogglingId(null);
    if (res.success) { onRefresh(); } else onError(res.message);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}
        >
          <PlusIcon className="h-4 w-4" /> New Offer
        </button>
      </div>

      {offers.length === 0 ? (
        <EmptyState icon={<TagIcon className="h-8 w-8" />} label="No offers yet" sub="Create an offer card to show in the pharmacy app" />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #004d4f, #007476)' }}>
                  {['Image', 'Title EN', 'Title AR', 'Promotion', 'Order', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/90 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {offers.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <ImageCell path={o.image_path} onUpload={f => handleImageUpload(o.id, f)} uploading={uploadingId === o.id} />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[140px] truncate">{o.title_en}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate" dir="rtl">{o.title_ar}</td>
                    <td className="px-4 py-3">
                      {o.promotion ? (
                        <span className="flex items-center gap-1 text-xs text-purple-700">
                          <TagIcon className="h-3 w-3" />{o.promotion.name}
                        </span>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{o.sort_order}</td>
                    <td className="px-4 py-3">
                      <StatusToggle active={o.is_active} onToggle={() => handleToggle(o)} loading={togglingId === o.id} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <ActionIcon icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => setModal({ mode: 'edit', offer: o })} color="blue" />
                        <ActionIcon icon={<TrashIcon className="h-4 w-4" />} label="Delete" onClick={() => handleDelete(o.id)} color="red" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile */}
          <div className="sm:hidden divide-y divide-gray-100">
            {offers.map(o => (
              <div key={o.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <ImageCell path={o.image_path} onUpload={f => handleImageUpload(o.id, f)} uploading={uploadingId === o.id} />
                  <StatusToggle active={o.is_active} onToggle={() => handleToggle(o)} loading={togglingId === o.id} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{o.title_en}</p>
                  <p className="text-gray-500 text-xs" dir="rtl">{o.title_ar}</p>
                </div>
                {o.promotion && <div className="flex items-center gap-1 text-xs text-purple-700"><TagIcon className="h-3 w-3" />{o.promotion.name}</div>}
                <div className="flex justify-end gap-2">
                  <ActionIcon icon={<PencilIcon className="h-4 w-4" />} label="Edit" onClick={() => setModal({ mode: 'edit', offer: o })} color="blue" />
                  <ActionIcon icon={<TrashIcon className="h-4 w-4" />} label="Delete" onClick={() => handleDelete(o.id)} color="red" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <Modal title={modal.mode === 'create' ? 'New Offer' : 'Edit Offer'} onClose={() => setModal(null)}>
          <OfferForm
            offer={modal.offer}
            promotions={promotions}
            loading={formLoading}
            onSubmit={handleSubmit}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}

// ══ Featured Items Tab ════════════════════════════════════════════════════════

function FeaturedTab({
  items, onRefresh, onSuccess, onError,
}: {
  items: FeaturedItemEntry[];
  onRefresh: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editingSort, setEditingSort] = useState<{ id: string; value: string } | null>(null);

  const handleSelect = async (item: Item) => {
    setShowSearch(false);
    const res = await addFeaturedItemAction(item.id);
    if (res.success) { onSuccess(res.message); onRefresh(); }
    else onError(res.message);
  };

  const handleToggle = async (entry: FeaturedItemEntry) => {
    setTogglingId(entry.id);
    const res = await updateFeaturedItemAction(entry.id, { is_active: !entry.is_active });
    setTogglingId(null);
    if (res.success) { onRefresh(); } else onError(res.message);
  };

  const handleSortSave = async (id: string, value: string) => {
    setEditingSort(null);
    const res = await updateFeaturedItemAction(id, { sort_order: Number(value) });
    if (res.success) { onRefresh(); } else onError(res.message);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this featured item?')) return;
    const res = await deleteFeaturedItemAction(id);
    if (res.success) { onSuccess(res.message); onRefresh(); } else onError(res.message);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => setShowSearch(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}
        >
          <PlusIcon className="h-4 w-4" /> Add Featured Item
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<ArrowsUpDownIcon className="h-8 w-8" />} label="No featured items" sub="Add items to feature them in the pharmacy app home screen" />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #004d4f, #007476)' }}>
                  {['Item', 'Manufacturer', 'Group', 'Order', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/90 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{entry.item?.item_name ?? '—'}</p>
                      {entry.item?.generic_name && <p className="text-xs text-gray-400">{entry.item.generic_name}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{entry.item?.manufacturer?.manufacturer_name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{entry.item?.itemGroup?.group_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      {editingSort?.id === entry.id ? (
                        <input
                          autoFocus
                          type="number"
                          min={0}
                          value={editingSort.value}
                          onChange={e => setEditingSort({ id: entry.id, value: e.target.value })}
                          onBlur={() => handleSortSave(entry.id, editingSort.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSortSave(entry.id, editingSort.value); if (e.key === 'Escape') setEditingSort(null); }}
                          className="w-16 rounded border border-[#007476] px-2 py-1 text-xs"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingSort({ id: entry.id, value: String(entry.sort_order) })}
                          className="flex items-center gap-1 font-mono text-xs text-gray-600 hover:text-[#007476]"
                          title="Click to edit"
                        >
                          {entry.sort_order}
                          <PencilIcon className="h-2.5 w-2.5 opacity-40" />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusToggle active={entry.is_active} onToggle={() => handleToggle(entry)} loading={togglingId === entry.id} />
                    </td>
                    <td className="px-4 py-3">
                      <ActionIcon icon={<TrashIcon className="h-4 w-4" />} label="Remove" onClick={() => handleDelete(entry.id)} color="red" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile */}
          <div className="sm:hidden divide-y divide-gray-100">
            {items.map(entry => (
              <div key={entry.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{entry.item?.item_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{entry.item?.manufacturer?.manufacturer_name ?? ''}</p>
                  </div>
                  <StatusToggle active={entry.is_active} onToggle={() => handleToggle(entry)} loading={togglingId === entry.id} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Order: {entry.sort_order}</span>
                  <ActionIcon icon={<TrashIcon className="h-4 w-4" />} label="Remove" onClick={() => handleDelete(entry.id)} color="red" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSearch && <ItemSearchModal onSelect={handleSelect} onClose={() => setShowSearch(false)} />}
    </div>
  );
}

// ── Shared Small Components ───────────────────────────────────────────────────

function ActionIcon({ icon, label, onClick, color }: { icon: React.ReactNode; label: string; onClick: () => void; color: 'blue' | 'red' }) {
  const cls = color === 'blue'
    ? 'text-blue-500 hover:bg-blue-50'
    : 'text-red-500 hover:bg-red-50';
  return (
    <button onClick={onClick} title={label} className={`rounded-lg p-1.5 transition-colors ${cls}`}>
      {icon}
    </button>
  );
}

function EmptyState({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
      <div className="text-gray-300 mb-3">{icon}</div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

// ══ Main Component ════════════════════════════════════════════════════════════

type Tab = 'banners' | 'offers' | 'featured';

export default function HomeScreenPageClient() {
  const [tab, setTab] = useState<Tab>('banners');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [featuredItems, setFeaturedItems] = useState<FeaturedItemEntry[]>([]);
  const [promotions, setPromotions] = useState<PromotionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [bRes, oRes, fRes, pList] = await Promise.all([
      fetchBannersAction(),
      fetchOffersAction(),
      fetchFeaturedItemsAction(),
      fetchActivePromotionsAction(),
    ]);
    if ('error' in bRes || 'error' in oRes || 'error' in fRes) {
      setPermError('UNAUTHORIZED');
    } else {
      setBanners(bRes.banners);
      setOffers(oRes.offers);
      setFeaturedItems(fRes.featured_items);
      setPromotions(pList);
    }
    setLoading(false);
  }, []);

  const loadSection = useCallback(async () => {
    if (tab === 'banners') {
      const r = await fetchBannersAction();
      if (!('error' in r)) setBanners(r.banners);
    } else if (tab === 'offers') {
      const r = await fetchOffersAction();
      if (!('error' in r)) setOffers(r.offers);
    } else {
      const r = await fetchFeaturedItemsAction();
      if (!('error' in r)) setFeaturedItems(r.featured_items);
    }
  }, [tab]);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (permError) return <PermissionError errorType={permError as 'UNAUTHORIZED'} />;

  const tabBar = (
    <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
      <TabBtn label="Banners" count={banners.length} active={tab === 'banners'} onClick={() => setTab('banners')} />
      <TabBtn label="Offers" count={offers.length} active={tab === 'offers'} onClick={() => setTab('offers')} />
      <TabBtn label="Featured Items" count={featuredItems.length} active={tab === 'featured'} onClick={() => setTab('featured')} />
    </div>
  );

  return (
    <PageShell
      title="Home Screen"
      successMessage={successMsg}
      errorMessage={errorMsg}
      onClearSuccess={() => setSuccessMsg(null)}
      onClearError={() => setErrorMsg(null)}
      filters={tabBar}
    >
      {loading ? (
        <TableSkeleton cols={6} rows={5} />
      ) : (
        <>
          {tab === 'banners' && (
            <BannersTab
              banners={banners}
              promotions={promotions}
              onRefresh={loadSection}
              onSuccess={setSuccessMsg}
              onError={setErrorMsg}
            />
          )}
          {tab === 'offers' && (
            <OffersTab
              offers={offers}
              promotions={promotions}
              onRefresh={loadSection}
              onSuccess={setSuccessMsg}
              onError={setErrorMsg}
            />
          )}
          {tab === 'featured' && (
            <FeaturedTab
              items={featuredItems}
              onRefresh={loadSection}
              onSuccess={setSuccessMsg}
              onError={setErrorMsg}
            />
          )}
        </>
      )}
    </PageShell>
  );
}
