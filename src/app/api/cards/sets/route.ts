import { NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { fetchSets, fetchCardsBySet } from "@/lib/tcg-api"

export async function GET(request: NextRequest) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const setId = request.nextUrl.searchParams.get('setId')

  try {
    if (setId) {
      const cards = await fetchCardsBySet(setId)
      return NextResponse.json({ cards })
    }
    const sets = await fetchSets()
    return NextResponse.json({ sets })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch from Pokemon TCG API' }, { status: 502 })
  }
}
