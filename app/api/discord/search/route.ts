import { NextResponse } from 'next/server';
import { searchGames } from '@/app/lib/searchGames';

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // Max requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): { limited: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const rateLimitInfo = rateLimit.get(ip);

  if (!rateLimitInfo) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { limited: false, remaining: RATE_LIMIT - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }

  // Reset the counter if the window has passed
  if (now > rateLimitInfo.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { limited: false, remaining: RATE_LIMIT - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }

  // Check if rate limit is exceeded
  if (rateLimitInfo.count >= RATE_LIMIT) {
    return { 
      limited: true, 
      remaining: 0, 
      resetTime: rateLimitInfo.resetTime 
    };
  }

  // Increment the counter
  rateLimit.set(ip, { 
    count: rateLimitInfo.count + 1, 
    resetTime: rateLimitInfo.resetTime 
  });

  return { 
    limited: false, 
    remaining: RATE_LIMIT - (rateLimitInfo.count + 1), 
    resetTime: rateLimitInfo.resetTime 
  };
}

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = (forwarded || '127.0.0.1').split(',')[0].trim();

    // Check rate limit
    const rateLimitStatus = isRateLimited(ip);
    if (rateLimitStatus.limited) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimitStatus.resetTime - Date.now()) / 1000)
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': rateLimitStatus.remaining.toString(),
            'X-RateLimit-Reset': rateLimitStatus.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitStatus.resetTime - Date.now()) / 1000).toString(),
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
    const sanitizedQuery = query.slice(0, 100).trim(); // Limit query length
    
    // Search for games
    const results = await searchGames(sanitizedQuery);
    
    // Format the response
    const formattedResults = results.slice(0, limit).map(game => ({
      name: game.name,
      lastUpdated: Math.max(
        ...game.sources.map(source => new Date(source.uploadDate).getTime())
      ),
      sources: game.sources.map(source => ({
        name: source.name,
        url: source.url,
        uploadDate: source.uploadDate,
        fileSize: source.fileSize,
        additionalUrls: source.additional_urls || []
      }))
    }));

    // Set security headers
    const headers = {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'X-RateLimit-Limit': RATE_LIMIT.toString(),
      'X-RateLimit-Remaining': rateLimitStatus.remaining.toString(),
      'X-RateLimit-Reset': rateLimitStatus.resetTime.toString(),
    };

    return new NextResponse(
      JSON.stringify({ results: formattedResults }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Error in Discord search API:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
