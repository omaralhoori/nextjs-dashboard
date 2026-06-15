'use client';

import {
  HomeIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  Squares2X2Icon,
  CogIcon,
  CurrencyDollarIcon,
  CubeIcon,
  BeakerIcon,
  MapPinIcon,
  UserGroupIcon,
  UserCircleIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Pharmacies', href: '/dashboard/pharmacies', icon: BuildingOfficeIcon },
  { name: 'Warehouses', href: '/dashboard/warehouses', icon: BuildingStorefrontIcon },
  { name: 'Users', href: '/dashboard/users', icon: UserGroupIcon },
  { name: 'Item Groups', href: '/dashboard/item-groups', icon: Squares2X2Icon },
  { name: 'Manufacturers', href: '/dashboard/manufacturers', icon: CogIcon },
  { name: 'Currencies', href: '/dashboard/currencies', icon: CurrencyDollarIcon },
  { name: 'Items', href: '/dashboard/items', icon: CubeIcon },
  { name: 'Active Ingredients', href: '/dashboard/active-ingredients', icon: BeakerIcon },
  { name: 'Address', href: '/dashboard/address', icon: MapPinIcon },
  { name: 'Reports', href: '/dashboard/reports', icon: ChartBarIcon },
  { name: 'Home Screen', href: '/dashboard/home-screen', icon: ComputerDesktopIcon },
  { name: 'Password Resets', href: '/dashboard/password-reset', icon: KeyIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
];

interface NavLinksProps {
  collapsed?: boolean;
  onLinkClick?: () => void;
}

export default function NavLinks({ collapsed = false, onLinkClick }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onLinkClick}
            title={collapsed ? link.name : undefined}
            className={clsx(
              'flex h-[42px] items-center gap-3 rounded-lg text-sm font-medium transition-all',
              collapsed ? 'justify-center px-1' : 'justify-start px-3',
              isActive
                ? 'bg-white/25 text-white shadow-sm'
                : 'text-white/75 hover:bg-white/15 hover:text-white',
            )}
          >
            <LinkIcon className={clsx('w-5 h-5 flex-shrink-0', isActive ? 'text-white' : 'text-white/70')} />
            {!collapsed && <span className="truncate">{link.name}</span>}
          </Link>
        );
      })}
    </>
  );
}
