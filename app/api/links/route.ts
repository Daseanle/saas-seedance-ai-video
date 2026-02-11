
import { NextResponse } from "next/server";
import { scrapeGoogle } from "@/utils/scraper";

export async function POST(request: Request) {
    try {
        const { targetUrl, keyword, domain } = await request.json();

        if (!targetUrl || !keyword || !domain) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // 1. Search for internal link opportunities
        // Query: site:domain.com "keyword" -site:targetUrl
        // This finds pages on your site that mention the keyword but are NOT the target page itself.
        const query = `site:${domain} "${keyword}"`;

        // We scrape Google to find these pages
        const results = await scrapeGoogle(query);

        // Filter out the target URL itself
        // Normalize URLs for comparison (remove protocol and trailing slash)
        const normalizedTarget = targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

        const opportunities = results.filter(r => {
            const normalizedLink = r.link.replace(/^https?:\/\//, '').replace(/\/$/, '');
            return !normalizedLink.includes(normalizedTarget); // Exclude self
        });

        return NextResponse.json({
            opportunities: opportunities.map(o => ({
                title: o.title,
                url: o.link,
                snippet: o.snippet,
                context: `Found mention of "${keyword}" in snippet: ...${o.snippet}...`
            }))
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
