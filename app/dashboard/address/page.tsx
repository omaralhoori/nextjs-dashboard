import Link from 'next/link';

const tabs = [
  { name: 'States', href: '/dashboard/address/states' },
  { name: 'Cities', href: '/dashboard/address/cities' },
  { name: 'Districts', href: '/dashboard/address/districts' },
];

export default function AddressPage() {
  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Address</h1>
      </div>

      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6 text-gray-600">Select a tab to manage states, cities, or districts.</div>
    </main>
  );
}


