export interface PharmacyProfile {
  id: string;
  userId: string;
  pharmacyNameAr: string;
  pharmacyNameEn: string;
  licenseOwnerName: string;
  governorate: string;
  administrativeDivision: string;
  area: string;
  detailedAddress: string;
  landlineNumber: string | null;
  pharmacyLicenseImageUrl: string;
  idImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndependentPharmacistProfile {
  id: string;
  userId: string;
  pharmacistName: string;
  governorate: string;
  syndicateOrLicenseImageUrl: string;
  idImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisteredUser {
  id: string;
  userName: string | null;
  mobileNo: string;
  role: string;
  accountType: 'Pharmacy_Account' | 'Independent_Pharmacist';
  pharmacyId: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  profile: PharmacyProfile | IndependentPharmacistProfile | null;
}

export interface RegisteredUsersPagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface RegisteredUsersResponse {
  message: string;
  users: RegisteredUser[];
  pagination: RegisteredUsersPagination;
}

export interface ProfileImage {
  label: string;
  url: string;
}

export interface UploadedDocument {
  id: string;
  fileType: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface RegisteredUserDetails {
  message: string;
  user: RegisteredUser;
  profileImages: ProfileImage[];
  uploadedDocuments: UploadedDocument[];
}
