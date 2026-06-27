import { getCards, getSets, getTypes, getRarities } from "@/lib/data"
import CardGrid from "@/components/CardGrid"
import FilterSidebar from "@/components/FilterSidebar"
import Translate from "@/components/Translate"
import PageWrapper from "@/components/PageWrapper"

export default async function CardsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const allCards = await getCards()
  const sets = await getSets()
  const types = await getTypes()
  const rarities = await getRarities()

  let filtered = allCards.filter(c => !c.isSold)

  const search = typeof searchParams?.search === 'string' ? searchParams.search.toLowerCase() : ''
  const setFilter = typeof searchParams?.set === 'string' ? searchParams.set : ''
  const typeFilter = typeof searchParams?.type === 'string' ? searchParams.type : ''
  const rarityFilter = typeof searchParams?.rarity === 'string' ? searchParams.rarity : ''
  const minPrice = typeof searchParams?.minPrice === 'string' ? Number(searchParams.minPrice) : 0
  const maxPrice = typeof searchParams?.maxPrice === 'string' ? Number(searchParams.maxPrice) : Infinity
  const sort = typeof searchParams?.sort === 'string' ? searchParams.sort : 'name'

  if (search) {
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.set.toLowerCase().includes(search) ||
      c.type.toLowerCase().includes(search)
    )
  }
  if (setFilter) filtered = filtered.filter(c => c.set === setFilter)
  if (typeFilter) filtered = filtered.filter(c => c.type === typeFilter)
  if (rarityFilter) filtered = filtered.filter(c => c.rarity === rarityFilter)
  if (minPrice) filtered = filtered.filter(c => c.price >= minPrice)
  if (maxPrice < Infinity) filtered = filtered.filter(c => c.price <= maxPrice)

  switch (sort) {
    case 'price-asc': filtered.sort((a, b) => a.price - b.price); break
    case 'price-desc': filtered.sort((a, b) => b.price - a.price); break
    case 'newest': filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break
    default: filtered.sort((a, b) => a.name.localeCompare(b.name))
  }

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          <Translate textKey="cards.title" />
        </h1>
        <div className="flex gap-8">
          <FilterSidebar sets={sets} types={types} rarities={rarities} />
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-4">
              <Translate textKey={filtered.length === 1 ? 'cards.found' : 'cards.found_plural'} vars={{ count: filtered.length }} />
            </p>
            <CardGrid cards={filtered} />
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
