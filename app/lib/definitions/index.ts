// ============================================================================
// DEFINITIONS INDEX
// ============================================================================
// This file exports all type definitions for easy importing

// Authentication types
export type { State } from './auth';

// Pharmacy types
export type {
  PharmacyFile,
  PharmacyFilesResponse,
  Pharmacy,
  PharmaciesResponse,
  PharmacyWithUsers,
  AllPharmaciesResponse,
} from './pharmacy';

// Warehouse types
export type {
  Warehouse,
  WarehousePagination,
  WarehouseFilters,
  WarehousesResponse,
  WarehouseManager,
  CreateWarehouseManagerResponse,
} from './warehouse';

// Address types
export type {
  AddressState,
  City,
  District,
  StatesResponse,
  CitiesResponse,
  DistrictsResponse,
} from './address';

// Item Group types
export type {
  ItemGroup,
  ItemGroupStats,
  ItemGroupsResponse,
  ItemGroupStatsResponse,
  CreateItemGroupRequest,
  UpdateItemGroupRequest,
} from './item-group';

// Manufacturer types
export type {
  Manufacturer,
  ManufacturersResponse,
  ManufacturerStats,
  ManufacturerStatsResponse,
  CreateManufacturerRequest,
  UpdateManufacturerRequest,
} from './manufacturer';
