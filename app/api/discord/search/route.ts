import { NextResponse } from 'next/server'
import { searchGames } from '@/app/lib/searchGames'

// Define a type for the request body
type DiscordSearchRequest = {
  query: string;
  limit?: number;
  sources?: string[];
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body: DiscordSearchRequest = await request.json()
    
    // Validate the request
    if (!body.query || typeof body.query !== 'string' || body.query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query is required and must be at least 2 characters long' }, 
        { status: 400 }
      )
    }

    // Set default limit if not provided
    const limit = Math.min(Number(body.limit) || 5, 10) // Max 10 results
    const sources = Array.isArray(body.sources) ? body.sources : []

    // Use the existing searchGames function to get results
    const results = await searchGames(body.query.trim(), sources)
    
    // Format the results for Discord
    const formattedResults = results.slice(0, limit).map(game => ({
      title: game.name,
      image: game.image || null,
      genres: game.genres,
      sources: game.sources.map(source => ({
        name: source.name,
        url: source.url,
        uploadDate: source.uploadDate,
        fileSize: source.fileSize
      }))
    }))

    // Return the results
    return new NextResponse(JSON.stringify({
      success: true,
      results: formattedResults,
      count: formattedResults.length,
      totalResults: results.length
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })

  } catch (error) {
    console.error('Error in Discord search API:', error)
    return new NextResponse(JSON.stringify({
      success: false, 
      error: 'Failed to process search request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }
}

// Add CORS headers for OPTIONS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400' // 24 hours
    }
  })
}
