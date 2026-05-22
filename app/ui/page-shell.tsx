'use client';

import { ReactNode, useEffect, useState } from 'react';
import { PlusIcon, CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

// ── Toast ────────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

export function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-start gap-3 rounded-xl px-4 py-3 shadow-xl max-w-sm text-sm
        ${type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}
    >
      {type === 'success'
        ? <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
        : <ExclamationCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      }
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="ml-1 opacity-60 hover:opacity-100">
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── PageShell ─────────────────────────────────────────────────────────────────

interface PageShellProps {
  title: string;
  subtitle?: string;
  count?: number;
  createLabel?: string;
  onCreate?: () => void;
  successMessage?: string | null;
  errorMessage?: string | null;
  onClearSuccess?: () => void;
  onClearError?: () => void;
  filters?: ReactNode;
  children: ReactNode;
}

export default function PageShell({
  title,
  subtitle,
  count,
  createLabel,
  onCreate,
  successMessage,
  errorMessage,
  onClearSuccess,
  onClearError,
  filters,
  children,
}: PageShellProps) {
  return (
    <div className="space-y-4 mt-4 md:mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
            {count !== undefined && (
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #007476, #2E8BC0)' }}
              >
                {count}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {onCreate && createLabel && (
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap self-start sm:self-auto"
            style={{ background: 'linear-gradient(135deg, #007476, #005a5c)' }}
          >
            <PlusIcon className="h-4 w-4" />
            {createLabel}
          </button>
        )}
      </div>

      {/* Filters */}
      {filters && (
        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm">
          {filters}
        </div>
      )}

      {/* Content */}
      <div>{children}</div>

      {/* Toasts */}
      {successMessage && (
        <Toast message={successMessage} type="success" onDismiss={onClearSuccess ?? (() => {})} />
      )}
      {errorMessage && (
        <Toast message={errorMessage} type="error" onDismiss={onClearError ?? (() => {})} />
      )}
    </div>
  );
}
