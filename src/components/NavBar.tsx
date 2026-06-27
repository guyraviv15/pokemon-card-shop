'use client'

import Link from "next/link"
import { useLang } from "./LanguageProvider"
import { t, LANGS, type Lang } from "@/lib/translations"

export default function NavBar() {
  const { lang, setLang } = useLang()

  function toggleLang() {
    setLang(lang === 'en' ? 'he' : 'en')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-bold text-gray-900">{t('site.title', lang)}</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              {t('nav.home', lang)}
            </Link>
            <Link href="/cards" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              {t('nav.cards', lang)}
            </Link>
            <button
              onClick={toggleLang}
              className="text-xs font-medium px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {lang === 'en' ? 'עברית' : 'EN'}
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
