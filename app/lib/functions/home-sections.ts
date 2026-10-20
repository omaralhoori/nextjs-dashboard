'use server';
import { getServerApiUrl } from '@/app/lib/server-api-url';

import { auth } from '@/auth';
import type {
  AppSetting,
  CreateHomeCategoryDto,
  CreateSectionItemDto,
  HomeCategory,
  HomeSectionAdmin,
  HomeSectionItem,
  HomeSectionKey,
  PreviewProductRow,
  SnapshotRun,
} from '@/app/lib/definitions/home-screen';

type ActionResult<T = undefined> = { success: boolean; message: string; data?: T };
type FetchError = { error: string };

async function adminFetch(path: string, options: RequestInit = {}): Promise<Response | null> {
  const session = await auth();
  const token = session?.user?.accessToken;
  if (!token) return null;
  return fetch(`${getServerApiUrl()}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
    cache: 'no-store',
  });
}

async function read<T>(path: string, pick: (data: any) => T): Promise<T | FetchError> {
  try {
    const res = await adminFetch(path);
    if (!res || res.status === 401 || res.status === 403) return { error: 'UNAUTHORIZED' };
    if (!res.ok) return { error: 'FETCH_ERROR' };
    return pick(await res.json());
  } catch {
    return { error: 'NETWORK_ERROR' };
  }
}

async function write<T>(path: string, method: string, body: unknown, pick: (data: any) => T | undefined, fallback: string): Promise<ActionResult<T>> {
  try {
    const res = await adminFetch(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
    if (!res) return { success: false, message: 'Unauthorized' };
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      return { success: false, message: msg || fallback };
    }
    return { success: true, message: data.message || 'Done', data: pick(data) };
  } catch {
    return { success: false, message: 'Network error' };
  }
}

// ── Settings ─────────────────────────────────────────────────────────────────

export async function fetchHomeSettingsAction(): Promise<{ settings: AppSetting[] } | FetchError> {
  return read('/admin/home/settings', (d) => ({ settings: d.settings ?? [] }));
}

export async function updateHomeSettingsAction(values: Record<string, number | boolean>): Promise<ActionResult<AppSetting[]>> {
  return write('/admin/home/settings', 'PATCH', values, (d) => d.settings, 'Failed to update settings');
}

// ── Sections ─────────────────────────────────────────────────────────────────

export async function fetchHomeSectionAction(section: HomeSectionKey): Promise<HomeSectionAdmin | FetchError> {
  return read(`/admin/home/sections/${section}`, (d) => ({
    section: d.section,
    computed_at: d.computed_at ?? null,
    pins: d.pins ?? [],
    excludes: d.excludes ?? [],
    snapshot: d.snapshot ?? [],
    last_run: d.last_run ?? null,
  }));
}

export async function addSectionItemAction(section: HomeSectionKey, dto: CreateSectionItemDto): Promise<ActionResult<HomeSectionItem>> {
  return write(`/admin/home/sections/${section}/items`, 'POST', dto, (d) => d.section_item, 'Failed to add item');
}

export async function updateSectionItemAction(id: string, dto: Partial<Omit<CreateSectionItemDto, 'item_id'>>): Promise<ActionResult<HomeSectionItem>> {
  return write(`/admin/home/section-items/${id}`, 'PATCH', dto, (d) => d.section_item, 'Failed to update item');
}

export async function deleteSectionItemAction(id: string): Promise<ActionResult> {
  return write(`/admin/home/section-items/${id}`, 'DELETE', undefined, () => undefined, 'Failed to remove item');
}

export async function reorderSectionAction(section: HomeSectionKey, ids: string[]): Promise<ActionResult> {
  return write(`/admin/home/sections/${section}/order`, 'PUT', { ids }, () => undefined, 'Failed to reorder');
}

// ── Snapshot jobs ────────────────────────────────────────────────────────────

export async function recomputeHomeAction(sections?: Array<'top' | 'restocked'>): Promise<ActionResult<SnapshotRun>> {
  return write('/admin/home/recompute', 'POST', sections ? { sections } : {}, (d) => d.run, 'Recompute failed');
}

export async function fetchSnapshotRunsAction(limit = 20): Promise<{ runs: SnapshotRun[] } | FetchError> {
  return read(`/admin/home/runs?limit=${limit}`, (d) => ({ runs: d.runs ?? [] }));
}

export async function fetchHomePreviewAction(
  pharmacyId: string,
  tab: HomeSectionKey,
): Promise<{ items: PreviewProductRow[]; usd_rate: number | null; computed_at: string | null } | FetchError> {
  return read(`/admin/home/preview?pharmacy_id=${encodeURIComponent(pharmacyId)}&tab=${tab}`, (d) => ({
    items: d.section?.items ?? [],
    usd_rate: d.pricing?.usd_rate ?? null,
    computed_at: d.section?.computed_at ?? null,
  }));
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function fetchHomeCategoriesAction(): Promise<{ categories: HomeCategory[] } | FetchError> {
  return read('/admin/home/categories', (d) => ({ categories: d.categories ?? [] }));
}

export async function createHomeCategoryAction(dto: CreateHomeCategoryDto): Promise<ActionResult<HomeCategory>> {
  return write('/admin/home/categories', 'POST', dto, (d) => d.category, 'Failed to create category');
}

export async function updateHomeCategoryAction(id: string, dto: Partial<CreateHomeCategoryDto>): Promise<ActionResult<HomeCategory>> {
  return write(`/admin/home/categories/${id}`, 'PATCH', dto, (d) => d.category, 'Failed to update category');
}

export async function deleteHomeCategoryAction(id: string): Promise<ActionResult> {
  return write(`/admin/home/categories/${id}`, 'DELETE', undefined, () => undefined, 'Failed to delete category');
}

export async function reorderHomeCategoriesAction(ids: string[]): Promise<ActionResult> {
  return write('/admin/home/categories/order', 'PUT', { ids }, () => undefined, 'Failed to reorder');
}
