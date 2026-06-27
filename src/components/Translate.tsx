'use client'

import { useLang } from "./LanguageProvider"
import { t } from "@/lib/translations"

export default function Translate({
  textKey,
  vars,
}: {
  textKey: string
  vars?: Record<string, string | number>
}) {
  const { lang } = useLang()
  return <>{t(textKey, lang, vars)}</>
}
