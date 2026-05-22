import SideNav from '@/app/ui/dashboard/sidenav';

export const experimental_ppr = true;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      {/* SideNav manages its own width (collapsible on desktop, drawer on mobile) */}
      <SideNav />

      {/* Main content — pt-[60px] on mobile clears the fixed top bar */}
      <div className="flex-grow overflow-y-auto p-4 pt-[60px] md:pt-0 md:p-8 bg-gray-50/50">
        {children}
      </div>
    </div>
  );
}
