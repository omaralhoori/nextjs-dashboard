export type OrderStatus = 'Pending' | 'Processing' | 'Delivery' | 'Completed' | 'Rejected' | 'Undeliverable' | 'Cancelled';

export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Delivery', 'Completed', 'Rejected', 'Undeliverable', 'Cancelled'];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Pending · أُرسلت',
  Processing: 'Processing · قيد التنفيذ',
  Delivery: 'Delivery · قيد التسليم',
  Completed: 'Completed · مكتمل',
  Rejected: 'Rejected · مرفوض',
  Undeliverable: 'Undeliverable · تعذر التسليم',
  Cancelled: 'Cancelled · ملغاة',
};

export const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: 'الدفع عند الاستلام',
  bank_transfer: 'تحويل بنكي',
  account_credit: 'رصيد الحساب (آجل)',
};

export interface AdminOrderRow {
  id: string;
  ref: string;
  serial_number: number;
  status: OrderStatus;
  status_note: string | null;
  order_datetime: string;
  updated_at: string;
  payment_method: string | null;
  pharmacy: { id: string; name: string };
  warehouse: { id: string; name: string };
  items_count: number;
  totals: Array<{ currency: string; amount: number }>;
}

export interface AdminOrdersResponse {
  counts: Partial<Record<OrderStatus, number>>;
  page: number;
  limit: number;
  total: number;
  orders: AdminOrderRow[];
}

export interface AdminOrderDetail {
  order: {
    id: string;
    short_id: string | null;
    serial_number: number;
    status: OrderStatus;
    status_note: string | null;
    pharmacy_name: string;
    warehouse_name: string;
    order_datetime: string;
    payment_method: string | null;
    pharmacy_note: string | null;
    order_items: Array<{
      id: string;
      item_name: string;
      promotion_name: string;
      quantity: number;
      gift_quantity: number;
      currency_code: string;
      rate: number;
      amount: number;
    }>;
    order_totals: Array<{ currency_code: string; grand_total: number }>;
  };
  history: Array<{ status: string; at: string; note: string | null; changed_by: string | null; role: string | null }>;
  pharmacy_info: {
    account_phone: string | null;
    contacts: Array<{ type: string; number: string; label: string | null }>;
    address: { city: string | null; street: string | null; detail: string | null; phone: string | null; map_url: string | null } | null;
  } | null;
  warehouse_phone: string | null;
}
