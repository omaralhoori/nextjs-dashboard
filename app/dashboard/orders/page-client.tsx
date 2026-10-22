'use client';

import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import PageShell, { Toast } from '@/app/ui/page-shell';
import PermissionError from '@/app/ui/permission-error';
import {
  fetchAdminOrdersAction,
  fetchAdminOrderAction,
  updateAdminOrderStatusAction,
  downloadAdminOrderPdfAction,
} from '@/app/lib/functions/orders';
import { fetchWarehousesAction } from '@/app/lib/functions/warehouse';
import type { Warehouse } from '@/app/lib/definitions/warehouse';
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_LABELS,
  type AdminOrderDetail,
  type AdminOrderRow,
  type OrderStatus,
} from '@/app/lib/definitions/order';

const PAGE_SIZE = 25;

const STATUS_COLORS: Record<OrderStatus, string> = {
  Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Processing: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  Delivery: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Rejected: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  Undeliverable: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  Cancelled: 'bg-gray-50 text-gray-500 ring-1 ring-gray-200 line-through',
};

const fmtDate = (iso: string) => new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
const fmtMoney = (amount: number, currency: string) =>
  currency === 'USD' ? `$${amount.toFixed(2)}` : `${Math.round(amount).toLocaleString('en-US')} ل.س`;

function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? ''}`}>{ORDER_STATUS_LABELS[status] ?? status}</span>;
}

function OrderPanel({ orderId, onClose, onChanged }: { orderId: string; onClose: () => void; onChanged: (msg: string) => void }) {
  const [data, setData] = useState<AdminOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetchAdminOrderAction(orderId);
    if ('error' in res) setError(res.error);
    else setData(res);
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!status) return;
    if (status === 'Cancelled' && !confirm('Cancel this order? The pharmacy will be notified.')) return;
    setSaving(true);
    const res = await updateAdminOrderStatusAction(orderId, status, note.trim());
    setSaving(false);
    if (!res.success) { setError(res.message); return; }
    setStatus('');
    setNote('');
    await load();
    onChanged('Order status updated');
  };

  const downloadPdf = async () => {
    const res = await downloadAdminOrderPdfAction(orderId);
    if ('error' in res) { setError(res.error); return; }
    const a = document.createElement('a');
    a.href = `data:application/pdf;base64,${res.base64}`;
    a.download = `${data?.order.short_id ?? orderId}.pdf`;
    a.click();
  };

  const o = data?.order;
  const info = data?.pharmacy_info;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onClose}>
      <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{o ? (o.short_id ?? `#${o.serial_number}`) : 'Order'}</h2>
            {o && <p className="text-sm text-gray-500">{o.pharmacy_name} → {o.warehouse_name} · {fmtDate(o.order_datetime)}</p>}
          </div>
          <div className="flex items-center gap-2">
            {o && (
              <button onClick={downloadPdf} className="rounded-md border border-gray-300 p-2 text-gray-600 hover:bg-gray-50" title="Invoice PDF">
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} className="rounded-md p-2 text-gray-500 hover:bg-gray-100"><XMarkIcon className="h-5 w-5" /></button>
          </div>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {!o ? (
          <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
        ) : (
          <div className="space-y-6 text-sm">
            <section className="flex flex-wrap items-center gap-3">
              <StatusBadge status={o.status} />
              {o.status_note && <span className="text-gray-600">{o.status_note}</span>}
            </section>

            <section className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4">
              <div><p className="text-xs text-gray-500">Payment</p><p>{o.payment_method ? PAYMENT_LABELS[o.payment_method] ?? o.payment_method : '-'}</p></div>
              <div><p className="text-xs text-gray-500">Totals</p><p>{o.order_totals.map(t => fmtMoney(t.grand_total, t.currency_code)).join(' + ') || '-'}</p></div>
              <div><p className="text-xs text-gray-500">Pharmacy phone</p>
                <p dir="ltr" className="text-left">{[info?.account_phone, ...(info?.contacts ?? []).map(c => c.number)].filter(Boolean).join(' · ') || '-'}</p></div>
              <div><p className="text-xs text-gray-500">Warehouse phone</p><p dir="ltr" className="text-left">{data?.warehouse_phone || '-'}</p></div>
              {o.pharmacy_note && <div className="col-span-2 rounded-md bg-yellow-50 p-2"><p className="text-xs text-gray-500">Pharmacy note</p><p>{o.pharmacy_note}</p></div>}
            </section>

            <section>
              <h3 className="mb-2 font-semibold text-gray-900">Items</h3>
              <table className="w-full text-left">
                <thead className="text-xs text-gray-500"><tr><th className="py-1">Item</th><th>Qty</th><th>Gift</th><th>Unit</th><th>Amount</th></tr></thead>
                <tbody>
                  {o.order_items.map(i => (
                    <tr key={i.id} className="border-t border-gray-100">
                      <td className="py-1.5">{i.item_name}{i.promotion_name && <span className="ml-1 text-xs text-teal-700">({i.promotion_name})</span>}</td>
                      <td>{i.quantity}</td>
                      <td>{i.gift_quantity || '-'}</td>
                      <td>{fmtMoney(i.rate, i.currency_code)}</td>
                      <td>{fmtMoney(i.amount, i.currency_code)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <h3 className="mb-2 font-semibold text-gray-900">Status history</h3>
              <ol className="space-y-1.5">
                {data!.history.map((h, idx) => (
                  <li key={idx} className="flex flex-wrap gap-2">
                    <span className="w-40 text-gray-500">{fmtDate(h.at)}</span>
                    <StatusBadge status={h.status as OrderStatus} />
                    {h.changed_by && <span className="text-gray-500">by {h.changed_by}{h.role ? ` (${h.role})` : ''}</span>}
                    {h.note && <span className="text-gray-700">— {h.note}</span>}
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-lg border border-gray-200 p-4">
              <h3 className="mb-1 font-semibold text-gray-900">Change status</h3>
              <p className="mb-3 text-xs text-gray-500">
                Use this for a pharmacy&apos;s cancel / change request after the warehouse accepted the order (agree with the warehouse first).
                The pharmacy gets a notification with the note.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select className="rounded-md border border-gray-300 px-3 py-2" value={status} onChange={e => setStatus(e.target.value as OrderStatus | '')}>
                  <option value="">Select status…</option>
                  {ORDER_STATUSES.filter(s => s !== o.status).map(s => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
                </select>
                <input
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Note shown to the pharmacy (e.g. أُلغيت بطلب من الصيدلية بعد التنسيق مع المستودع)"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  maxLength={500}
                />
                <button onClick={save} disabled={!status || saving} className="rounded-md bg-[#007476] px-4 py-2 text-white disabled:opacity-40">
                  {saving ? 'Saving…' : 'Update'}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPageClient() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [counts, setCounts] = useState<Partial<Record<OrderStatus, number>>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [permError, setPermError] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [warehouseId, setWarehouseId] = useState('');
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchWarehousesAction(1, 100).then(res => { if (!('error' in res)) setWarehouses(res.warehouses); });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setQ(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchAdminOrdersAction({ status: status || undefined, warehouse_id: warehouseId || undefined, q: q || undefined, page, limit: PAGE_SIZE });
    if ('error' in res) setPermError(res.error);
    else {
      setOrders(res.orders);
      setCounts(res.counts);
      setTotal(res.total);
    }
    setLoading(false);
  }, [status, warehouseId, q, page]);

  useEffect(() => { load(); }, [load]);

  if (permError) return <PermissionError errorType={permError as 'PERMISSION_DENIED' | 'UNAUTHORIZED' | 'NETWORK_ERROR'} />;

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const allCount = Object.values(counts).reduce((s, n) => s + (n ?? 0), 0);

  return (
    <PageShell
      title="Orders"
      count={total}
      filters={
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[{ value: '' as const, label: `All (${allCount})` }, ...ORDER_STATUSES.map(s => ({ value: s, label: `${s} (${counts[s] ?? 0})` }))].map(opt => (
              <button
                key={opt.value}
                onClick={() => { setStatus(opt.value); setPage(1); }}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  status === opt.value
                    ? 'bg-[#007476] text-white border-[#007476]'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#007476] hover:text-[#007476]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Search: ORD-…, serial, pharmacy or warehouse"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={warehouseId} onChange={e => { setWarehouseId(e.target.value); setPage(1); }}>
              <option value="">All warehouses</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.warehouse_name}</option>)}
            </select>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">No orders</p>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr><th className="px-3 py-2">Order</th><th className="px-3 py-2">Date</th><th className="px-3 py-2">Pharmacy</th><th className="px-3 py-2">Warehouse</th><th className="px-3 py-2">Items</th><th className="px-3 py-2">Total</th><th className="px-3 py-2">Status</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} onClick={() => setOpenId(o.id)} className="cursor-pointer border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{o.ref}</td>
                    <td className="px-3 py-2 text-gray-600">{fmtDate(o.order_datetime)}</td>
                    <td className="px-3 py-2">{o.pharmacy.name}</td>
                    <td className="px-3 py-2">{o.warehouse.name}</td>
                    <td className="px-3 py-2">{o.items_count}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{o.totals.map(t => fmtMoney(t.amount, t.currency)).join(' + ')}</td>
                    <td className="px-3 py-2"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50">Previous</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {openId && <OrderPanel orderId={openId} onClose={() => setOpenId(null)} onChanged={msg => { setToast(msg); load(); }} />}
      {toast && <Toast message={toast} type="success" onDismiss={() => setToast(null)} />}
    </PageShell>
  );
}
