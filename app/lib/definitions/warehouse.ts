// ============================================================================
// WAREHOUSE TYPE DEFINITIONS
// ============================================================================

export interface Warehouse {
  id: string;
  warehouse_name: string;
  district: string;
  phone: string;
  location: string;
  status: string;
  adminNotes: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  // Suppliers page profile
  warehouse_type?: WarehouseType;
  agent_of?: Array<{ id: string; name: string; imageUrl?: string | null }>;
  work_days?: string | null;
  work_hours?: string | null;
  eta_label?: string | null;
  min_order_amount?: number | null;
  usd_rate?: number | null;
  default_order_mode?: OrderMode;
}

export type WarehouseType = 'distributor' | 'agent';
/** split = two orders (SYP and $) · syp = one order in SYP */
export type OrderMode = 'split' | 'syp';

export interface WarehousePagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  returned: number;
}

export interface WarehouseFilters {
  status: string;
  search: string;
  district: string;
}

export interface WarehousesResponse {
  message: string;
  warehouses: Warehouse[];
  pagination: WarehousePagination;
  filters: WarehouseFilters;
}

export interface WarehouseManager {
  id: string;
  userName: string;
  mobileNo: string;
  role: string;
  warehouseId: string;
  enabled: boolean;
}

export interface CreateWarehouseManagerResponse {
  message: string;
  user: WarehouseManager;
}

export interface WarehouseUser {
  id: string;
  userName: string;
  mobileNo: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseDetailsResponse {
  message: string;
  warehouse: Warehouse;
  users: WarehouseUser[];
  userCount: number;
}

export interface WarehouseDistrict {
  district_id: string;
  district_name: string;
  active: boolean;
}

export interface WarehouseDistrictsResponse {
  message: string;
  warehouseId: string;
  districts: WarehouseDistrict[];
  totalDistricts: number;
  activeDistricts: number;
}

export interface AddDistrictToWarehouseRequest {
  districtId: string;
}

export interface UpdateWarehouseRequest {
  warehouse_name?: string;
  district?: string;
  phone?: string;
  location?: string;
  adminNotes?: string | null;
  imageUrl?: string | null;
  status?: 'enabled' | 'disabled';
  warehouse_type?: WarehouseType;
  agent_manufacturer_ids?: string[];
  work_days?: string | null;
  work_hours?: string | null;
  eta_label?: string | null;
  min_order_amount?: number | null;
  usd_rate?: number | null;
  default_order_mode?: OrderMode;
}
