'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type SavedResult = {
  id: string
  title: string
  summary: string
  sources: string[]
  createdAt: string
}

type SearchHistoryItem = {
  id: string
  query: string
  type: string
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [savedResults, setSavedResults] = useState<SavedResult[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      Promise.all([
        fetch('/api/saved-results').then((res) => res.json()),
        fetch('/api/history').then((res) => res.json()),
      ])
        .then(([resultsData, historyData]) => {
          setSavedResults(resultsData)
          setSearchHistory(historyData)
        })
        .catch((error) => {
          console.error('Error fetching user data:', error)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [session])

  const handleDeleteResult = async (id: string) => {
    try {
      await fetch(`/api/saved-results?id=${id}`, {
        method: 'DELETE',
      })
      setSavedResults((prev) => prev.filter((result) => result.id !== id))
    } catch (error) {
      console.error('Error deleting result:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-gray-600">
          Welcome back, {session.user.name || session.user.email}
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Saved Results</h2>
          {savedResults.length === 0 ? (
            <p className="text-gray-600">No saved results yet.</p>
          ) : (
            <div className="space-y-4">
              {savedResults.map((result) => (
                <div
                  key={result.id}
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
                  <button
                    onClick={() => handleDeleteResult(result.id)}
                    className="mt-4 text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Search History</h2>
          {searchHistory.length === 0 ? (
            <p className="text-gray-600">No search history yet.</p>
          ) : (
            <div className="space-y-2">
              {searchHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{item.query}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()} -{' '}
                      {item.type}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(item.query)}`)
                    }}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Search Again
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 