'use client'

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

interface PreviewCard {
  name: string
  set: string
  number: string
  type: string
  rarity: string
  condition: string
  price: number
  quantity: number
  imageUrl: string
  description: string
  row: number
}

export default function FileImportPanel() {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<PreviewCard[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [format, setFormat] = useState<'csv' | 'json'>('csv')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setSuccess('')

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const text = evt.target?.result as string
      if (format === 'json') {
        parseJson(text)
      } else {
        parseCsv(text)
      }
    }
    reader.onerror = () => setError('Failed to read file')
    reader.readAsText(file)
  }

  function parseJson(text: string) {
    try {
      const data = JSON.parse(text)
      const arr = Array.isArray(data) ? data : data.cards || []
      const cards: PreviewCard[] = arr.map((item: any, i: number) => ({
        name: item.name || '',
        set: item.set || '',
        number: String(item.number || ''),
        type: item.type || 'Colorless',
        rarity: item.rarity || 'Common',
        condition: item.condition || 'Near Mint',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        imageUrl: item.imageUrl || item.image_url || '',
        description: item.description || '',
        row: i + 1,
      }))
      setPreview(cards)
    } catch {
      setError('Invalid JSON format. Expected an array of cards or { cards: [...] }')
    }
  }

  function parseCsv(text: string) {
    const lines = text.split(/\r?\n/).filter(l => l.trim())
    if (lines.length < 2) {
      setError('CSV must have a header row and at least one data row')
      return
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const nameIdx = headers.findIndex(h => h === 'name' || h === 'card name')
    const setIdx = headers.findIndex(h => h === 'set' || h === 'set name')
    const numberIdx = headers.findIndex(h => h === 'number' || h === 'card number' || h === '#')
    const typeIdx = headers.findIndex(h => h === 'type')
    const rarityIdx = headers.findIndex(h => h === 'rarity')
    const conditionIdx = headers.findIndex(h => h === 'condition')
    const priceIdx = headers.findIndex(h => h === 'price')
    const quantityIdx = headers.findIndex(h => h === 'quantity' || h === 'qty')
    const imageIdx = headers.findIndex(h => h === 'imageurl' || h === 'image_url' || h === 'image')
    const descIdx = headers.findIndex(h => h === 'description' || h === 'desc')

    if (nameIdx === -1) {
      setError('CSV must have a "name" column')
      return
    }

    const cards: PreviewCard[] = []

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim())
      const card: PreviewCard = {
        name: cols[nameIdx] || '',
        set: setIdx >= 0 ? cols[setIdx] || '' : '',
        number: numberIdx >= 0 ? cols[numberIdx] || '' : '',
        type: typeIdx >= 0 ? cols[typeIdx] || 'Colorless' : 'Colorless',
        rarity: rarityIdx >= 0 ? cols[rarityIdx] || 'Common' : 'Common',
        condition: conditionIdx >= 0 ? cols[conditionIdx] || 'Near Mint' : 'Near Mint',
        price: priceIdx >= 0 ? Number(cols[priceIdx]) || 0 : 0,
        quantity: quantityIdx >= 0 ? Number(cols[quantityIdx]) || 1 : 1,
        imageUrl: imageIdx >= 0 ? cols[imageIdx] || '' : '',
        description: descIdx >= 0 ? cols[descIdx] || '' : '',
        row: i + 1,
      }
      if (card.name) cards.push(card)
    }

    setPreview(cards)
  }

  async function importAll() {
    if (preview.length === 0) return

    setImporting(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/cards/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: preview }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')

      setSuccess(`Successfully imported ${data.count} cards!`)
      setPreview([])
      if (fileInput.current) fileInput.current.value = ''
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Upload Cards File</h2>

        <div className="flex gap-4 items-center mb-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={format === 'csv'}
              onChange={() => setFormat('csv')}
              className="text-red-600"
            />
            CSV
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={format === 'json'}
              onChange={() => setFormat('json')}
              className="text-red-600"
            />
            JSON
          </label>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-300 transition-colors">
          <input
            ref={fileInput}
            type="file"
            accept={format === 'csv' ? '.csv' : '.json'}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <p className="text-gray-500 mb-2">
              {preview.length > 0
                ? `${preview.length} cards loaded. Click to re-upload.`
                : `Click to upload a ${format.toUpperCase()} file`}
            </p>
            <p className="text-xs text-gray-400">
              {format === 'csv'
                ? 'Columns: name, set, number, type, rarity, condition, price, quantity, imageUrl, description'
                : 'Format: [{ "name": "...", "price": 5.99, ... }] or { "cards": [...] }'}
            </p>
          </label>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Preview ({preview.length} cards)</h2>
            <button
              onClick={importAll}
              disabled={importing}
              className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import All ${preview.length} Cards`}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Set</th>
                  <th className="px-3 py-2 text-left">Number</th>
                  <th className="px-3 py-2 text-left">Rarity</th>
                  <th className="px-3 py-2 text-left">Condition</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((card, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-400">{card.row}</td>
                    <td className="px-3 py-2 font-medium text-gray-900">{card.name}</td>
                    <td className="px-3 py-2 text-gray-600">{card.set}</td>
                    <td className="px-3 py-2 text-gray-500">{card.number}</td>
                    <td className="px-3 py-2">{card.rarity}</td>
                    <td className="px-3 py-2">{card.condition}</td>
                    <td className="px-3 py-2 text-right">${card.price.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{card.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
