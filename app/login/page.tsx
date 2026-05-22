import LoginForm from '@/app/ui/login-form';
import Image from 'next/image';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #004d4f 0%, #007476 40%, #2E8BC0 75%, #7BBBD8 100%)' }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none fixed top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{ background: '#00898b' }}
      />
      <div
        className="pointer-events-none fixed bottom-[-80px] right-[-80px] w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: '#4A9FD0' }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo card */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="rounded-2xl p-5 shadow-2xl mb-3"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <Image
              src="/logo.png"
              alt="PharmaSERV"
              width={100}
              height={100}
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-wide drop-shadow">PharmaSERV</h1>
          <p className="text-white/70 text-sm mt-1">Admin Dashboard</p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)' }}
        >
          <div
            className="h-1.5 w-full"
            style={{ background: 'linear-gradient(90deg, #004d4f, #007476, #2E8BC0, #7BBBD8)' }}
          />
          <div className="px-8 py-8">
            <h2 className="text-gray-800 text-xl font-semibold mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-6">Sign in to your account to continue</p>
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          © {new Date().getFullYear()} PharmaSERV. All rights reserved.
        </p>
      </div>
    </main>
  );
}
