// ============================================================================
// ACTIONS INDEX
// ============================================================================
// This file re-exports all functions for backward compatibility

// Re-export all functions from their respective files
export {
  // Authentication functions
  authenticate,
} from '@/app/lib/functions/auth';

export {
  // Pharmacy functions
  approvePharmacy,
  rejectPharmacy,
  fetchPendingPharmaciesAction,
  fetchAllPharmaciesAction,
} from '@/app/lib/functions/pharmacy';

export {
  // Pharmacy file functions
  fetchPharmacyFilesAction,
  downloadPharmacyFileAction,
} from '@/app/lib/functions/pharmacy-files';

export {
  // Warehouse functions
  createWarehouseAction,
  fetchWarehousesAction,
  createWarehouseManagerAction,
  fetchWarehouseDetailsAction,
} from '@/app/lib/functions/warehouse';

export {
  // Warehouse district functions
  fetchWarehouseDistrictsAction,
  addDistrictToWarehouseAction,
  removeDistrictFromWarehouseAction,
  updateDistrictStatusAction,
} from '@/app/lib/functions/warehouse-districts';

export {
  // Address functions
  fetchStatesAction,
  fetchCitiesAction,
  fetchDistrictsAction,
} from '@/app/lib/functions/address';

export {
  // Item Group functions
  fetchItemGroupsAction,
  fetchActiveItemGroupsAction,
  fetchItemGroupStatsAction,
  fetchItemGroupByIdAction,
  createItemGroupAction,
  updateItemGroupAction,
  toggleItemGroupActiveAction,
  deleteItemGroupAction,
} from '@/app/lib/functions/item-groups';

export {
  // Manufacturer functions
  fetchManufacturersAction,
  fetchActiveManufacturersAction,
  fetchManufacturerStatsAction,
  fetchManufacturerByIdAction,
  createManufacturerAction,
  updateManufacturerAction,
  toggleManufacturerActiveAction,
  deleteManufacturerAction,
} from '@/app/lib/functions/manufacturers';

export {
  // Currency functions
  fetchCurrenciesAction,
  fetchActiveCurrenciesAction,
  fetchDefaultCurrencyAction,
  fetchCurrencyStatsAction,
  fetchCurrencyByCodeAction,
  fetchCurrencyByIdAction,
  createCurrencyAction,
  updateCurrencyAction,
  setDefaultCurrencyAction,
  toggleCurrencyActiveAction,
  deleteCurrencyAction,
} from '@/app/lib/functions/currencies';

export {
  // Item functions
  fetchItemsAction,
  fetchEnabledItemsAction,
  searchItemsAction,
  fetchItemStatsAction,
  fetchItemByBarcodeAction,
  fetchItemByIdAction,
  createItemAction,
  updateItemAction,
  toggleItemEnabledAction,
  deleteItemAction,
} from '@/app/lib/functions/items';