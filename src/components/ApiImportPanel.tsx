'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { PokemonCard } from "@/lib/types"

interface TcgSet {
  id: string
  name: string
  series: string
  printedTotal: number
  releaseDate: string
}

interface TcgCard {
  id: string
  name: string
  number: string
  types: string[]
  rarity: string | null
  images: { large: string; small: string }
  set: { id: string; name: string }
}

interface ImportCard {
  name: string
  set: string
  number: string
  type: string
  rarity: string
  condition: string
  price: number
  quantity: number
  imageUrl: string
  description: string
  selected: boolean
}

const CONDITIONS = ['Mint', 'Near Mint', 'Excellent', 'Good', 'Fair', 'Poor']

export default function ApiImportPanel() {
  const router = useRouter()
  const [sets, setSets] = useState<TcgSet[]>([])
  const [selectedSet, setSelectedSet] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [importing, setImporting] = useState(false)
  const [cards, setCards] = useState<ImportCard[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [defaultCondition, setDefaultCondition] = useState('Near Mint')
  const [defaultPrice, setDefaultPrice] = useState(5)
  const [defaultQuantity, setDefaultQuantity] = useState(1)
  const [setFilter, setSetFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')

  useEffect(() => {
    fetchSets()
  }, [])

  async function fetchSets() {
    setLoading(true)
    try {
      const res = await fetch('/api/cards/sets')
      const data = await res.json()
      if (data.sets) setSets(data.sets)
    } catch {
      setError('Failed to load Pokemon sets')
    } finally {
      setLoading(false)
    }
  }

  async function fetchCards() {
    if (!selectedSet) return
    setFetching(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/cards/sets?setId=${selectedSet}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch cards')

      const importCards: ImportCard[] = (data.cards || []).map((c: TcgCard) => {
        const num = parseInt(c.number, 10)
        const digits = String(c.set.printedTotal || 100).length
        const formattedNumber = (isNaN(num) ? c.number : String(num).padStart(digits, '0')) + '/' + (c.set.printedTotal || '?')
        return {
        name: c.name,
        set: c.set.name,
        number: formattedNumber,
        type: c.types?.[0] || 'Colorless',
        rarity: mapRarity(c.rarity),
        condition: defaultCondition,
        price: defaultPrice,
        quantity: defaultQuantity,
        imageUrl: c.images?.large || '',
        description: '',
        selected: true,
      };
    })
      setCards(importCards)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cards')
    } finally {
      setFetching(false)
    }
  }

  function mapRarity(rarity: string | null): string {
    if (!rarity) return 'Common'
    const map: Record<string, string> = {
      'Common': 'Common',
      'Uncommon': 'Uncommon',
      'Rare': 'Rare',
      'Rare Holo': 'Holo Rare',
      'Rare Holo V': 'Holo Rare',
      'Rare Holo VMAX': 'Holo Rare',
      'Rare Holo VSTAR': 'Holo Rare',
      'Rare Ultra': 'Ultra Rare',
      'Rare Secret': 'Secret Rare',
      'Rare Rainbow': 'Ultra Rare',
      'Rare Shiny': 'Ultra Rare',
      'Rare Shiny GX': 'Ultra Rare',
      'Amazing Rare': 'Ultra Rare',
      'Illustration Rare': 'Ultra Rare',
      'Special Illustration Rare': 'Secret Rare',
      'Hyper Rare': 'Secret Rare',
    }
    return map[rarity] || 'Rare'
  }

  function toggleAll(selected: boolean) {
    setCards(prev => prev.map(c => ({ ...c, selected })))
  }

  function toggleCard(index: number) {
    setCards(prev => prev.map((c, i) => i === index ? { ...c, selected: !c.selected } : c))
  }

  function updateCardField(index: number, field: keyof ImportCard, value: string | number | boolean) {
    setCards(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  function applyDefaultsToSelected() {
    setCards(prev => prev.map(c => c.selected ? {
      ...c,
      condition: defaultCondition,
      price: defaultPrice,
      quantity: defaultQuantity,
    } : c))
  }

  async function importSelected() {
    const toImport = cards.filter(c => c.selected)
    if (toImport.length === 0) {
      setError('No cards selected')
      return
    }

    setImporting(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/cards/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: toImport }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')

      setSuccess(`Successfully imported ${data.count} cards!`)
      setCards([])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const filteredSets = sets.filter(s =>
    s.name.toLowerCase().includes(setFilter.toLowerCase()) ||
    s.series.toLowerCase().includes(setFilter.toLowerCase())
  )

  const filteredCards = cards.filter(c =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.number.toLowerCase().includes(searchFilter.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">1. Choose a Pokemon Set</h2>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter sets</label>
            <input
              type="text"
              value={setFilter}
              onChange={e => setSetFilter(e.target.value)}
              placeholder="Search sets..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500 mt-4">Loading sets...</p>
        ) : (
          <div className="mt-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredSets.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSet(s.id)}
                className={`w-full text-left px-4 py-2 text-sm border-b border-gray-100 last:border-b-0 transition-colors ${
                  selectedSet === s.id
                    ? 'bg-red-50 text-red-700 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-gray-400 ml-2">({s.series})</span>
                <span className="text-gray-400 ml-1">- {s.printedTotal} cards</span>
              </button>
            ))}
            {filteredSets.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-500">No sets found</p>
            )}
          </div>
        )}

        <button
          onClick={fetchCards}
          disabled={!selectedSet || fetching}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {fetching ? 'Fetching...' : `Fetch Cards${selectedSet ? ` from ${sets.find(s => s.id === selectedSet)?.name || selectedSet}` : ''}`}
        </button>
      </div>

      {cards.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">2. Review & Import ({cards.length} cards)</h2>

          <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Default Condition</label>
              <select
                value={defaultCondition}
                onChange={e => setDefaultCondition(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              >
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Default Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={defaultPrice}
                onChange={e => setDefaultPrice(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Default Qty</label>
              <input
                type="number"
                min="0"
                step="1"
                value={defaultQuantity}
                onChange={e => setDefaultQuantity(Number(e.target.value))}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            <button
              onClick={applyDefaultsToSelected}
              className="col-span-3 px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
            >
              Apply defaults to selected cards
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Filter cards in this set..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={cards.every(c => c.selected)}
                onChange={e => toggleAll(e.target.checked)}
                className="rounded border-gray-300"
              />
              Select all
            </label>
            <span className="text-sm text-gray-500">
              {cards.filter(c => c.selected).length} selected
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left w-8"></th>
                  <th className="px-3 py-2 text-left">Card</th>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Rarity</th>
                  <th className="px-3 py-2 text-left">Condition</th>
                  <th className="px-3 py-2 text-left">Price</th>
                  <th className="px-3 py-2 text-left w-20">Qty</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card, i) => {
                  const realIndex = cards.indexOf(card)
                  return (
                    <tr key={`${card.number}-${i}`} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={card.selected}
                          onChange={() => toggleCard(realIndex)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-3 py-2 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          {card.imageUrl && (
                            <img src={card.imageUrl} alt="" className="w-6 h-8 object-contain rounded" />
                          )}
                          {card.name}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-gray-500">{card.number}</td>
                      <td className="px-3 py-2">{card.rarity}</td>
                      <td className="px-3 py-2">
                        <select
                          value={card.condition}
                          onChange={e => updateCardField(realIndex, 'condition', e.target.value)}
                          className="px-1 py-0.5 border border-gray-200 rounded text-xs"
                        >
                          {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={card.price}
                          onChange={e => updateCardField(realIndex, 'price', Number(e.target.value))}
                          className="w-20 px-1 py-0.5 border border-gray-200 rounded text-xs"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={card.quantity}
                          onChange={e => updateCardField(realIndex, 'quantity', Number(e.target.value))}
                          className="w-16 px-1 py-0.5 border border-gray-200 rounded text-xs"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={importSelected}
            disabled={importing || cards.filter(c => c.selected).length === 0}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {importing ? 'Importing...' : `Import ${cards.filter(c => c.selected).length} Selected Cards`}
          </button>
        </div>
      )}
    </div>
  )
}
