
import { NextResponse } from "next/server";
import { scrapeGoogle, analyzeBrandMentions } from "@/utils/scraper";

export async function POST(request: Request) {
    try {
        const { keyword, brand } = await request.json();

        if (!keyword || !brand) {
            return NextResponse.json({ error: "Missing keyword/brand" }, { status: 400 });
        }

        // 1. Perform REAL Google Search (using our scraper)
        // Note: This might take 2-3 seconds depending on network
        const searchResults = await scrapeGoogle(keyword);

        // 2. Perform Keyword Analysis (Local heuristic)
        // Analyze Google results for brand mentions
        const brandAnalysis = analyzeBrandMentions(searchResults, brand);

        // 3. Construct "AI-Engine-Like" Result format
        // Since we only scrape Google for now, we simulate other engines based on Google's signals 
        // or simply reuse the Google data as a proxy for "AI Search visibility".
        // In a real production app, we would scrape Bing/Perplexity separately.

        // Calculate visibility based on real mentions
        const googleVisibility = brandAnalysis.total_results > 0
            ? Math.round((brandAnalysis.mentions_count / brandAnalysis.total_results) * 100)
            : 0;

        // Simulate AI behavior: If brand is visible in top Google results, it's likely visible to LLMs trained on web data.
        // If not visible in Google top 10, LLMs likely won't mention it unless forced.

        const analysisResult = {
            keyword,
            brand,
            engines: [
                {
                    name: "Google Search (Live)",
                    visibility: googleVisibility,
                    sentiment: brandAnalysis.sentiment,
                    mention: brandAnalysis.mentions_count > 0,
                    snippet: brandAnalysis.top_result
                        ? `Found in result #${brandAnalysis.top_result.rank}: "${brandAnalysis.top_result.title}"`
                        : `Brand "${brand}" not found in top ${brandAnalysis.total_results} results for "${keyword}".`
                },
                {
                    name: "New Bing (GPT-4)",
                    visibility: Math.min(100, Math.floor(googleVisibility * 1.1)), // Bing is often similar to Google
                    sentiment: brandAnalysis.sentiment === "Positive" ? "Positive" : "Neutral",
                    mention: brandAnalysis.mentions_count > 0,
                    snippet: brandAnalysis.mentions_count > 0
                        ? `AI likely summarizes positive mentions found in search index.`
                        : `AI search unlikely to surface brand due to low SERP visibility.`
                },
                {
                    name: "Perplexity AI",
                    visibility: Math.min(100, Math.floor(googleVisibility * 0.9)),
                    sentiment: brandAnalysis.sentiment === "Positive" ? "Positive" : "Neutral",
                    mention: brandAnalysis.mentions_count > 0, // Correlation
                    snippet: `Based on SERP data, Perplexity would direct users to ${brandAnalysis.mentions_count > 0 ? "your brand" : "competitors"}.`
                }
            ],
            recommendations: [
                googleVisibility === 0
                    ? `Urgent: Your brand is invisible for "${keyword}". Create dedicated content targeting this term.`
                    : `Improve snippet CTR: Your current title "${brandAnalysis.top_result?.title.substring(0, 20)}..." could be catchier.`,
                `Add structured data (FAQ Schema) to increase chances of being picked up by AI overviews.`,
                `Monitor competitor backlinks for "${keyword}" to boost authority.`
            ]
        };

        return NextResponse.json(analysisResult);
    } catch (error) {
        console.error("Analysis API Error:", error);
        return NextResponse.json(
            { error: "Failed to analyze data" },
            { status: 500 }
        );
    }
}
