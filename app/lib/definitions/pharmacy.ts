// ============================================================================
// PHARMACY TYPE DEFINITIONS
// ============================================================================

export interface PharmacyFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  mimeType: string;
  uploadedAt: string;
}

export interface PharmacyFilesResponse {
  message: string;
  pharmacy: {
    id: string;
    pharmacyName: string;
    status: string;
    hasUploadedDocuments: boolean;
    documentUploadDate: string | null;
  };
  files: PharmacyFile[];
  stats: {
    totalFiles: number;
    uploadedTypes: string[];
    missingTypes: string[];
    hasAllRequiredFiles: boolean;
  };
  totalFiles: number;
}

export interface Pharmacy {
  id: string;
  pharmacy_name: string;
  district: string;
  phone: string;
  status: string;
  hasUploadedDocuments: boolean;
  documentUploadDate: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PharmaciesResponse {
  message: string;
  pharmacies: Pharmacy[];
  total: number;
}


export interface PharmacyWithUsers extends Pharmacy {
  userCount: number;
}

export interface AllPharmaciesResponse {
  message: string;
  pharmacies: PharmacyWithUsers[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
