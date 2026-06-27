import fs from 'node:fs'
import path from 'node:path'
import type { PokemonCard, CardFormData } from './types'

const DATA_DIR = path.join(process.cwd(), 'src', 'data')
const CARDS_FILE = path.join(DATA_DIR, 'cards.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readCards(): PokemonCard[] {
  ensureDataDir()
  if (!fs.existsSync(CARDS_FILE)) {
    fs.writeFileSync(CARDS_FILE, '[]', 'utf-8')
    return []
  }
  const raw = fs.readFileSync(CARDS_FILE, 'utf-8')
  return JSON.parse(raw)
}

export function writeCards(cards: PokemonCard[]) {
  ensureDataDir()
  fs.writeFileSync(CARDS_FILE, JSON.stringify(cards, null, 2), 'utf-8')
}

export function getCards(): PokemonCard[] {
  return readCards()
}

export function getCard(id: string): PokemonCard | undefined {
  return readCards().find(c => c.id === id)
}

export function getCardBySlug(slug: string): PokemonCard | undefined {
  return readCards().find(c => c.name.toLowerCase().replace(/\s+/g, '-') === slug)
}

export function createCard(data: CardFormData): PokemonCard {
  const cards = readCards()
  const card: PokemonCard = {
    ...data,
    id: crypto.randomUUID(),
    isSold: false,
    createdAt: new Date().toISOString(),
  }
  cards.push(card)
  writeCards(cards)
  return card
}

export function updateCard(id: string, data: Partial<CardFormData>): PokemonCard | undefined {
  const cards = readCards()
  const index = cards.findIndex(c => c.id === id)
  if (index === -1) return undefined
  cards[index] = { ...cards[index], ...data }
  writeCards(cards)
  return cards[index]
}

export function deleteCard(id: string): boolean {
  const cards = readCards()
  const index = cards.findIndex(c => c.id === id)
  if (index === -1) return false
  cards.splice(index, 1)
  writeCards(cards)
  return true
}

export function getSets(): string[] {
  const cards = readCards()
  return [...new Set(cards.map(c => c.set))].sort()
}

export function getTypes(): string[] {
  const cards = readCards()
  return [...new Set(cards.map(c => c.type))].sort()
}

export function getRarities(): string[] {
  const cards = readCards()
  return [...new Set(cards.map(c => c.rarity))].sort()
}
