'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState } from 'react'
import { useLang } from './LanguageProvider'
import { t } from '@/lib/translations'

export default function FilterSidebar({
  sets,
  types,
  rarities,
}: {
  sets: string[]
  types: string[]
  rarities: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { lang } = useLang()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParam('search', search)
  }

  function clearFilters() {
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    router.push(pathname)
  }

  const hasFilters = Array.from(searchParams.keys()).length > 0

  return (
    <aside className="w-64 shrink-0">
      <div className="sticky top-24 space-y-6">
        <form onSubmit={handleSearch}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('filter.search', lang)}</label>
          <div className="flex gap-1">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('filter.searchPlaceholder', lang)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              {t('filter.go', lang)}
            </button>
          </div>
        </form>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('filter.set', lang)}</label>
          <select
            value={searchParams.get('set') || ''}
            onChange={e => updateParam('set', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">{t('filter.allSets', lang)}</option>
            {sets.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('filter.type', lang)}</label>
          <select
            value={searchParams.get('type') || ''}
            onChange={e => updateParam('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">{t('filter.allTypes', lang)}</option>
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('filter.rarity', lang)}</label>
          <select
            value={searchParams.get('rarity') || ''}
            onChange={e => updateParam('rarity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">{t('filter.allRarities', lang)}</option>
            {rarities.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('filter.priceRange', lang)}</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="0"
              step="0.01"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              onBlur={() => updateParam('minPrice', minPrice)}
              placeholder={t('filter.min', lang)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              onBlur={() => updateParam('maxPrice', maxPrice)}
              placeholder={t('filter.max', lang)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('filter.sortBy', lang)}</label>
          <select
            value={searchParams.get('sort') || 'name'}
            onChange={e => updateParam('sort', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="name">{t('filter.sortName', lang)}</option>
            <option value="price-asc">{t('filter.sortPriceLow', lang)}</option>
            <option value="price-desc">{t('filter.sortPriceHigh', lang)}</option>
            <option value="newest">{t('filter.sortNewest', lang)}</option>
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            {t('filter.clearFilters', lang)}
          </button>
        )}
      </div>
    </aside>
  )
}
