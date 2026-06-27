import { NextRequest, NextResponse } from "next/server"
import { getCards, writeCards } from "@/lib/data"
import { isAuthenticated } from "@/lib/auth"
import type { PokemonCard } from "@/lib/types"

export async function POST(request: NextRequest) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { cards: incoming } = await request.json()

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return NextResponse.json({ error: 'No cards provided' }, { status: 400 })
    }

    const existing = getCards()
    const now = new Date().toISOString()
    const newCards: PokemonCard[] = incoming.map((c: any) => ({
      id: crypto.randomUUID(),
      name: c.name || 'Unknown',
      set: c.set || '',
      number: String(c.number || ''),
      type: c.type || 'Colorless',
      rarity: c.rarity || 'Common',
      condition: c.condition || 'Near Mint',
      price: Number(c.price) || 0,
      quantity: Number(c.quantity) || 1,
      imageUrl: c.imageUrl || '',
      description: c.description || '',
      isSold: false,
      createdAt: now,
    }))

    writeCards([...existing, ...newCards])

    return NextResponse.json({ count: newCards.length, cards: newCards }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to import cards' }, { status: 400 })
  }
}
