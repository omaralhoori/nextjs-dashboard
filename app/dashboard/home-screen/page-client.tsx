'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon, PencilIcon, TrashIcon, PhotoIcon,
  TagIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import {
  imgUrl, inputCls, labelCls, Modal, StatusToggle, TabBtn, ActionIcon, EmptyState,
} from '@/app/ui/home-screen/shared';
import SectionsTab from '@/app/ui/home-screen/sections-tab';
import CategoriesTab from '@/app/ui/home-screen/categories-tab';
import SettingsTab from '@/app/ui/home-screen/settings-tab';
import { TableSkeleton } from '@/app/ui/data-table';
import PermissionError from '@/app/ui/permission-error';
import {
  fetchBannersAction, createBannerAction, updateBannerAction, deleteBannerAction, uploadBannerImageAction,
  fetchOffersAction, createOfferAction, updateOfferAction, deleteOfferAction, uploadOfferImageAction,
  fetchActivePromotionsAction,
} from '@/app/lib/functions/home-screen';
import type { Banner, BannerCtaType, CreateBannerDto, Offer, CreateOfferDto, PromotionOption } from '@/app/lib/definitions/home-screen';
import { formatDateToLocal } from '@/app/lib/utils';

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
  const [titleAr, setTitleAr] = useState(banner?.title_ar ?? '');
  const [subtitleAr, setSubtitleAr] = useState(banner?.subtitle_ar ?? '');
  const [ctaLabelAr, setCtaLabelAr] = useState(banner?.cta_label_ar ?? '');
  const [ctaType, setCtaType] = useState<BannerCtaType>(banner?.cta_type ?? 'none');
  const [ctaTarget, setCtaTarget] = useState(banner?.cta_target ?? '');
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
      title_ar: titleAr,
      subtitle_ar: subtitleAr,
      cta_label_ar: ctaLabelAr,
      cta_type: ctaType,
      cta_target: ctaType === 'promotion' && !ctaTarget ? promotionId : ctaTarget,
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
      <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/60 p-3">
        <p className="text-xs font-semibold text-gray-600">Text on the banner (mobile app)</p>
        <div>
          <label className={labelCls}>Title (Arabic)</label>
          <input dir="rtl" maxLength={120} value={titleAr} onChange={e => setTitleAr(e.target.value)} placeholder="عروض خاصة للصيادلة" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Subtitle (Arabic)</label>
          <input dir="rtl" maxLength={200} value={subtitleAr} onChange={e => setSubtitleAr(e.target.value)} placeholder="أسعار مميزة على المنتجات الأكثر طلباً" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Button label (Arabic)</label>
            <input dir="rtl" maxLength={40} value={ctaLabelAr} onChange={e => setCtaLabelAr(e.target.value)} placeholder="اكتشف العروض" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Button opens</label>
            <select value={ctaType} onChange={e => setCtaType(e.target.value as BannerCtaType)} className={inputCls}>
              <option value="none">Nothing</option>
              <option value="promotion">A promotion</option>
              <option value="section">A home tab</option>
              <option value="category">A category</option>
              <option value="search">A search</option>
              <option value="url">A link (URL)</option>
            </select>
          </div>
        </div>
        {ctaType === 'section' && (
          <div>
            <label className={labelCls}>Tab</label>
            <select value={ctaTarget} onChange={e => setCtaTarget(e.target.value)} className={inputCls}>
              <option value="">— choose —</option>
              <option value="top">Most ordered</option>
              <option value="restocked">Newly available</option>
              <option value="featured">Featured offers</option>
            </select>
          </div>
        )}
        {ctaType === 'promotion' && (
          <p className="text-xs text-gray-400">Uses the linked promotion below.</p>
        )}
        {(ctaType === 'category' || ctaType === 'search' || ctaType === 'url') && (
          <div>
            <label className={labelCls}>{ctaType === 'category' ? 'Category ID' : ctaType === 'search' ? 'Search text' : 'URL'}</label>
            <input value={ctaTarget} onChange={e => setCtaTarget(e.target.value)} className={inputCls} />
          </div>
        )}
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
      if (dto.title_ar) fd.append('title_ar', dto.title_ar);
      if (dto.subtitle_ar) fd.append('subtitle_ar', dto.subtitle_ar);
      if (dto.cta_label_ar) fd.append('cta_label_ar', dto.cta_label_ar);
      fd.append('cta_type', dto.cta_type ?? 'none');
      if (dto.cta_target) fd.append('cta_target', dto.cta_target);
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
                  {['Image', 'Text', 'Dates', 'Promotion', 'Carousel', 'Order', 'Status', ''].map(h => (
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
                    <td className="px-4 py-3 max-w-[180px]" dir="rtl">
                      <p className="truncate text-xs font-medium text-gray-800">{b.title_ar || '—'}</p>
                      {b.cta_label_ar && <p className="truncate text-[11px] text-[#007476]">[{b.cta_label_ar}]</p>}
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

// ══ Main Component ════════════════════════════════════════════════════════════

type Tab = 'banners' | 'offers' | 'sections' | 'categories' | 'settings';

export default function HomeScreenPageClient() {
  const [tab, setTab] = useState<Tab>('banners');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [promotions, setPromotions] = useState<PromotionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [bRes, oRes, pList] = await Promise.all([
      fetchBannersAction(),
      fetchOffersAction(),
      fetchActivePromotionsAction(),
    ]);
    if ('error' in bRes || 'error' in oRes) {
      setPermError('UNAUTHORIZED');
    } else {
      setBanners(bRes.banners);
      setOffers(oRes.offers);
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
    }
  }, [tab]);

  useEffect(() => { loadAll(); }, [loadAll]);

  if (permError) return <PermissionError errorType={permError as 'UNAUTHORIZED'} />;

  const plainTab = (key: Tab, label: string) => (
    <button
      onClick={() => setTab(key)}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        tab === key ? 'bg-white text-[#007476] shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );

  const tabBar = (
    <div className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
      <TabBtn label="Banners" count={banners.length} active={tab === 'banners'} onClick={() => setTab('banners')} />
      <TabBtn label="Offers" count={offers.length} active={tab === 'offers'} onClick={() => setTab('offers')} />
      {plainTab('sections', 'Product Tabs')}
      {plainTab('categories', 'Categories')}
      {plainTab('settings', 'Settings & Jobs')}
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
          {tab === 'sections' && <SectionsTab onSuccess={setSuccessMsg} onError={setErrorMsg} />}
          {tab === 'categories' && <CategoriesTab onSuccess={setSuccessMsg} onError={setErrorMsg} />}
          {tab === 'settings' && <SettingsTab onSuccess={setSuccessMsg} onError={setErrorMsg} />}
        </>
      )}
    </PageShell>
  );
}
