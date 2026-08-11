export interface Manufacturer {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  active: boolean;
  imageUrl?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ManufacturersResponse {
  message: string;
  manufacturers: Manufacturer[];
  total: number;
}

export interface ManufacturerStats {
  total: number;
  active: number;
  inactive: number;
}

export interface ManufacturerStatsResponse {
  message: string;
  stats: ManufacturerStats;
}

export interface CreateManufacturerRequest {
  name: string;
  code?: string;
  country?: string;
  email?: string;
  website?: string;
  description?: string;
  phone?: string;
  imageUrl?: string;
}

export interface UpdateManufacturerRequest {
  name?: string;
  code?: string;
  country?: string;
  email?: string;
  website?: string;
  description?: string;
  phone?: string;
  active?: boolean;
  imageUrl?: string;
}
