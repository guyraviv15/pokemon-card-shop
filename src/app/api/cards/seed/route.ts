import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { getCards, writeCards } from "@/lib/data"

export async function GET() {
  const authed = await isAuthenticated()
  if (!authed) redirect('/admin')

  const cards = await getCards()
  await writeCards(cards)

  redirect('/admin?seeded=' + cards.length)
}
