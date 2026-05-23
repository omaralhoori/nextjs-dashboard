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
