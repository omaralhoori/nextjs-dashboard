'use client';

import { useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  KeyIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  resolvePasswordResetRequestAction,
  rejectPasswordResetRequestAction,
} from '@/app/lib/functions/password-reset';
import { adminChangeUserPasswordAction } from '@/app/lib/functions/users';
import type { PasswordResetRequest } from '@/app/lib/definitions/password-reset';

interface PasswordResetTableProps {
  requests: PasswordResetRequest[];
  onRefresh: () => void;
}

interface ResolveModalState {
  request: PasswordResetRequest;
  newPassword: string;
  adminNotes: string;
  loading: boolean;
  error: string | null;
  copiedPassword: boolean;
}

function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function StatusBadge({ status }: { status: PasswordResetRequest['status'] }) {
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <ClockIcon className="h-3 w-3" /> Pending
      </span>
    );
  }
  if (status === 'resolved') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="h-3 w-3" /> Resolved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      <XCircleIcon className="h-3 w-3" /> Rejected
    </span>
  );
}

export default function PasswordResetTable({ requests, onRefresh }: PasswordResetTableProps) {
  const [resolveModal, setResolveModal] = useState<ResolveModalState | null>(null);
  const [rejectModal, setRejectModal] = useState<{ request: PasswordResetRequest; notes: string; loading: boolean; error: string | null } | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const openResolveModal = (req: PasswordResetRequest) => {
    setResolveModal({
      request: req,
      newPassword: generatePassword(),
      adminNotes: '',
      loading: false,
      error: null,
      copiedPassword: false,
    });
  };

  const openRejectModal = (req: PasswordResetRequest) => {
    setRejectModal({ request: req, notes: '', loading: false, error: null });
  };

  const handleCopyPassword = async () => {
    if (!resolveModal) return;
    await navigator.clipboard.writeText(resolveModal.newPassword);
    setResolveModal(prev => prev ? { ...prev, copiedPassword: true } : null);
    setTimeout(() => setResolveModal(prev => prev ? { ...prev, copiedPassword: false } : null), 2000);
  };

  const handleResolve = async () => {
    if (!resolveModal) return;
    if (!resolveModal.newPassword || resolveModal.newPassword.length < 6) {
      setResolveModal(prev => prev ? { ...prev, error: 'Password must be at least 6 characters' } : null);
      return;
    }
    setResolveModal(prev => prev ? { ...prev, loading: true, error: null } : null);

    const pwResult = await adminChangeUserPasswordAction(resolveModal.request.userId, resolveModal.newPassword);
    if (!pwResult.success) {
      setResolveModal(prev => prev ? { ...prev, loading: false, error: pwResult.message } : null);
      return;
    }

    const result = await resolvePasswordResetRequestAction(resolveModal.request.id, resolveModal.adminNotes || undefined);
    if (result.success) {
      setResolveModal(null);
      setActionMsg({ type: 'success', text: 'Password changed and request resolved successfully' });
      onRefresh();
    } else {
      setResolveModal(prev => prev ? { ...prev, loading: false, error: result.message } : null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setRejectModal(prev => prev ? { ...prev, loading: true, error: null } : null);
    const result = await rejectPasswordResetRequestAction(rejectModal.request.id, rejectModal.notes || undefined);
    if (result.success) {
      setRejectModal(null);
      setActionMsg({ type: 'success', text: 'Request rejected successfully' });
      onRefresh();
    } else {
      setRejectModal(prev => prev ? { ...prev, loading: false, error: result.message } : null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      {/* Action message */}
      {actionMsg && (
        <div className={`mb-4 p-3 rounded-md flex items-center gap-2 text-sm ${actionMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {actionMsg.type === 'success' ? <CheckCircleIcon className="h-4 w-4 flex-shrink-0" /> : <XCircleIcon className="h-4 w-4 flex-shrink-0" />}
          {actionMsg.text}
          <button onClick={() => setActionMsg(null)} className="ml-auto text-current opacity-60 hover:opacity-100">
            <XCircleIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <KeyIcon className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No password reset requests</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{req.user?.userName || '—'}</div>
                          <div className="text-xs text-gray-400 capitalize">{req.user?.role?.replace(/_/g, ' ') || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-700">
                        <PhoneIcon className="h-3.5 w-3.5 text-gray-400" />
                        {req.mobileNo}
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(req.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate">{req.adminNotes || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openResolveModal(req)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#007476] rounded-md hover:bg-[#005a5c] transition-colors"
                          >
                            <KeyIcon className="h-3.5 w-3.5" /> Reset Password
                          </button>
                          <button
                            onClick={() => openRejectModal(req)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                          >
                            <XCircleIcon className="h-3.5 w-3.5" /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {requests.map(req => (
              <div key={req.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{req.user?.userName || '—'}</div>
                      <div className="text-xs text-gray-400">{req.mobileNo}</div>
                    </div>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <div className="text-xs text-gray-400">{formatDate(req.createdAt)}</div>
                {req.adminNotes && <div className="text-xs text-gray-500 italic">{req.adminNotes}</div>}
                {req.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => openResolveModal(req)} className="flex-1 py-2 text-xs font-medium text-white bg-[#007476] rounded-md hover:bg-[#005a5c]">
                      Reset Password
                    </button>
                    <button onClick={() => openRejectModal(req)} className="flex-1 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Resolve Modal ── */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <KeyIcon className="h-5 w-5 text-[#007476]" /> Reset Password
              </h3>
              <button onClick={() => setResolveModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-md p-3 text-sm">
                <span className="text-gray-500">User: </span>
                <span className="font-medium text-gray-900">{resolveModal.request.user?.userName}</span>
                <span className="ml-3 text-gray-500">({resolveModal.request.mobileNo})</span>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={resolveModal.newPassword}
                    onChange={e => setResolveModal(prev => prev ? { ...prev, newPassword: e.target.value } : null)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#007476]"
                    placeholder="New password"
                  />
                  <button
                    type="button"
                    onClick={() => setResolveModal(prev => prev ? { ...prev, newPassword: generatePassword() } : null)}
                    className="px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    title="Generate new password"
                  >
                    Generate
                  </button>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                      resolveModal.copiedPassword
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {resolveModal.copiedPassword ? (
                      <><CheckIcon className="h-3.5 w-3.5" /> Copied!</>
                    ) : (
                      <><ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy Password</>
                    )}
                  </button>
                  <p className="text-xs text-amber-600 self-center">Copy the password before saving — you won&apos;t see it again.</p>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes (optional)</label>
                <textarea
                  value={resolveModal.adminNotes}
                  onChange={e => setResolveModal(prev => prev ? { ...prev, adminNotes: e.target.value } : null)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#007476]"
                  placeholder="e.g. Password reset and sent via WhatsApp"
                />
              </div>

              {resolveModal.error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{resolveModal.error}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button
                onClick={() => setResolveModal(null)}
                disabled={resolveModal.loading}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={resolveModal.loading}
                className="px-4 py-2 text-sm font-medium text-white bg-[#007476] rounded-md hover:bg-[#005a5c] disabled:opacity-50 flex items-center gap-2"
              >
                {resolveModal.loading && <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />}
                {resolveModal.loading ? 'Saving...' : 'Change Password & Resolve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Reject Request</h3>
              <button onClick={() => setRejectModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-md p-3 text-sm">
                <span className="text-gray-500">User: </span>
                <span className="font-medium text-gray-900">{rejectModal.request.user?.userName}</span>
                <span className="ml-3 text-gray-500">({rejectModal.request.mobileNo})</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea
                  value={rejectModal.notes}
                  onChange={e => setRejectModal(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  placeholder="e.g. Invalid request, user already has access"
                />
              </div>
              {rejectModal.error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{rejectModal.error}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button onClick={() => setRejectModal(null)} disabled={rejectModal.loading} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejectModal.loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {rejectModal.loading && <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />}
                {rejectModal.loading ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
