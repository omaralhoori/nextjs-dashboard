'use client';

import { useState, useEffect, useCallback } from 'react';
import { BellAlertIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import PageShell from '@/app/ui/page-shell';
import { Button } from '@/app/ui/button';
import { broadcastNotificationAction, fetchPriceUpdatesAction, sendPriceUpdatesNowAction } from '@/app/lib/functions/notifications';
import type { NotificationAudience, PriceUpdatesResponse } from '@/app/lib/definitions/notification';

const AUDIENCE_OPTIONS: { value: NotificationAudience; label: string; hint: string }[] = [
  {
    value: 'general',
    label: 'General broadcast (recommended)',
    hint: 'Sends via FCM topic all_pharmacies — reaches all pharmacy app devices subscribed to that topic (not limited to tokens stored in the database)',
  },
  {
    value: 'pharmacy_app',
    label: 'Pharmacy users (DB tokens only)',
    hint: 'Only devices whose FCM token is saved on pharmacy user accounts in the database',
  },
  {
    value: 'all_enabled',
    label: 'All enabled users (DB tokens only)',
    hint: 'Every enabled account that has an FCM token stored in the database',
  },
];

const fmtPrice = (v: number | null, cur: string) => (v == null ? '-' : cur === 'USD' ? `$${v}` : `${v.toLocaleString('en-US')} ل.س`);

/** «تحديث الأسعار»: what the pharmacies received after catalog price changes. */
function PriceUpdatesPanel({ onMessage }: { onMessage: (ok: boolean, msg: string) => void }) {
  const [data, setData] = useState<PriceUpdatesResponse | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetchPriceUpdatesAction();
    if (!('error' in res)) setData(res);
  }, []);
  useEffect(() => { load(); }, [load]);

  const sendNow = async () => {
    setSending(true);
    const res = await sendPriceUpdatesNowAction();
    setSending(false);
    onMessage(res.success, res.message);
    load();
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Price updates (تحديث الأسعار)</h3>
          <p className="mt-1 text-xs text-gray-500">
            Sent automatically when catalog net / retail prices change (item form or Excel import), one notification per manufacturer,
            to pharmacies that bought those items. Settings: Home Screen → Settings → Notifications.
          </p>
        </div>
        <Button type="button" onClick={sendNow} disabled={sending || !data?.pending_items} className="shrink-0">
          {sending ? 'Sending…' : `Send now (${data?.pending_items ?? 0} waiting)`}
        </Button>
      </div>
      {!data ? (
        <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
      ) : data.batches.length === 0 ? (
        <p className="text-sm text-gray-500">No price updates sent yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100 text-sm">
          {data.batches.map((b) => (
            <li key={b.id} className="py-2">
              <button type="button" onClick={() => setOpen(open === b.id ? null : b.id)} className="flex w-full flex-wrap items-center justify-between gap-2 text-left">
                <span className="font-medium text-gray-900">{b.source}</span>
                <span className="text-xs text-gray-500">
                  {b.items_count} items · ↑{b.up_count} ↓{b.down_count} · {b.pharmacies_count} pharmacies / {b.users_count} users ·{' '}
                  {new Date(b.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </button>
              {open === b.id && (
                <table className="mt-2 w-full text-xs">
                  <thead className="text-gray-500"><tr><th className="text-left py-1">Item</th><th className="text-left">Net</th><th className="text-left">Retail</th><th className="text-left">%</th></tr></thead>
                  <tbody>
                    {b.items.map((i) => (
                      <tr key={i.item_id} className="border-t border-gray-50">
                        <td className="py-1">{i.name_ar || i.name_en} <span className="text-gray-400">{i.pack_label}</span></td>
                        <td>{fmtPrice(i.net[0], i.currency)} → <b>{fmtPrice(i.net[1], i.currency)}</b></td>
                        <td>{fmtPrice(i.retail[0], i.currency)} → <b>{fmtPrice(i.retail[1], i.currency)}</b></td>
                        <td className={i.pct != null && i.pct > 0 ? 'text-red-700' : 'text-emerald-700'}>{i.pct == null ? '-' : `${i.pct > 0 ? '+' : ''}${i.pct}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function NotificationsPageClient() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [audience, setAudience] = useState<NotificationAudience>('general');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    mode?: string;
    topic?: string;
    targetedDevices: number | null;
    successCount: number;
    failureCount: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setStats(null);

    if (!title.trim() || !body.trim()) {
      setErrorMsg('Title and message are required.');
      return;
    }

    if (linkUrl.trim() && !/^https?:\/\//.test(linkUrl.trim())) {
      setErrorMsg('The link must start with https://');
      return;
    }

    setLoading(true);
    const result = await broadcastNotificationAction({
      title: title.trim(),
      body: body.trim(),
      audience,
      ...(linkUrl.trim() ? { link_url: linkUrl.trim(), link_label: linkLabel.trim() || undefined } : {}),
    });
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.message);
      return;
    }

    setSuccessMsg(result.message);
    setStats({
      mode: result.result.mode,
      topic: result.result.topic,
      targetedDevices: result.result.targetedDevices,
      successCount: result.result.successCount,
      failureCount: result.result.failureCount,
    });
    setTitle('');
    setBody('');
    setLinkUrl('');
    setLinkLabel('');
  };

  return (
    <PageShell
      title="Send Notification"
      subtitle="Push a general notification to the pharmacy app via Firebase Cloud Messaging."
      successMessage={successMsg}
      errorMessage={errorMsg}
      onClearSuccess={() => setSuccessMsg(null)}
      onClearError={() => setErrorMsg(null)}
    >
      <div className="max-w-2xl space-y-4">
        {/* <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium mb-1">Important</p>
          <p>
            Mobile push notifications always go through Firebase (FCM). There is no way to reach a phone
            that never registered with Firebase. For a true &quot;general&quot; broadcast, use{' '}
            <strong>General broadcast</strong> (FCM topic). Devices are auto-subscribed when they save
            an FCM token; optionally the Flutter app can also call{' '}
            <code className="text-xs bg-amber-100 px-1 rounded">subscribeToTopic(&apos;all_pharmacies&apos;)</code>.
          </p>
        </div> */}

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5"
        >
          <div className="flex items-start gap-3 rounded-lg bg-[#007476]/5 border border-[#007476]/15 p-4">
            <BellAlertIcon className="h-6 w-6 text-[#007476] shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              Prefer <strong>General broadcast</strong> for announcements. It uses the FCM topic
              and does not depend on listing every token from the database.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
            <div className="space-y-2">
              {AUDIENCE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${
                    audience === opt.value
                      ? 'border-[#007476] bg-[#007476]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="audience"
                    value={opt.value}
                    checked={audience === opt.value}
                    onChange={() => setAudience(opt.value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-900">{opt.label}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{opt.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="e.g. إعلان هام"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              maxLength={500}
              placeholder="e.g. يتوفر تحديث جديد للتطبيق"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
              disabled={loading}
              dir="auto"
            />
            <p className="mt-1 text-xs text-gray-400">{body.length}/500</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="link_url" className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
              <input
                id="link_url"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
                disabled={loading}
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="link_label" className="block text-sm font-medium text-gray-700 mb-1">Button text</label>
              <input
                id="link_label"
                type="text"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                maxLength={40}
                placeholder="فتح الرابط"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#007476] focus:outline-none focus:ring-1 focus:ring-[#007476]"
                disabled={loading || !linkUrl}
                dir="auto"
              />
            </div>
            <p className="sm:col-span-3 text-xs text-gray-400">
              The app shows announcements under «النظام»; the full message and the link button appear on the announcement page.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading} className="min-w-[140px] justify-center">
              {loading ? 'Sending…' : 'Send Notification'}
            </Button>
          </div>
        </form>

        {stats && (
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Delivery summary</h3>
            {stats.mode === 'topic' ? (
              <p className="text-sm text-gray-700 mb-3">
                Sent via FCM topic <code className="bg-gray-100 px-1 rounded">{stats.topic}</code>.
                Firebase delivers to all devices subscribed to that topic.
              </p>
            ) : null}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-lg font-semibold text-gray-900">
                  {stats.targetedDevices == null ? 'Topic' : stats.targetedDevices}
                </div>
                <div className="text-xs text-gray-500">
                  {stats.targetedDevices == null ? 'Broadcast mode' : 'Devices targeted'}
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <div className="flex items-center justify-center gap-1 text-lg font-semibold text-emerald-700">
                  <CheckCircleIcon className="h-5 w-5" />
                  {stats.successCount}
                </div>
                <div className="text-xs text-emerald-700/80">Delivered / accepted</div>
              </div>
              <div className="rounded-lg bg-red-50 p-3">
                <div className="flex items-center justify-center gap-1 text-lg font-semibold text-red-700">
                  <ExclamationCircleIcon className="h-5 w-5" />
                  {stats.failureCount}
                </div>
                <div className="text-xs text-red-700/80">Failed</div>
              </div>
            </div>
          </div>
        )}

        <PriceUpdatesPanel onMessage={(ok, msg) => (ok ? setSuccessMsg(msg) : setErrorMsg(msg))} />
      </div>
    </PageShell>
  );
}
