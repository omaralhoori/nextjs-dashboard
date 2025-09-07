// ============================================================================
// FUNCTIONS INDEX
// ============================================================================
// This file exports all functions for easy importing

// Authentication functions
export { authenticate } from './auth';

// Pharmacy functions
export {
  approvePharmacy,
  rejectPharmacy,
  fetchPendingPharmaciesAction,
  fetchAllPharmaciesAction,
} from './pharmacy';

// Pharmacy file functions
export {
  fetchPharmacyFilesAction,
  downloadPharmacyFileAction,
} from './pharmacy-files';

// Warehouse functions
export {
  createWarehouseAction,
  fetchWarehousesAction,
  createWarehouseManagerAction,
} from './warehouse';

// Address functions
export {
  fetchStatesAction,
  fetchCitiesAction,
  fetchDistrictsAction,
} from './address';
