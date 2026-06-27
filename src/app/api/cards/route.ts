import { NextRequest, NextResponse } from "next/server"
import { createCard, updateCard, deleteCard, getCards } from "@/lib/data"
import { isAuthenticated } from "@/lib/auth"

async function checkAuth() {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function POST(request: NextRequest) {
  const authError = await checkAuth()
  if (authError) return authError

  try {
    const data = await request.json()
    const existing = await getCards()
    if (existing.some(c => c.name.toLowerCase() === (data.name || '').toLowerCase())) {
      return NextResponse.json({ error: 'You already did this card' }, { status: 409 })
    }
    const card = await createCard(data)
    return NextResponse.json(card, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create card' }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  const authError = await checkAuth()
  if (authError) return authError

  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing card ID' }, { status: 400 })
  }

  try {
    const data = await request.json()
    const card = await updateCard(id, data)
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }
    return NextResponse.json(card)
  } catch {
    return NextResponse.json({ error: 'Failed to update card' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await checkAuth()
  if (authError) return authError

  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing card ID' }, { status: 400 })
  }

  const deleted = await deleteCard(id)
  if (!deleted) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
