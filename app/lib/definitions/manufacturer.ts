export interface Manufacturer {
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
  code: string;
  country: string;
  email?: string;
  website?: string;
  description?: string;
  phone?: string;
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
}
