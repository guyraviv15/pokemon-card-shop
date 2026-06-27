export type Lang = 'en' | 'he'

const translations: Record<string, { en: string; he: string }> = {
  'site.title': { en: "Guy's Pokemon Card Shop", he: 'חנות הקלפים של גיא' },
  'site.tagline': { en: 'Browse our collection of authentic Pokemon cards. Rare finds, classic sets, and more.', he: 'דפדפו באוסף הקלפים האותנטיים שלנו. ממצאים נדירים, סטים קלאסיים ועוד.' },
  'nav.home': { en: 'Home', he: 'דף הבית' },
  'nav.cards': { en: 'Cards', he: 'קלפים' },
  'hero.title': { en: "Guy's Pokemon Cards For Sale", he: 'הקלפים של גיא למכירה' },
  'hero.browse': { en: 'Browse All Cards', he: 'לכל הקלפים' },
  'section.available': { en: 'Available Cards', he: 'קלפים זמינים' },
  'section.viewAll': { en: 'View All →', he: 'לכולם ←' },
  'cards.title': { en: 'All Cards', he: 'כל הקלפים' },
  'cards.found': { en: '{count} card found', he: 'נמצא {count} קלף' },
  'cards.found_plural': { en: '{count} cards found', he: 'נמצאו {count} קלפים' },
  'cards.noCards': { en: 'No cards found.', he: 'לא נמצאו קלפים.' },
  'cards.soldOut': { en: 'Sold Out', he: 'נמכר' },
  'cards.qty': { en: 'Qty: {count}', he: 'כמות: {count}' },
  'cards.available': { en: '{count} available', he: '{count} במלאי' },
  'cards.contactToPurchase': { en: 'Contact to Purchase', he: 'צור קשר לרכישה' },
  'cards.listingNote': { en: 'This is a listing site. Contact the seller to make a purchase.', he: 'זהו אתר הצגה. צור קשר עם המוכר לביצוע רכישה.' },
  'cards.backToCards': { en: '← Back to Cards', he: '← חזרה לקלפים' },
  'filter.search': { en: 'Search', he: 'חיפוש' },
  'filter.searchPlaceholder': { en: 'Name, set, type...', he: 'שם, סט, סוג...' },
  'filter.go': { en: 'Go', he: 'חפש' },
  'filter.set': { en: 'Set', he: 'סט' },
  'filter.allSets': { en: 'All Sets', he: 'כל הסטים' },
  'filter.type': { en: 'Type', he: 'סוג' },
  'filter.allTypes': { en: 'All Types', he: 'כל הסוגים' },
  'filter.rarity': { en: 'Rarity', he: 'נדירות' },
  'filter.allRarities': { en: 'All Rarities', he: 'כל רמות הנדירות' },
  'filter.priceRange': { en: 'Price Range', he: 'טווח מחירים' },
  'filter.min': { en: 'Min', he: 'מינימום' },
  'filter.max': { en: 'Max', he: 'מקסימום' },
  'filter.sortBy': { en: 'Sort By', he: 'מיין לפי' },
  'filter.sortName': { en: 'Name', he: 'שם' },
  'filter.sortPriceLow': { en: 'Price: Low to High', he: 'מחיר: מהנמוך לגבוה' },
  'filter.sortPriceHigh': { en: 'Price: High to Low', he: 'מחיר: מהגבוה לנמוך' },
  'filter.sortNewest': { en: 'Newest First', he: 'החדש ביותר' },
  'filter.clearFilters': { en: 'Clear Filters', he: 'נקה סינון' },
  'footer.copyright': { en: '© {year} Guy\'s Pokemon Card Shop. Not affiliated with The Pokemon Company.', he: '© {year} חנות הקלפים של גיא. לא מסונף עם חברת הפוקימון.' },
}

export function t(key: string, lang: Lang, vars?: Record<string, string | number>): string {
  const entry = translations[key]
  if (!entry) return key
  let text = entry[lang]
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }
  return text
}

export function useT(lang: Lang) {
  return (key: string, vars?: Record<string, string | number>) => t(key, lang, vars)
}

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'he', label: 'עברית' },
]
