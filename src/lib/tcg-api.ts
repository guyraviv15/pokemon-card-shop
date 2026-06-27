const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2'

interface TcgCard {
  id: string
  name: string
  number: string
  types: string[]
  rarity: string | null
  images: { large: string; small: string }
  set: { id: string; name: string; printedTotal: number }
}

export function formatCardNumber(number: string, printedTotal: number): string {
  const num = parseInt(number, 10)
  if (isNaN(num)) return number
  const digits = String(printedTotal).length
  return String(num).padStart(digits, '0') + '/' + printedTotal
}

interface TcgSet {
  id: string
  name: string
  series: string
  printedTotal: number
  releaseDate: string
}

export async function fetchSets(): Promise<TcgSet[]> {
  const res = await fetch(`${POKEMON_TCG_API}/sets?orderBy=releaseDate`)
  if (!res.ok) throw new Error('Failed to fetch sets')
  const data = await res.json()
  return data.data
}

export async function fetchCardsBySet(setId: string): Promise<TcgCard[]> {
  const res = await fetch(`${POKEMON_TCG_API}/cards?q=set.id:${setId}&orderBy=number`)
  if (!res.ok) throw new Error(`Failed to fetch cards for set ${setId}`)
  const data = await res.json()
  return data.data
}

export function mapRarity(rarity: string | null): string {
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

export function mapType(types: string[]): string {
  if (!types || types.length === 0) return 'Colorless'
  const type = types[0]
  const map: Record<string, string> = {
    'Grass': 'Grass',
    'Fire': 'Fire',
    'Water': 'Water',
    'Lightning': 'Lightning',
    'Psychic': 'Psychic',
    'Fighting': 'Fighting',
    'Darkness': 'Darkness',
    'Metal': 'Metal',
    'Fairy': 'Fairy',
    'Dragon': 'Dragon',
    'Colorless': 'Colorless',
  }
  return map[type] || 'Colorless'
}
