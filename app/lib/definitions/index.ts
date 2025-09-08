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

// Currency types
export type {
  Currency,
  CurrenciesResponse,
  CurrencyStats,
  CurrencyStatsResponse,
  CreateCurrencyRequest,
  UpdateCurrencyRequest,
} from './currency';

// Item types
export type {
  Item,
  ItemsResponse,
  ItemStats,
  ItemStatsResponse,
  CreateItemRequest,
  UpdateItemRequest,
  ItemSearchFilters,
} from './item';

// Active Ingredient types
export type {
  ActiveIngredient,
  ActiveIngredientsResponse,
  CreateActiveIngredientRequest,
  UpdateActiveIngredientRequest,
  ActiveIngredientResponse,
} from './active-ingredient';

// Medicine Ingredient types
export type {
  MedicineIngredient,
  MedicineIngredientsResponse,
  CreateMedicineIngredientRequest,
  UpdateMedicineIngredientRequest,
  MedicineIngredientResponse,
} from './medicine-ingredient';
