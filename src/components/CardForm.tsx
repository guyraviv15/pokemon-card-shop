'use client'

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { PokemonCard, CardFormData } from "@/lib/types"

const TYPES = ['Grass', 'Fire', 'Water', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Fairy', 'Dragon', 'Colorless']
const RARITIES = ['Common', 'Uncommon', 'Rare', 'Holo Rare', 'Ultra Rare', 'Secret Rare']
const CONDITIONS = ['Mint', 'Near Mint', 'Excellent', 'Good', 'Fair', 'Poor']

interface SearchResult {
  name: string
  number: string
  types: string[]
  rarity: string | null
  images: { large: string; small: string }
  set: { id: string; name: string; printedTotal: number }
  cardNumber: string
}

function formatNumber(number: string, printedTotal: number): string {
  const num = parseInt(number, 10)
  if (isNaN(num)) return number
  const digits = String(printedTotal).length
  return String(num).padStart(digits, '0') + '/' + printedTotal
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

export default function CardForm({ card }: { card?: PokemonCard }) {
  const router = useRouter()
  const isEdit = !!card
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const [form, setForm] = useState<CardFormData>({
    name: card?.name || '',
    set: card?.set || '',
    number: card?.number || '',
    type: card?.type || 'Fire',
    rarity: card?.rarity || 'Common',
    condition: card?.condition || 'Near Mint',
    price: card?.price || 0,
    quantity: card?.quantity || 1,
    imageUrl: card?.imageUrl || '',
    description: card?.description || '',
  })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/cards/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      const results: SearchResult[] = (data.cards || []).map((c: any) => ({
        name: c.name,
        number: c.number,
        types: c.types || [],
        rarity: c.rarity,
        images: c.images || {},
        set: c.set,
        cardNumber: formatNumber(c.number, c.set?.printedTotal || 100),
      }))
      setSearchResults(results)
      setShowResults(true)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setSearchQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 300)
  }

  function selectCard(result: SearchResult) {
    setForm({
      name: result.name,
      set: result.set.name,
      number: result.cardNumber,
      type: result.types[0] || 'Colorless',
      rarity: mapRarity(result.rarity),
      condition: 'Near Mint',
      price: 0,
      quantity: 1,
      imageUrl: result.images?.large || '',
      description: '',
    })
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!isEdit) {
        const existing = await fetch('/api/cards').then(r => r.json())
        const cards: PokemonCard[] = existing.cards || existing
        if (cards.some(c => c.name.toLowerCase() === form.name.toLowerCase())) {
          alert("You already did this card")
          setLoading(false)
          return
        }
      }

      const url = isEdit ? `/api/cards?id=${card.id}` : '/api/cards'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save card')
      }

      router.push('/admin/cards')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      {!isEdit && (
        <div ref={searchRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search card from Pokemon TCG API</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="Type a card name (e.g. Charizard)..."
              className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">&#128269;</span>
            {searching && (
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {searchResults.map((result, i) => (
                <button
                  type="button"
                  key={`${result.set.id}-${result.number}-${i}`}
                  onClick={() => selectCard(result)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-red-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  {result.images?.small && (
                    <img src={result.images.small} alt="" className="w-7 h-10 object-contain rounded shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{result.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {result.set.name} &middot; #{result.cardNumber} &middot; {mapRarity(result.rarity)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-200 pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Card Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input
              type="text"
              id="number"
              name="number"
              value={form.number}
              onChange={handleChange}
              placeholder="e.g. 4/102"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="set" className="block text-sm font-medium text-gray-700 mb-1">Set</label>
          <input
            type="text"
            id="set"
            name="set"
            value={form.set}
            onChange={handleChange}
            placeholder="e.g. Base Set"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rarity" className="block text-sm font-medium text-gray-700 mb-1">Rarity</label>
            <select
              id="rarity"
              name="rarity"
              value={form.rarity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {RARITIES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <select
              id="condition"
              name="condition"
              value={form.condition}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {CONDITIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              required
              min="0"
              step="1"
              value={form.quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Card' : 'Add Card'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/cards')}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
