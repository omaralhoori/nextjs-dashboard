export interface Item {
  id: string;
  manufacturer_id: string;
  item_group: string;
  warehouse?: string | null;
  item_name: string;
  generic_name?: string | null;
  barcode: string;
  barcode2?: string | null;
  buying_price: number;
  selling_price: number;
  currency: string;
  form: string; // legacy single form
  forms?: Array<{ id: string } | string>; // new multi-forms support
  quantity: number;
  volume?: string | null;
  usage?: string | null;
  importer?: string | null;
  drug_class: 'OTC' | 'RX' | 'Controlled';
  drug_class_description?: string | null;
  needs_stamp?: boolean; // whether the item requires a stamp
  enabled: boolean;
  created_at: string;
  updated_at: string;
  // Related entities
  manufacturer?: {
    id: string;
    name: string;
    code: string;
    description?: string | null;
    country: string;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
  };
  itemGroup?: {
    id: string;
    name: string;
    description?: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
  };
  warehouseEntity?: {
    id: string;
    warehouse_name: string;
    district: string;
    phone: string;
    location: string;
    status: string;
    adminNotes?: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  currencyEntity?: {
    id: string;
    code: string;
    name: string;
    symbol: string;
    exchange_rate?: number | null;
    active: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface ItemsResponse {
  message: string;
  items: Item[];
  total: number;
}

export interface ItemStats {
  total: number;
  enabled: number;
  disabled: number;
  by_drug_class: {
    OTC: number;
    RX: number;
    Controlled: number;
  };
  by_manufacturer: Array<{
    manufacturer_id: string;
    manufacturer_name: string;
    count: number;
  }>;
}

export interface ItemStatsResponse {
  message: string;
  stats: ItemStats;
}

export interface CreateItemRequest {
  manufacturer_id: string;
  item_group: string;
  item_name: string;
  generic_name?: string;
  barcode: string;
  barcode2?: string;
  buying_price: number;
  selling_price: number;
  currency: string;
  form?: string; // optional when using forms[]
  forms?: string[];
  quantity?: number;
  volume?: string;
  usage?: string;
  importer?: string;
  drug_class: 'OTC' | 'RX' | 'Controlled';
  drug_class_description?: string;
  warehouse?: string;
  needs_stamp?: boolean;
}

export interface UpdateItemRequest {
  manufacturer_id?: string;
  item_group?: string;
  item_name?: string;
  generic_name?: string;
  barcode?: string;
  barcode2?: string;
  buying_price?: number;
  selling_price?: number;
  currency?: string;
  form?: string;
  forms?: string[];
  quantity?: number;
  volume?: string;
  usage?: string;
  importer?: string;
  drug_class?: 'OTC' | 'RX' | 'Controlled';
  drug_class_description?: string;
  warehouse?: string;
  needs_stamp?: boolean;
  enabled?: boolean;
}

export interface ItemSearchFilters {
  manufacturer_id?: string;
  item_group?: string;
  warehouse?: string;
  drug_class?: 'OTC' | 'RX' | 'Controlled';
  enabled?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}
