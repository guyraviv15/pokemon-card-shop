/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import type { PokemonCard } from "@/lib/types"
import Translate from "./Translate"

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

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

export default function CardGrid({ cards }: { cards: PokemonCard[] }) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg"><Translate textKey="cards.noCards" /></p>
      </div>
    )
  }

  return (
    <div className="card-grid">
      {cards.map(card => (
        <Link
          key={card.id}
          href={`/cards/${slugify(card.name)}`}
          className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-red-200 transition-all"
        >
          <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center p-1">
            {card.imageUrl ? (
              <img
                src={card.imageUrl}
                alt={card.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            ) : (
              <span className="text-4xl">🃏</span>
            )}
          </div>
          <div className="p-2">
            <div className="flex items-center justify-between mb-0.5">
              <h3 className="font-semibold text-gray-900 text-xs leading-tight truncate max-w-[70%]">{card.name}</h3>
              <span className="text-[10px] text-gray-500">{card.number}</span>
            </div>
            <p className="text-[10px] text-gray-500 mb-1 truncate">{card.set}</p>
            <div className="flex items-center gap-1 mb-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-tight ${rarityColor(card.rarity)}`}>
                {card.rarity}
              </span>
              <span className="text-[10px] text-gray-500">{card.condition}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-red-600">
                ${card.price.toFixed(2)}
              </span>
              {card.quantity > 1 && (
                <span className="text-[10px] text-gray-400">
                  <Translate textKey="cards.qty" vars={{ count: card.quantity }} />
                </span>
              )}
              {card.quantity === 0 && (
                <span className="text-[10px] text-red-500 font-medium">
                  <Translate textKey="cards.soldOut" />
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
