import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default async function Page() {
  const session = await auth();
  
  // Redirect to dashboard if user is logged in
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <main className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/heroimage.png)',
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Logo */}
        <div className="flex items-center justify-between p-6">
          <div className="bg-white rounded-lg p-3 shadow-lg">
            <Image 
              src="/pharamlogo.png" 
              alt="PharmaSERV" 
              width={120} 
              height={60}
              className="object-contain"
            />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-2xl text-center">
            <h1 className={`${lusitana.className} text-4xl md:text-6xl font-bold text-white mb-6`}>
              Welcome to PharmaSERV
            </h1>
            <p className="text-xl md:text-2xl text-white mb-8 opacity-90">
              An easy to use platform for managing orders between pharmacies and warehouses
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors shadow-lg"
            >
              <span>Get Started</span>
              <ArrowRightIcon className="w-6 h-6" />
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 text-center">
          <p className="text-white opacity-75 text-sm">
            © 2024 PharmaSERV. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
