import { NextResponse } from 'next/server'
import { searchGames } from '@/app/lib/searchGames'
import { jsonSources } from '@/app/config/sources'

// Define a type for the request body
type DiscordSearchRequest = {
  query: string;
  limit?: number;
  sources?: string[];
}

// Enable debug logging in production
const DEBUG = process.env.NODE_ENV !== 'production'

function log(...args: any[]) {
  if (DEBUG) {
    console.log('[Discord API]', ...args)
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()
  
  try {
    log('Received request')
    
    // Parse the request body
    let body: DiscordSearchRequest
    try {
      body = await request.json()
      log('Parsed body:', JSON.stringify(body, null, 2))
    } catch (e) {
      log('Error parsing JSON:', e)
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      )
    }
    
    // Validate the request
    if (!body.query || typeof body.query !== 'string') {
      log('Invalid query parameter')
      return NextResponse.json(
        { 
          success: false,
          error: 'Query parameter is required and must be a string',
          received: typeof body.query
        }, 
        { status: 400 }
      )
    }
    
    const query = body.query.trim()
    if (query.length < 2) {
      log('Query too short')
      return NextResponse.json(
        { 
          success: false,
          error: 'Query must be at least 2 characters long',
          queryLength: query.length
        }, 
        { status: 400 }
      )
    }

    // Set default limit if not provided
    const limit = Math.min(Number(body.limit) || 5, 10) // Max 10 results
    const sources = Array.isArray(body.sources) ? body.sources : []
    
    log(`Searching for: "${query}" with limit: ${limit}, sources:`, sources)

    try {
      log('Available sources:', jsonSources.map(s => s.name))
      
      // First, try direct Hydra API call for debugging
      log('Trying direct Hydra API call...')
      const hydraResponse = await fetch('https://hydra-api-us-east-1.losbroxas.org/catalogue/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: query, take: 5, skip: 0 })
      })
      
      const hydraData = await hydraResponse.json()
      log('Direct Hydra API response:', JSON.stringify(hydraData, null, 2))
      
      if (!hydraData || !hydraData.edges || !Array.isArray(hydraData.edges)) {
        log('Unexpected Hydra API response format')
      } else {
        log(`Hydra API found ${hydraData.edges.length} games`)
      }
      
      // Then try our search function
      log('Calling searchGames...')
      const results = await searchGames(query, sources)
      log(`Search completed, found ${results.length} results`)
      
      if (results.length === 0) {
        log('No results found from searchGames')
      } else {
        log('Sample result:', JSON.stringify(results[0], null, 2))
      }

      // Format the results for Discord
      const formattedResults = results.slice(0, limit).map(game => ({
        title: game.name,
        image: game.image || null,
        genres: game.genres || [],
        sources: (game.sources || []).map(source => ({
          name: source.name,
          url: source.url,
          uploadDate: source.uploadDate,
          fileSize: source.fileSize
        }))
      }))

      const responseData = {
        success: true,
        query: query,
        results: formattedResults,
        count: formattedResults.length,
        totalResults: results.length,
        processingTime: Date.now() - startTime
      }

      log('Sending response with', formattedResults.length, 'results')
      
      return new NextResponse(JSON.stringify(responseData), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      })

    } catch (searchError) {
      const error = searchError as Error
      console.error('Error in searchGames:', error)
      log('Search error details:', error.stack || error.message)
      
      return new NextResponse(JSON.stringify({
        success: false, 
        error: 'Search failed',
        message: error.message,
        query: query,
        processingTime: Date.now() - startTime
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
  } catch (error) {
    const err = error as Error
    console.error('Unexpected error in Discord search API:', err)
    
    return new NextResponse(JSON.stringify({
      success: false, 
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      processingTime: Date.now() - startTime
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
