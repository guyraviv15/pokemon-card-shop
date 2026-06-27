'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Lang } from "@/lib/translations"

const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
}>({ lang: 'en', setLang: () => {} })

export function useLang() {
  return useContext(LangContext)
}

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null
    if (stored === 'en' || stored === 'he') {
      setLang(stored)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) localStorage.setItem('lang', lang)
  }, [lang, mounted])

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}
