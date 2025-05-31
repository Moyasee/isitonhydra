import { NextResponse } from 'next/server';
import { jsonSources } from '@/app/config/sources';

// Cache for source data
const sourceCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // Max requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

// Helper to check rate limits
function checkRateLimit(ip: string) {
  const now = Date.now();
  const rateLimitInfo = rateLimit.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

  if (now > rateLimitInfo.resetTime) {
    rateLimitInfo.count = 0;
    rateLimitInfo.resetTime = now + RATE_LIMIT_WINDOW;
  }

  rateLimitInfo.count++;
  rateLimit.set(ip, rateLimitInfo);

  return {
    remaining: Math.max(0, RATE_LIMIT - rateLimitInfo.count),
    resetTime: rateLimitInfo.resetTime,
    isLimited: rateLimitInfo.count > RATE_LIMIT
  };
}

// Fetch data from a source with caching
async function fetchSourceData(source: { name: string; url: string }) {
  const cached = sourceCache.get(source.name);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(source.url, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch source');
    
    const data = await response.json();
    sourceCache.set(source.name, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`Error fetching ${source.name}:`, error);
    return { downloads: [] };
  }
}

// Search for games in a source
function searchInSource(downloads: any[], query: string, sourceUrl: string) {
  const queryLower = query.toLowerCase();
  return downloads
    .filter(download => 
      download.title.toLowerCase().includes(queryLower)
    )
    .map(download => ({
      title: download.title,
      url: sourceUrl, // Return the source URL instead of magnet link
      uploadDate: download.uploadDate,
      fileSize: download.fileSize,
      sourceUrl: sourceUrl // Keep the source URL in a separate field for clarity
    }));
}

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = (forwarded || '127.0.0.1').split(',')[0].trim();

    // Check rate limit
    const rateLimitInfo = checkRateLimit(ip);
    if (rateLimitInfo.isLimited) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitInfo.resetTime - Date.now()) / 1000)
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
            'X-RateLimit-Reset': rateLimitInfo.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitInfo.resetTime - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    // Parse and validate request body
    const { query, limit = 5 } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return new NextResponse(
        JSON.stringify({ error: 'Query parameter is required and must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize the query
    const sanitizedQuery = query.slice(0, 100).trim();
    
    // Search in all sources
    const results = [];
    
    for (const source of jsonSources) {
      try {
        const sourceData = await fetchSourceData(source);
        const matches = searchInSource(sourceData.downloads || [], sanitizedQuery, source.url);
        
        if (matches.length > 0) {
          results.push({
            source: source.name,
            matches: matches.slice(0, limit)
          });
        }
      } catch (error) {
        console.error(`Error searching in ${source.name}:`, error);
      }
      
      if (results.length >= limit) break;
    }

    // Format the response
    const response = {
      query: sanitizedQuery,
      results: results.flatMap(r => r.matches).slice(0, limit)
    };

    return new NextResponse(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
          'X-RateLimit-Reset': rateLimitInfo.resetTime.toString(),
        }
      }
    );

  } catch (error) {
    console.error('Error in Discord search API:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
