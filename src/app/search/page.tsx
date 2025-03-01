'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { createWorker } from 'tesseract.js'
import Image from 'next/image'

type SearchResult = {
  title: string
  summary: string
  sources: string[]
}

export default function SearchPage() {
  const { data: session } = useSession()
  const [searchType, setSearchType] = useState<'text' | 'image'>('text')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const handleTextSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          type: 'text',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Search failed')
      }

      setResults(data.results)

      // Save search history if user is logged in
      if (session?.user) {
        await fetch('/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            type: 'text',
          }),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSearch = async (file: File) => {
    setLoading(true)
    setError('')

    try {
      // First, perform OCR on the image
      const worker = await createWorker()
      await worker.loadLanguage('eng')
      await worker.initialize('eng')
      
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()

      // Now search with the extracted text
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: text,
          type: 'image',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Search failed')
      }

      setResults(data.results)

      // Save search history if user is logged in
      if (session?.user) {
        await fetch('/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: text,
            type: 'image',
          }),
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview the image
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)

    handleImageSearch(file)
  }

  const handleSaveResult = async (result: SearchResult) => {
    try {
      await fetch('/api/saved-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      })
    } catch (err) {
      console.error('Failed to save result:', err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setSearchType('text')}
            className={`px-4 py-2 rounded-md ${
              searchType === 'text'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Text Search
          </button>
          <button
            onClick={() => setSearchType('image')}
            className={`px-4 py-2 rounded-md ${
              searchType === 'image'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Image Search
          </button>
        </div>

        {searchType === 'text' ? (
          <form onSubmit={handleTextSearch}>
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for supplements, treatments, or health products..."
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500"
            >
              {previewImage ? (
                <div className="relative h-48 w-full">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">
                    Click to upload or drag and drop an image
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG, GIF
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-8 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-8">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-2">{result.title}</h3>
              <p className="text-gray-600 mb-4">{result.summary}</p>
              <div className="space-y-2">
                <h4 className="font-medium">Sources:</h4>
                <ul className="list-disc list-inside text-sm text-purple-600">
                  {result.sources.map((source, i) => (
                    <li key={i}>
                      <a
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {source}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              {session?.user && (
                <button
                  onClick={() => handleSaveResult(result)}
                  className="mt-4 text-sm text-purple-600 hover:text-purple-700"
                >
                  Save Result
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 