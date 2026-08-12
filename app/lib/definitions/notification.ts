export type NotificationAudience = 'general' | 'pharmacy_app' | 'all_enabled';

export interface BroadcastNotificationRequest {
  title: string;
  body: string;
  audience?: NotificationAudience;
  data?: Record<string, string>;
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
