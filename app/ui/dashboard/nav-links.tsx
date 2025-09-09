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
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
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
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
              {
                "bg-sky-100 text-blue-600": pathname === link.href,
              }
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
