
import { NextResponse } from "next/server";
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: "Missing URL" }, { status: 400 });
        }

        // 1. Scrape Homepage
        const headers = {
            'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        };

        const response = await axios.get(url, { headers, timeout: 10000 });
        const $ = cheerio.load(response.data);

        const title = $('title').text();
        const links: any[] = [];

        // 2. Discover Links (Naive Algorithm)
        // Look for links that are likely blog posts (contain /blog/, /article/, or long paths)
        $('a').each((_, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();

            if (href && text && text.length > 10 && !href.includes('#')) {
                // Filter logic
                if (href.includes('/blog/') || href.includes('/news/') || href.split('/').length > 3) {
                    // Resolve relative URLs
                    const fullUrl = href.startsWith('http') ? href : new URL(href, url).toString();

                    // Avoid duplicates
                    if (!links.find(l => l.url === fullUrl)) {
                        links.push({
                            text,
                            url: fullUrl
                        });
                    }
                }
            }
        });

        return NextResponse.json({
            domain: url,
            title,
            recentLinks: links.slice(0, 10) // Return top 10 potential articles
        });

    } catch (error: any) {
        return NextResponse.json({ error: "Failed to spy on competitor: " + error.message }, { status: 500 });
    }
}
