import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

async function searchPubMed(query: string) {
  // First, search for relevant articles
  const searchUrl = `${config.api.pubmed.baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(
    query
  )}&retmax=5&format=json&api_key=${config.api.pubmed.apiKey}`

  const searchRes = await fetch(searchUrl)
  const searchData = await searchRes.json()
  const ids = searchData.esearchresult.idlist

  if (!ids.length) {
    return []
  }

  // Then, fetch the details of those articles
  const summaryUrl = `${config.api.pubmed.baseUrl}/esummary.fcgi?db=pubmed&id=${ids.join(
    ','
  )}&format=json&api_key=${config.api.pubmed.apiKey}`

  const summaryRes = await fetch(summaryUrl)
  const summaryData = await summaryRes.json()

  // Transform the results into our format
  return Object.values(summaryData.result).filter(Boolean).map((article: any) => ({
    title: article.title,
    summary: article.abstract || 'No abstract available',
    sources: [
      `${config.appUrl}/research/${article.uid}`,
      ...(article.elocationid ? [article.elocationid] : []),
    ],
  }))
}

export async function POST(req: Request) {
  try {
    const { query, type } = await req.json()

    if (!query) {
      return NextResponse.json(
        { message: 'Query is required' },
        { status: 400 }
      )
    }

    // For now, we handle both text and image searches the same way
    // In the future, we might want to process image searches differently
    const results = await searchPubMed(query)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 