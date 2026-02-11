
import { NextResponse } from "next/server";
import { scrapeGoogleSuggest } from "@/utils/suggester";

export async function POST(request: Request) {
    try {
        const { seed } = await request.json();

        if (!seed) {
            return NextResponse.json({ error: "Missing seed keyword" }, { status: 400 });
        }

        // Call scrapeGoogleSuggest
        // This will take about 2-3 seconds to query 27 endpoints (Root + a-z)
        const suggestions = await scrapeGoogleSuggest(seed);

        // Sort by length or just relevance
        // Usually shorter suggestions are higher volume, longer are lower competition

        // We can use simple heuristic: if it contains "best", "top", "review", "vs", "guide", it's high intent.
        const scoredSuggestions = suggestions.map(s => {
            let score = 50;
            if (s.keyword.includes("best") || s.keyword.includes("top")) score += 20; // Buying intent
            if (s.keyword.includes("review") || s.keyword.includes("vs")) score += 15; // Investigational
            if (s.keyword.includes("pdf") || s.keyword.includes("free")) score -= 10; // Low value

            return { ...s, score };
        });

        return NextResponse.json({
            seed,
            count: scoredSuggestions.length,
            suggestions: scoredSuggestions.sort((a, b) => b.score - a.score).slice(0, 100) // Top 100
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
