import { redirect } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import ImportPageClient from "./ImportPageClient"

export default async function ImportPage() {
  const authed = await isAuthenticated()
  if (!authed) redirect('/admin')

  return <ImportPageClient />
}
