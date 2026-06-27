'use client'

import { useState } from "react"
import ApiImportPanel from "@/components/ApiImportPanel"
import FileImportPanel from "@/components/FileImportPanel"

type Tab = 'api' | 'file'

export default function ImportPageClient() {
  const [tab, setTab] = useState<Tab>('api')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bulk Import Cards</h1>

      <div className="flex gap-1 mb-8 border-b border-gray-200">
        <button
          onClick={() => setTab('api')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'api'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Import from Pokemon TCG API
        </button>
        <button
          onClick={() => setTab('file')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'file'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload CSV / JSON
        </button>
      </div>

      {tab === 'api' ? <ApiImportPanel /> : <FileImportPanel />}
    </div>
  )
}
