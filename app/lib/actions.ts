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

// Address functions exported below after implementation

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
  fetchItemWithFilesAction,
  fetchItemNamesAction,
  createItemAction,
  updateItemAction,
  toggleItemEnabledAction,
  deleteItemAction,
} from '@/app/lib/functions/items';

export {
  fetchStatesAction,
  fetchStateDetailsAction,
  createStateAction,
  updateStateAction,
  deleteStateAction,
  fetchCitiesAction,
  fetchCityDetailsAction,
  createCityAction,
  updateCityAction,
  deleteCityAction,
  fetchDistrictsAction,
  fetchDistrictDetailsAction,
  createDistrictAction,
  updateDistrictAction,
  deleteDistrictAction,
} from '@/app/lib/functions/address';

export {
  // Active Ingredient functions
  fetchActiveIngredientsAction,
  searchActiveIngredientsAction,
  fetchActiveIngredientByIdAction,
  createActiveIngredientAction,
  updateActiveIngredientAction,
  deleteActiveIngredientAction,
} from '@/app/lib/functions/active-ingredients';

export {
  // Medicine Ingredient functions
  fetchItemIngredientsAction,
  fetchIngredientItemsAction,
  fetchMedicineIngredientAction,
  addIngredientToItemAction,
  updateMedicineIngredientAction,
  removeIngredientFromItemAction,
} from '@/app/lib/functions/medicine-ingredients';

export {
  // Item File functions
  uploadItemImageAction,
  deleteItemFileAction,
} from '@/app/lib/functions/item-files';

export {
  // User functions
  fetchUsersAction,
  createAdminUserAction,
  enableUserAction,
  disableUserAction,
  fetchUserProfileAction,
  updateUserProfileAction,
  changePasswordAction,
} from '@/app/lib/functions/users';