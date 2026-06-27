import { NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const q = request.nextUrl.searchParams.get('q')
  if (!q || q.length < 2) {
    return NextResponse.json({ cards: [] })
  }

  try {
    const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(q)}*&pageSize=20&orderBy=set.releaseDate`)
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    return NextResponse.json({ cards: data.data || [] })
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 502 })
  }
}
