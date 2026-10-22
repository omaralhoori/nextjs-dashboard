export type NotificationAudience = 'general' | 'pharmacy_app' | 'all_enabled';

export interface BroadcastNotificationRequest {
  title: string;
  body: string;
  audience?: NotificationAudience;
  data?: Record<string, string>;
  /** Button on the announcement page of the app */
  link_url?: string;
  link_label?: string;
}

export interface BroadcastNotificationResponse {
  message: string;
  audience: string;
  mode?: 'topic' | 'tokens';
  topic?: string;
  targetedDevices: number | null;
  successCount: number;
  failureCount: number;
  messageId?: string;
}

export interface PriceUpdateBatchItem {
  item_id: string;
  name_ar: string | null;
  name_en: string;
  pack_label: string | null;
  currency: string;
  net: [number, number];
  retail: [number | null, number | null];
  pct: number | null;
}

export interface PriceUpdateBatch {
  id: string;
  source: string;
  items_count: number;
  up_count: number;
  down_count: number;
  pharmacies_count: number;
  users_count: number;
  created_at: string;
  items: PriceUpdateBatchItem[];
}

export interface PriceUpdatesResponse {
  pending_items: number;
  batches: PriceUpdateBatch[];
}
