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
  // Address functions
  fetchStatesAction,
  fetchCitiesAction,
  fetchDistrictsAction,
} from '@/app/lib/functions/address';