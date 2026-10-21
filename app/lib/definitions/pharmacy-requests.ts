// ============================================================================
// PHARMACY CHANGE REQUESTS (More page of the app) & APP INFO
// ============================================================================

export type PharmacyRequestKind = 'profile' | 'address' | 'document';
export type PharmacyRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface PharmacyChangeRequest {
  id: string;
  kind: PharmacyRequestKind;
  kind_label: string;
  doc_key: 'license' | 'union' | null;
  status: PharmacyRequestStatus;
  pharmacy: { id: string; name: string; phone: string };
  requested_by: { id: string | null; name: string | null; mobile: string | null };
  /** profile: { name, owner } · address: { city, street, detail, phone, lat, lng } · document: { image_url } */
  payload: Record<string, any>;
  previous: Record<string, any> | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface PharmacyRequestsResponse {
  pending_count: number;
  requests: PharmacyChangeRequest[];
}

export interface AppInfo {
  latest_version: string;
  min_version: string;
  store_url_android: string | null;
  store_url_ios: string | null;
  terms_url: string | null;
  privacy_url: string | null;
  support_phone: string | null;
  support_whatsapp: string | null;
  about_text: string | null;
}
