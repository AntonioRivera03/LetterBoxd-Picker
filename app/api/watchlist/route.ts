import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');
  const page = searchParams.get('page') || '1';

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const url = `https://letterboxd.com/${username}/watchlist/page/${page}/`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      // If 404, it likely means the page doesn't exist (end of list or bad user)
      if (response.status === 404) {
        return NextResponse.json({ movies: [], hasNextPage: false });
      }
      return NextResponse.json({ error: `Failed to fetch from Letterboxd: ${response.statusText}` }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const movies: string[] = [];

    // User provided selector
    const movieElements = $('div.react-component[data-component-class="LazyPoster"]');

    movieElements.each((_, element) => {
      let title = $(element).attr('data-item-full-display-name');

      // Fallback as requested
      if (!title) {
        title = $(element).attr('itemFullDisplayName');
      }

      if (title) {
        movies.push(title);
      }
    });

    return NextResponse.json({
      movies,
      hasNextPage: movies.length > 0
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
