'use server';

import { auth } from '@/auth';
import type {
  Banner, CreateBannerDto,
  Offer, CreateOfferDto,
  FeaturedItemEntry, PromotionOption,
} from '@/app/lib/definitions/home-screen';

type ActionResult<T = undefined> = { success: boolean; message: string; data?: T };
type FetchError = { error: string };

async function getToken(): Promise<string | null> {
  const session = await auth();
  return session?.user?.accessToken ?? null;
}

async function adminFetch(path: string, options: RequestInit = {}): Promise<Response | null> {
  const token = await getToken();
  if (!token) return null;
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
    cache: 'no-store',
  });
}

// ── Promotions (for select dropdowns) ────────────────────────────────────────

export async function fetchActivePromotionsAction(): Promise<PromotionOption[]> {
  try {
    const res = await adminFetch('/promotions/active');
    if (!res || !res.ok) return [];
    const data = await res.json();
    const list: Array<Record<string, unknown>> = Array.isArray(data)
      ? data
      : (data.data ?? data.promotions ?? []);
    return list.map(p => ({
      id: String(p.id),
      name: String(p.name ?? p.promotion_name ?? 'Unnamed'),
    }));
  } catch {
    return [];
  }
}

// ── Banners ──────────────────────────────────────────────────────────────────

export async function fetchBannersAction(): Promise<{ banners: Banner[] } | FetchError> {
  try {
    const res = await adminFetch('/admin/home-screen/banners');
    if (!res) return { error: 'UNAUTHORIZED' };
    if (res.status === 401 || res.status === 403) return { error: 'UNAUTHORIZED' };
    if (!res.ok) return { error: 'FETCH_ERROR' };
    const data = await res.json();
    return { banners: data.banners ?? [] };
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

export async function createBannerAction(formData: FormData): Promise<ActionResult<Banner>> {
  try {
    const token = await getToken();
    if (!token) return { success: false, message: 'Unauthorized' };
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/home-screen/banners`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || 'Failed to create banner' };
    return { success: true, message: 'Banner created successfully', data: data.banner };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

export async function updateBannerAction(id: string, dto: Partial<CreateBannerDto>): Promise<ActionResult<Banner>> {
  try {
    const res = await adminFetch(`/admin/home-screen/banners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res) return { success: false, message: 'Unauthorized' };
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || 'Failed to update banner' };
    return { success: true, message: 'Banner updated successfully', data: data.banner };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

export async function deleteBannerAction(id: string): Promise<ActionResult> {
  try {
    const res = await adminFetch(`/admin/home-screen/banners/${id}`, { method: 'DELETE' });
    if (!res) return { success: false, message: 'Unauthorized' };
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || 'Failed to delete' };
    return { success: true, message: data.message || 'Banner deleted' };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

export async function uploadBannerImageAction(id: string, formData: FormData): Promise<ActionResult<Banner>> {
  try {
    const token = await getToken();
    if (!token) return { success: false, message: 'Unauthorized' };
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/home-screen/banners/${id}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || 'Upload failed' };
    return { success: true, message: 'Image uploaded', data: data.banner };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

// ── Offers ───────────────────────────────────────────────────────────────────

export async function fetchOffersAction(): Promise<{ offers: Offer[] } | FetchError> {
  try {
    const res = await adminFetch('/admin/home-screen/offers');
    if (!res) return { error: 'UNAUTHORIZED' };
    if (res.status === 401 || res.status === 403) return { error: 'UNAUTHORIZED' };
    if (!res.ok) return { error: 'FETCH_ERROR' };
    const data = await res.json();
    return { offers: data.offers ?? [] };
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

export async function createOfferAction(formData: FormData): Promise<ActionResult<Offer>> {
  try {
    const token = await getToken();
    if (!token) return { success: false, message: 'Unauthorized' };
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/home-screen/offers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || 'Failed to create offer' };
    return { success: true, message: 'Offer created successfully', data: data.offer };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

export async function updateOfferAction(id: string, dto: Partial<CreateOfferDto>): Promise<ActionResult<Offer>> {
  try {
    const res = await adminFetch(`/admin/home-screen/offers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res) return { success: false, message: 'Unauthorized' };
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || 'Failed to update offer' };
    return { success: true, message: 'Offer updated successfully', data: data.offer };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

export async function deleteOfferAction(id: string): Promise<ActionResult> {
  try {
    const res = await adminFetch(`/admin/home-screen/offers/${id}`, { method: 'DELETE' });
    if (!res) return { success: false, message: 'Unauthorized' };
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || 'Failed to delete' };
    return { success: true, message: data.message || 'Offer deleted' };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

export async function uploadOfferImageAction(id: string, formData: FormData): Promise<ActionResult<Offer>> {
  try {
    const token = await getToken();
    if (!token) return { success: false, message: 'Unauthorized' };
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/home-screen/offers/${id}/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || 'Upload failed' };
    return { success: true, message: 'Image uploaded', data: data.offer };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

// ── Featured Items ────────────────────────────────────────────────────────────

export async function fetchFeaturedItemsAction(): Promise<{ featured_items: FeaturedItemEntry[] } | FetchError> {
  try {
    const res = await adminFetch('/admin/home-screen/featured-items');
    if (!res) return { error: 'UNAUTHORIZED' };
    if (res.status === 401 || res.status === 403) return { error: 'UNAUTHORIZED' };
    if (!res.ok) return { error: 'FETCH_ERROR' };
    const data = await res.json();
    return { featured_items: data.featured_items ?? [] };
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

export async function addFeaturedItemAction(item_id: string, sort_order = 0): Promise<ActionResult<FeaturedItemEntry>> {
  try {
    const res = await adminFetch('/admin/home-screen/featured-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id, sort_order }),
    });
    if (!res) return { success: false, message: 'Unauthorized' };
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || 'Failed to add item' };
    return { success: true, message: 'Item featured successfully', data: data.featured_item };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

export async function updateFeaturedItemAction(
  id: string,
  dto: { sort_order?: number; is_active?: boolean },
): Promise<ActionResult<FeaturedItemEntry>> {
  try {
    const res = await adminFetch(`/admin/home-screen/featured-items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res) return { success: false, message: 'Unauthorized' };
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || 'Failed to update' };
    return { success: true, message: 'Updated successfully', data: data.featured_item };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

export async function deleteFeaturedItemAction(id: string): Promise<ActionResult> {
  try {
    const res = await adminFetch(`/admin/home-screen/featured-items/${id}`, { method: 'DELETE' });
    if (!res) return { success: false, message: 'Unauthorized' };
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.message || 'Failed to remove' };
    return { success: true, message: data.message || 'Item removed' };
  } catch {
    return { success: false, message: 'Network error' };
  }
}
