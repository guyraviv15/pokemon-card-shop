import Link from "next/link"
import { getCards } from "@/lib/data"
import CardGrid from "@/components/CardGrid"

export default function Home() {
  const cards = getCards()
  const featured = cards.filter(c => !c.isSold).slice(0, 8)

  return (
    <div>
      <section className="bg-gradient-to-br from-red-500 via-red-600 to-yellow-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl font-bold mb-4">Pokemon Cards For Sale</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Browse our collection of authentic Pokemon cards. Rare finds, classic sets, and more.
          </p>
          <Link
            href="/cards"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-red-600 font-semibold hover:bg-gray-100 transition-colors"
          >
            Browse All Cards
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Available Cards</h2>
          <Link
            href="/cards"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            View All &rarr;
          </Link>
        </div>
        <CardGrid cards={featured} />
      </section>
    </div>
  )
}
