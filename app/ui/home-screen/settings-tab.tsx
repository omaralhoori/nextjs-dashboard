'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowPathIcon, Cog6ToothIcon, ClockIcon } from '@heroicons/react/24/outline';
import { TableSkeleton } from '@/app/ui/data-table';
import {
  fetchHomeSettingsAction, updateHomeSettingsAction, fetchSnapshotRunsAction, recomputeHomeAction,
} from '@/app/lib/functions/home-sections';
import type { AppSetting, SnapshotRun } from '@/app/lib/definitions/home-screen';
import { inputCls } from './shared';
import AppInfoCard from './app-info-card';

const groupOf = (key: string) => key.split('.')[0];
const GROUP_LABEL: Record<string, string> = {
  home: 'Home page (الصفحة الرئيسية)',
  offers: 'Offers page (صفحة العروض)',
  notifications: 'Notifications (الإشعارات)',
};

const RUN_STATUS_CLS: Record<SnapshotRun['status'], string> = {
  success: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  skipped: 'bg-gray-100 text-gray-600',
  running: 'bg-amber-50 text-amber-700',
};

export default function SettingsTab({ onSuccess, onError }: { onSuccess: (m: string) => void; onError: (m: string) => void }) {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [draft, setDraft] = useState<Record<string, number | boolean>>({});
  const [runs, setRuns] = useState<SnapshotRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recomputing, setRecomputing] = useState(false);

  const load = useCallback(async () => {
    const [s, r] = await Promise.all([fetchHomeSettingsAction(), fetchSnapshotRunsAction(20)]);
    setLoading(false);
    if ('error' in s) { onError('Failed to load settings'); return; }
    setSettings(s.settings);
    setDraft(Object.fromEntries(s.settings.map(x => [x.key, x.value])));
    if (!('error' in r)) setRuns(r.runs);
  }, [onError]);

  useEffect(() => { load(); }, [load]);

  const changed = settings.filter(s => draft[s.key] !== s.value);

  const save = async () => {
    setSaving(true);
    const res = await updateHomeSettingsAction(Object.fromEntries(changed.map(s => [s.key, draft[s.key]])));
    setSaving(false);
    if (res.success) { onSuccess('Settings saved'); load(); } else onError(res.message);
  };

  const recompute = async () => {
    setRecomputing(true);
    const res = await recomputeHomeAction();
    setRecomputing(false);
    if (res.success) { onSuccess('Snapshot recomputed'); load(); } else onError(res.message);
  };

  if (loading) return <TableSkeleton cols={3} rows={6} />;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Cog6ToothIcon className="h-4 w-4 text-[#007476]" />
          <h3 className="text-sm font-semibold text-gray-800">Home page settings</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {settings.map((s, i) => (
            <div key={s.key}>
            {(i === 0 || groupOf(settings[i - 1].key) !== groupOf(s.key)) && (
              <p className="pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-[#007476]">{GROUP_LABEL[groupOf(s.key)] ?? groupOf(s.key)}</p>
            )}
            <div className="flex items-center justify-between gap-4 py-2.5">
              <div className="min-w-0">
                <p className="text-sm text-gray-800">{s.description}</p>
                <p className="font-mono text-[11px] text-gray-400">{s.key}{s.type === 'int' && ` (${s.min}–${s.max})`}</p>
              </div>
              {s.type === 'bool' ? (
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  checked={draft[s.key] === true}
                  onChange={e => setDraft(d => ({ ...d, [s.key]: e.target.checked }))}
                />
              ) : (
                <input
                  type="number"
                  min={s.min}
                  max={s.max}
                  value={String(draft[s.key] ?? '')}
                  onChange={e => setDraft(d => ({ ...d, [s.key]: Number(e.target.value) }))}
                  className={`${inputCls} w-24 text-right`}
                />
              )}
            </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={save}
            disabled={saving || changed.length === 0}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}
          >
            {saving ? 'Saving…' : `Save${changed.length ? ` (${changed.length})` : ''}`}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Window/limit changes apply on the next computation — use “Recompute now” to apply immediately.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-4 w-4 text-[#007476]" />
            <h3 className="text-sm font-semibold text-gray-800">Computation runs</h3>
          </div>
          <button onClick={recompute} disabled={recomputing} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            <ArrowPathIcon className={`h-3.5 w-3.5 ${recomputing ? 'animate-spin' : ''}`} /> Recompute now
          </button>
        </div>
        <p className="text-xs text-gray-500">Runs automatically every day at 03:00 (Damascus); “Newly available” also every hour at :15.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-gray-400">
              <tr><th className="py-1 text-left">Started</th><th className="text-left">Trigger</th><th className="text-left">Status</th><th className="text-left">Items</th><th className="text-right">ms</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {runs.map(r => (
                <tr key={r.id} title={r.error ?? ''}>
                  <td className="py-1.5 text-gray-700">{new Date(r.started_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="text-gray-500">{r.trigger}</td>
                  <td><span className={`rounded-full px-2 py-0.5 ${RUN_STATUS_CLS[r.status]}`}>{r.status}</span></td>
                  <td className="text-gray-500">{r.stats ? Object.entries(r.stats).map(([k, v]) => `${k}: ${v}`).join(' · ') : r.error ?? '—'}</td>
                  <td className="text-right text-gray-400">{r.duration_ms ?? '—'}</td>
                </tr>
              ))}
              {runs.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-400">No runs yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <AppInfoCard onSuccess={onSuccess} onError={onError} />
    </div>
  );
}
