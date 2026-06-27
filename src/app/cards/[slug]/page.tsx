/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation"
import Link from "next/link"
import { getCardBySlug, getCards } from "@/lib/data"
import Translate from "@/components/Translate"
import PageWrapper from "@/components/PageWrapper"

function rarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    'Common': 'bg-gray-100 text-gray-700',
    'Uncommon': 'bg-green-100 text-green-700',
    'Rare': 'bg-blue-100 text-blue-700',
    'Holo Rare': 'bg-yellow-100 text-yellow-700',
    'Ultra Rare': 'bg-purple-100 text-purple-700',
    'Secret Rare': 'bg-red-100 text-red-700',
  }
  return colors[rarity] || 'bg-gray-100 text-gray-700'
}

export async function generateStaticParams() {
  const cards = await getCards()
  return cards.map(card => ({
    slug: card.name.toLowerCase().replace(/\s+/g, '-'),
  }))
}

export default async function CardDetailPage(props: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await props.params
  const card = await getCardBySlug(slug)

  if (!card) notFound()

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/cards"
          className="text-sm text-red-600 hover:text-red-700 font-medium mb-6 inline-block"
        >
          <Translate textKey="cards.backToCards" />
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center">
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-full max-w-sm object-contain"
              />
            ) : (
              <span className="text-8xl">🃏</span>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{card.name}</h1>
            <p className="text-gray-500 mb-4">{card.set} &middot; #{card.number}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${rarityColor(card.rarity)}`}>
                {card.rarity}
              </span>
              <span className="text-sm px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                {card.type}
              </span>
              <span className="text-sm px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                {card.condition}
              </span>
            </div>

            {card.description && (
              <p className="text-gray-600 mb-6">{card.description}</p>
            )}

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-red-600">${card.price.toFixed(2)}</span>
                {card.quantity > 0 ? (
                  <span className="text-sm text-gray-500">
                    <Translate textKey="cards.available" vars={{ count: card.quantity }} />
                  </span>
                ) : (
                  <span className="text-sm text-red-500 font-medium">
                    <Translate textKey="cards.soldOut" />
                  </span>
                )}
              </div>

              <button
                disabled
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {card.quantity > 0 ? <Translate textKey="cards.contactToPurchase" /> : <Translate textKey="cards.soldOut" />}
              </button>
              <p className="text-xs text-gray-400 mt-2 text-center">
                <Translate textKey="cards.listingNote" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
