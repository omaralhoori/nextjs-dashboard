'use client';

import {
  KeyIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Button } from './button';
import { useActionState, useState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';

// New Syrian independence flag (black / white+stars / green)
function SyrianFlag({ size = 20 }: { size?: number }) {
  const w = size * 1.5;
  const h = size;
  const stripe = h / 3;
  const starY = h / 2;
  const starPositions = [w * 0.3, w * 0.5, w * 0.7];
  const r = h * 0.09;

  function star(cx: number, cy: number) {
    const pts: string[] = [];
    for (let i = 0; i < 5; i++) {
      const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const innerAngle = outerAngle + Math.PI / 5;
      pts.push(`${cx + r * Math.cos(outerAngle)},${cy + r * Math.sin(outerAngle)}`);
      pts.push(`${cx + r * 0.4 * Math.cos(innerAngle)},${cy + r * 0.4 * Math.sin(innerAngle)}`);
    }
    return <polygon key={cx} points={pts.join(' ')} fill="#cc0001" />;
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="rounded-sm flex-shrink-0">
      {/* Black top */}
      <rect y={stripe * 2} width={w} height={stripe} fill="#000000" />
      {/* White middle */}
      <rect y={stripe} width={w} height={stripe} fill="#ffffff" />
      {/* Green bottom */}
      <rect y={0} width={w} height={stripe} fill="#007A3D" />
      {/* 3 red stars in the white band */}
      {starPositions.map((cx) => star(cx, starY))}
    </svg>
  );
}

const COUNTRY_CODES = [
  { code: '+963', name: 'Syria', flag: 'sy' },
  { code: '+966', name: 'Saudi Arabia', flag: 'sa' },
  { code: '+971', name: 'UAE', flag: 'ae' },
  { code: '+962', name: 'Jordan', flag: 'jo' },
  { code: '+961', name: 'Lebanon', flag: 'lb' },
  { code: '+964', name: 'Iraq', flag: 'iq' },
  { code: '+20', name: 'Egypt', flag: 'eg' },
  { code: '+90', name: 'Turkey', flag: 'tr' },
  { code: '+1', name: 'USA/Canada', flag: 'us' },
  { code: '+44', name: 'UK', flag: 'gb' },
  { code: '+49', name: 'Germany', flag: 'de' },
];

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
  const [countryCode, setCountryCode] = useState('+963');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selected = COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="countryCode" value={countryCode} />
      <input type="hidden" name="redirectTo" value={callbackUrl} />

      {/* Mobile Number field */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="localNumber">
          Mobile Number
        </label>
        <div className="flex gap-2">
          {/* Country code picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-1.5 h-10 px-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-pharma whitespace-nowrap"
            >
              {selected.code === '+963' ? (
                <SyrianFlag size={16} />
              ) : (
                <span className="text-base">{getFlagEmoji(selected.flag)}</span>
              )}
              <span className="text-gray-900 font-semibold">{selected.code}</span>
              <ChevronDownIcon className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 top-full mt-1 z-50 w-52 rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden">
                <div className="max-h-56 overflow-y-auto">
                  {COUNTRY_CODES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { setCountryCode(c.code); setDropdownOpen(false); }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors"
                    >
                      {c.code === '+963' ? (
                        <SyrianFlag size={16} />
                      ) : (
                        <span className="text-base w-6">{getFlagEmoji(c.flag)}</span>
                      )}
                      <span className="font-medium text-gray-900 flex-1">{c.name}</span>
                      <span className="text-gray-500 text-xs">{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Local number input */}
          <div className="relative flex-1">
            <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="localNumber"
              name="localNumber"
              type="tel"
              placeholder="9XXXXXXXX"
              required
              className="block w-full h-10 rounded-lg border border-gray-300 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-pharma focus:ring-1 focus:ring-pharma outline-none"
            />
          </div>
        </div>
      </div>

      {/* Password field */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <KeyIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
            minLength={6}
            className="block w-full h-10 rounded-lg border border-gray-300 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-pharma focus:ring-1 focus:ring-pharma outline-none"
          />
        </div>
      </div>

      {/* Submit */}
      <Button
        className="w-full h-11 text-base font-semibold justify-center mt-2"
        aria-disabled={isPending}
      >
        {isPending ? 'Signing in…' : 'Sign In'}
      </Button>

      {/* Error */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5">
          <ExclamationCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}
    </form>
  );
}

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}
