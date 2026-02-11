
import axios from 'axios';
import * as cheerio from 'cheerio';

interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    rank: number;
}

interface PageContent {
    title: string;
    headings: { h1: string[]; h2: string[]; h3: string[] };
    text: string;
    metaDescription: string;
    wordCount: number;
    schema: any[]; // JSON-LD
}

// 1. Scrape Google SERP
export async function scrapeGoogle(query: string, num: number = 10): Promise<SearchResult[]> {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${num}&hl=en`;

    // Use a rotating User-Agent list to mimic real browsers
    const userAgents = [
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    ];

    const headers = {
        'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
    };

    try {
        const response = await axios.get(url, { headers });
        const $ = cheerio.load(response.data);
        const results: SearchResult[] = [];

        $('.g').each((i, element) => {
            const title = $(element).find('h3').first().text();
            const link = $(element).find('a').first().attr('href');
            const snippet = $(element).find('.VwiC3b, .yXK7lf, .MUxGbd, .IsZvec').first().text();

            if (title && link && !link.startsWith('/search')) {
                results.push({
                    title,
                    link,
                    snippet: snippet || "No snippet available",
                    rank: i + 1,
                });
            }
        });

        return results.slice(0, num);
    } catch (error) {
        console.error("Scraping error:", error);
        return [];
    }
}

// 2. Scrape Individual Page Content (NEW for Audit)
export async function scrapePageContent(url: string): Promise<PageContent | null> {
    try {
        // Basic anti-bot headers
        const headers = {
            'User-Agent': "Mozilla/5.0 (compatible; SEOVelocityBot/1.0; +http://yoursite.com)",
        };

        const response = await axios.get(url, { headers, timeout: 10000 }); // 10s timeout
        const $ = cheerio.load(response.data);

        // Remove scripts, styles, and ads to get clean text
        $('script, style, nav, footer, iframe, .ads, .advertisement').remove();

        const title = $('title').text().trim();
        const metaDescription = $('meta[name="description"]').attr('content') || "";

        // Extract Headings
        const headings = {
            h1: $('h1').map((_, el) => $(el).text().trim()).get(),
            h2: $('h2').map((_, el) => $(el).text().trim()).get(),
            h3: $('h3').map((_, el) => $(el).text().trim()).get(),
        };

        // Extract Schema (JSON-LD) for GEO analysis
        const schema: any[] = [];
        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const json = JSON.parse($(el).html() || '{}');
                schema.push(json);
            } catch (e) {
                // ignore invalid json
            }
        });

        // Get main content text (naive approach: get all body text)
        // In a pro tool, we'd use Mozilla's Readability library to extract just the article
        const text = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 15000); // Limit to 15k chars for LLM context window

        return {
            title,
            headings,
            text, // Truncated text
            metaDescription,
            wordCount: text.split(' ').length,
            schema
        };

    } catch (error) {
        console.error(`Error scraping page ${url}:`, error);
        return null; // Return null if failed (e.g. 403 Forbidden)
    }
}

// 3. Simple Analysis (Reused from before)
export function analyzeBrandMentions(results: SearchResult[], brandName: string) {
    const brandLower = brandName.toLowerCase();

    let mentions = 0;
    let sentimentScore = 0;

    results.forEach(result => {
        const text = (result.title + " " + result.snippet).toLowerCase();
        if (text.includes(brandLower)) {
            mentions++;
            if (text.match(/best|top|good|great|recommend|leading/)) sentimentScore += 1;
            if (text.match(/bad|worst|avoid|scam|slow|poor/)) sentimentScore -= 1;
        }
    });

    const visibility = Math.round((mentions / results.length) * 100);

    let sentiment = "Neutral";
    if (sentimentScore > 0) sentiment = "Positive";
    if (sentimentScore < 0) sentiment = "Negative";
    if (results.length === 0) sentiment = "Unknown (Blocked)";

    return {
        visibility,
        sentiment,
        mentions_count: mentions,
        total_results: results.length,
        top_result: results.find(r => (r.title + r.snippet).toLowerCase().includes(brandLower))
    };
}
