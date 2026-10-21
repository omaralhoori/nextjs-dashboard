'use client';

import { useEffect, useState } from 'react';
import { BellAlertIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { fetchAppInfoAction, runOffersDigestAction, updateAppInfoAction } from '@/app/lib/functions/pharmacy-requests';
import type { AppInfo } from '@/app/lib/definitions/pharmacy-requests';
import { inputCls, labelCls } from './shared';

const FIELDS: Array<{ key: keyof AppInfo; label: string; placeholder?: string; dir?: 'rtl' }> = [
  { key: 'latest_version', label: 'Latest version', placeholder: '3.2.0' },
  { key: 'min_version', label: 'Minimum version (older must update)', placeholder: '3.0.0' },
  { key: 'store_url_android', label: 'Google Play link' },
  { key: 'store_url_ios', label: 'App Store link' },
  { key: 'terms_url', label: 'Terms & conditions URL' },
  { key: 'privacy_url', label: 'Privacy policy URL' },
  { key: 'support_phone', label: 'Support phone', placeholder: '0933 000 000' },
  { key: 'support_whatsapp', label: 'Support WhatsApp (with country code)', placeholder: '963933000000' },
];

/** «حول التطبيق» + support of the app's More page, and the "new offers" notification. */
export default function AppInfoCard({ onSuccess, onError }: { onSuccess: (m: string) => void; onError: (m: string) => void }) {
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [pharmacyId, setPharmacyId] = useState('');

  useEffect(() => {
    fetchAppInfoAction().then(res => {
      if ('error' in res) onError('Failed to load app info');
      else setInfo(res.app_info);
    });
  }, [onError]);

  const save = async () => {
    if (!info) return;
    setSaving(true);
    const res = await updateAppInfoAction(info);
    setSaving(false);
    if (res.success && res.data) { setInfo(res.data); onSuccess('App info saved'); } else onError(res.message);
  };

  const runDigest = async () => {
    if (!pharmacyId.trim() && !window.confirm('Send the "new offers" notification to all pharmacies now?')) return;
    setRunning(true);
    const res = await runOffersDigestAction(pharmacyId.trim() || undefined);
    setRunning(false);
    if (res.success && res.data) onSuccess(`Digest sent: ${res.data.offers} offers · ${res.data.pharmacies} pharmacies · ${res.data.notified_users} users`);
    else onError(res.message);
  };

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <DevicePhoneMobileIcon className="h-4 w-4 text-[#007476]" />
          <h3 className="text-sm font-semibold text-gray-800">App info (حول التطبيق والدعم)</h3>
        </div>
        <p className="text-xs text-gray-500">
          Shown on the app&apos;s «المزيد» page. Versions below the minimum are asked to update; below the latest see «تحديث متوفر».
        </p>
        {!info ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FIELDS.map(f => (
                <div key={f.key}>
                  <label className={labelCls}>{f.label}</label>
                  <input
                    value={(info[f.key] as string | null) ?? ''}
                    placeholder={f.placeholder}
                    onChange={e => setInfo(i => (i ? { ...i, [f.key]: e.target.value } : i))}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className={labelCls}>About text</label>
              <textarea
                dir="rtl"
                rows={2}
                value={info.about_text ?? ''}
                onChange={e => setInfo(i => (i ? { ...i, about_text: e.target.value } : i))}
                className={inputCls}
              />
            </div>
            <div className="flex justify-end">
              <button onClick={save} disabled={saving} className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}>
                {saving ? 'Saving…' : 'Save app info'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <BellAlertIcon className="h-4 w-4 text-[#007476]" />
          <h3 className="text-sm font-semibold text-gray-800">«New offers» notification</h3>
        </div>
        <p className="text-xs text-gray-500">
          Sent once a day (hour set above in “notifications”) to pharmacies that ordered from the warehouse recently, for offers
          created or started in the last 7 days. Each offer is sent to a pharmacy only once, and only to users who turned on
          «العروض الجديدة» in the app settings.
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[240px]">
            <label className={labelCls}>Pharmacy ID (optional — leave empty for all)</label>
            <input value={pharmacyId} onChange={e => setPharmacyId(e.target.value)} className={inputCls} placeholder="uuid" />
          </div>
          <button onClick={runDigest} disabled={running} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            {running ? 'Sending…' : 'Send now'}
          </button>
        </div>
      </div>
    </>
  );
}
