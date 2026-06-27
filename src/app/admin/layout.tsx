import Link from "next/link"
import { isAuthenticated } from "@/lib/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authed = await isAuthenticated()

  if (!authed) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        {children}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <aside className="w-56 shrink-0">
          <nav className="sticky top-24 space-y-1">
            <div className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Admin Panel</div>
            <Link
              href="/admin"
              className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/cards"
              className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Manage Cards
            </Link>
            <Link
              href="/admin/cards/new"
              className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Add Card
            </Link>
            <Link
              href="/admin/import"
              className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              Bulk Import
            </Link>
            <Link
              href="/"
              className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              View Site &rarr;
            </Link>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <form action="/api/auth" method="post">
                <input type="hidden" name="_action" value="logout" />
                <button
                  type="submit"
                  className="w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  Logout
                </button>
              </form>
            </div>
          </nav>
        </aside>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
