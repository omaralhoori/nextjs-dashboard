export function WarehousesTableSkeleton() {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Warehouse Name
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Phone
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Location
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Created At
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Updated At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={i}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
