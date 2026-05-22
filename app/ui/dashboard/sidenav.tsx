'use client';

import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon, Bars3Icon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { signOutAction } from '@/app/lib/functions/sign-out';
import { useState } from 'react';
import Image from 'next/image';

const GRADIENT = 'linear-gradient(180deg, #004d4f 0%, #007476 50%, #2E8BC0 100%)';
const GRADIENT_H = 'linear-gradient(90deg, #004d4f 0%, #007476 60%, #2E8BC0 100%)';

export default function SideNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div
        className={`hidden md:flex h-full flex-col py-4 transition-all duration-300 ease-in-out relative ${collapsed ? 'w-16 px-2' : 'w-64 px-3'}`}
        style={{ background: GRADIENT }}
      >
        {/* Collapse toggle button — floats on the right edge */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-14 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
        >
          {collapsed
            ? <ChevronRightIcon className="h-3.5 w-3.5 text-gray-600" />
            : <ChevronLeftIcon className="h-3.5 w-3.5 text-gray-600" />
          }
        </button>

        {/* Logo block */}
        <Link
          href="/"
          className={`mb-4 flex flex-col items-center justify-center rounded-xl hover:opacity-90 transition-opacity ${collapsed ? 'py-2 px-1' : 'py-4 px-3'}`}
          style={{ background: 'rgba(255,255,255,0.12)' }}
        >
          <Image
            src="/logo.png"
            alt="PharmaSERV"
            width={collapsed ? 32 : 80}
            height={collapsed ? 32 : 80}
            className="object-contain drop-shadow-md transition-all duration-300"
            priority
          />
          {!collapsed && (
            <span className="mt-2 text-white font-bold text-sm tracking-wide text-center">PharmaSERV</span>
          )}
        </Link>

        {/* Nav links — scrollable */}
        <nav className="flex flex-col gap-0.5 flex-grow overflow-y-auto overflow-x-hidden scrollbar-none pr-0.5">
          <NavLinks collapsed={collapsed} />
        </nav>

        {/* Sign out */}
        <div className="flex-shrink-0 pt-2 border-t border-white/20 mt-2">
          <form action={signOutAction}>
            <button
              type="submit"
              title="Sign Out"
              className={`flex h-[42px] w-full items-center gap-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/20 transition-colors ${collapsed ? 'justify-center px-1' : 'justify-start px-3'}`}
            >
              <PowerIcon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </form>
        </div>
      </div>

      {/* ── Mobile top bar ── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-3 h-14 shadow-md"
        style={{ background: GRADIENT_H }}
      >
        <Link href="/" className="flex items-center gap-2 min-w-0 overflow-hidden">
          <Image
            src="/logo.png"
            alt="PharmaSERV"
            width={30}
            height={30}
            className="object-contain flex-shrink-0"
            priority
          />
          <span className="text-white font-bold text-sm tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
            PharmaSERV
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white p-1.5 rounded-md hover:bg-white/20 flex-shrink-0 ml-2"
          aria-label="Open menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="relative z-10 w-72 max-w-[85vw] h-full flex flex-col px-3 py-4 shadow-2xl overflow-hidden"
            style={{ background: GRADIENT }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Image src="/logo.png" alt="PharmaSERV" width={30} height={30} className="object-contain flex-shrink-0" />
                <span className="text-white font-bold text-sm truncate">PharmaSERV</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white p-1 rounded-md hover:bg-white/20 flex-shrink-0"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable nav */}
            <nav className="flex flex-col gap-0.5 flex-grow overflow-y-auto overflow-x-hidden scrollbar-none">
              <NavLinks onLinkClick={() => setMobileOpen(false)} />
            </nav>

            {/* Sign out */}
            <div className="flex-shrink-0 pt-2 border-t border-white/20 mt-2">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex h-[42px] w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <PowerIcon className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
