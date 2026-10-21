export interface PromotionOption {
  id: string;
  name: string;
}

export interface Banner {
  id: string;
  image_path: string | null;
  start_date: string;
  end_date: string | null;
  is_carousel: boolean;
  promotion_id: string | null;
  sort_order: number;
  is_active: boolean;
  title_ar: string | null;
  subtitle_ar: string | null;
  cta_label_ar: string | null;
  cta_type: BannerCtaType;
  cta_target: string | null;
  created_at: string;
  updated_at: string;
  promotion?: PromotionOption | null;
}

export interface CreateBannerDto {
  start_date: string;
  end_date?: string | null;
  is_carousel?: boolean;
  promotion_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
  title_ar?: string;
  subtitle_ar?: string;
  cta_label_ar?: string;
  cta_type?: BannerCtaType;
  cta_target?: string;
}

export interface Offer {
  id: string;
  image_path: string | null;
  title_ar: string;
  title_en: string;
  details: string | null;
  promotion_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  promotion?: PromotionOption | null;
}

export interface CreateOfferDto {
  title_ar: string;
  title_en: string;
  details?: string;
  promotion_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface FeaturedItemEntry {
  id: string;
  item_id: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  item?: {
    id: string;
    item_name: string;
    generic_name: string | null;
    manufacturer?: { id: string; manufacturer_name: string };
    itemGroup?: { id: string; group_name: string };
  };
}

// ── Home Page v2 ─────────────────────────────────────────────────────────────

export type BannerCtaType = 'promotion' | 'section' | 'category' | 'search' | 'url' | 'none';

export type HomeSectionKey = 'top' | 'restocked' | 'featured';

export interface SectionItemRef {
  id: string;
  item_name: string;
  name_ar: string | null;
  manufacturer: { id: string; name: string } | null;
  enabled: boolean;
}

export interface HomeSectionItem {
  id: string;
  section: HomeSectionKey;
  mode: 'pin' | 'exclude';
  item_id: string;
  warehouse_id: string | null;
  warehouse: { id: string; warehouse_name: string } | null;
  sort_order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  item: SectionItemRef | null;
}

export interface SnapshotRow {
  rank: number;
  score: number;
  meta: Record<string, unknown>;
  pinned: boolean;
  excluded: boolean;
  item: SectionItemRef | null;
}

export interface SnapshotRun {
  id: string;
  trigger: 'cron' | 'manual' | 'hourly' | 'startup';
  sections: string[];
  status: 'running' | 'success' | 'failed' | 'skipped';
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  stats: Record<string, number> | null;
  error: string | null;
}

export interface HomeSectionAdmin {
  section: HomeSectionKey;
  computed_at: string | null;
  pins: HomeSectionItem[];
  excludes: HomeSectionItem[];
  snapshot: SnapshotRow[];
  last_run: SnapshotRun | null;
}

export interface CreateSectionItemDto {
  item_id: string;
  mode?: 'pin' | 'exclude';
  warehouse_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
  start_date?: string | null;
  end_date?: string | null;
  note?: string | null;
}

export interface HomeCategoryFilter {
  item_group_ids?: string[];
  manufacturer_ids?: string[];
  drug_class?: 'OTC' | 'RX' | 'Controlled';
}

export interface HomeCategory {
  id: string;
  name_ar: string;
  name_en: string | null;
  icon_key: string;
  /** Category colour (#RRGGBB) — search card stripe and badge */
  color: string | null;
  image_path: string | null;
  filter: HomeCategoryFilter;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateHomeCategoryDto {
  name_ar: string;
  name_en?: string | null;
  icon_key?: string;
  color?: string | null;
  filter?: HomeCategoryFilter;
  sort_order?: number;
  is_active?: boolean;
}

export interface AppSetting {
  key: string;
  value: number | boolean;
  type: 'int' | 'bool';
  min?: number;
  max?: number;
  description: string;
  updated_at: string | null;
}

/** Product row as the pharmacy app receives it (used by the preview). */
export interface PreviewProductRow {
  item_id: string;
  name_ar: string | null;
  name_en: string;
  manufacturer: { id: string; name: string } | null;
  pack_label: string | null;
  source: 'manual' | 'auto';
  stock_status: 'high' | 'low' | 'out';
  warehouses_count: number;
  from_price: { amount: number; currency: string | null; amount_syp: number | null } | null;
  offers: Array<{ warehouse_short_name: string; badges: Array<{ label: string }> }>;
}
