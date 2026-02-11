
import { NextResponse } from "next/server";
import axios from "axios";
import { parseStringPromise } from "xml2js";

const TARGET_SUBREDDITS = [
    "SaaS",
    "Entrepreneur",
    "marketing",
    "seo",
    "content_marketing",
    "bigseo",
    "growthhacking",
    "startups"
];

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const keywords = body.keywords || "";
        const searchTerms = keywords
            ? keywords.split(",").map((k: string) => k.trim().toLowerCase())
            : ["seo", "tool", "keyword"];

        // Limit to 5 subs at a time to be polite
        const subsToScan = TARGET_SUBREDDITS.slice(0, 5);

        const tasks = subsToScan.map(async (sub) => {
            try {
                // Reddit RSS Feed URL
                const url = `https://www.reddit.com/r/${sub}/new/.rss`;

                const response = await axios.get(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    },
                    timeout: 5000
                });

                if (!response.data) return [];

                // Parse XML
                const result = await parseStringPromise(response.data);

                // Atom format: <feed><entry>...</entry></feed>
                const entries = result.feed?.entry || [];

                const relevantPosts: any[] = [];

                for (const entry of entries) {
                    const title = entry.title?.[0] || "";
                    const content = entry.content?.[0]?._ || ""; // content type="html" usually in _ property
                    const link = entry.link?.[0]?.$.href || "";
                    const updated = entry.updated?.[0] || "";

                    // Simple keyword matching
                    const textToSearch = (title + " " + content).toLowerCase();
                    const isMatch = searchTerms.some((term: string) => textToSearch.includes(term));

                    if (isMatch) {
                        relevantPosts.push({
                            id: entry.id?.[0],
                            title,
                            link,
                            updated,
                            subreddit: sub,
                            preview: content.replace(/<[^>]*>/g, '').substring(0, 150) + "..."
                        });
                    }
                }

                return relevantPosts;
            } catch (e) {
                console.error(`Error scanning r/${sub}:`, e);
                return [];
            }
        });

        const results = await Promise.all(tasks);
        // Flatten and sort by newest
        const flatResults = results.flat().sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());

        return NextResponse.json({
            subsScanned: subsToScan,
            count: flatResults.length,
            posts: flatResults
        });

    } catch (error: any) {
        console.error("Reddit Monitor Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
