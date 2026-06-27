'use client'

import { useLang } from "./LanguageProvider"
import type { ReactNode } from "react"

export default function PageWrapper({ children }: { children: ReactNode }) {
  const { lang } = useLang()
  return <div dir={lang === 'he' ? 'rtl' : 'ltr'}>{children}</div>
}
