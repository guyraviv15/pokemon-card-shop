import { isAuthenticated } from "@/lib/auth"
import { getCards } from "@/lib/data"
import { buildTime, commitSha } from "@/lib/version"
import Link from "next/link"

export default async function AdminPage(props: {
  searchParams?: Promise<{ error?: string; prices?: string; total?: string; seeded?: string }>
}) {
  const searchParams = await props.searchParams
  const authed = await isAuthenticated()

  if (authed) {
    const cards = await getCards()
    const totalCards = cards.length
    const availableCards = cards.filter(c => !c.isSold).length
    const totalValue = cards.reduce((sum, c) => sum + c.price * c.quantity, 0)

    const pricesUpdated = searchParams?.prices
    const pricesTotal = searchParams?.total
    const seeded = searchParams?.seeded

    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {pricesUpdated && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Updated prices for {pricesUpdated} of {pricesTotal} cards.
          </div>
        )}
        {seeded && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Seeded {seeded} cards into Redis.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Total Cards</p>
            <p className="text-3xl font-bold text-gray-900">{totalCards}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Available</p>
            <p className="text-3xl font-bold text-green-600">{availableCards}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Total Value</p>
            <p className="text-3xl font-bold text-red-600">${totalValue.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/admin/cards"
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Manage Cards
          </Link>
          <Link
            href="/admin/cards/new"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Add New Card
          </Link>
        </div>

        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">Market Prices</h2>
          <p className="text-sm text-gray-500 mb-4">
            Fetch current market prices from TCGPlayer (via Pokemon TCG API) for all unsold cards.
          </p>
          <form action="/api/cards/update-prices" method="post">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Fetch Market Prices
            </button>
          </form>
        </div>
        <p className="text-xs text-gray-400 mt-8">
          Build: {buildTime.replace('T', ' ').replace('Z', '')} UTC &middot; {commitSha.slice(0, 7)}
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h1>
      {searchParams?.error === 'invalid' && (
        <p className="text-red-600 text-sm mb-4 text-center">Invalid password. Try again.</p>
      )}
      <form action="/api/auth" method="post" className="space-y-4">
        <input type="hidden" name="_action" value="login" />
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  )
}
