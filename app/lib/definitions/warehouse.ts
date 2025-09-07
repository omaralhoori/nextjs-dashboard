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
  createdAt: string;
  updatedAt: string;
}

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
