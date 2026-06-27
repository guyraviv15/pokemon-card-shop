'use client'

import { useLang } from "./LanguageProvider"
import { t } from "@/lib/translations"

export default function Footer() {
  const { lang } = useLang()

  return (
    <footer className="bg-gray-900 text-gray-400 py-8" dir={lang === 'he' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
        {t('footer.copyright', lang, { year: new Date().getFullYear() })}
      </div>
    </footer>
  )
}
