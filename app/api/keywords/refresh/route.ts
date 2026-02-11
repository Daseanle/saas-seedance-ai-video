
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { scrapeGoogle } from "@/utils/scraper";

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        // Fetch all keywords (Should batch this in real app)
        const { data: keywords, error } = await supabase
            .from("seo_keywords")
            .select("*")
            .limit(50); // Limit to avoid timeout in serverless

        if (!keywords) return NextResponse.json({ updated: 0 });

        let updatedCount = 0;

        // Process each keyword
        // Parallel execution might hit rate limits, so we do it gently
        const updates = keywords.map(async (kw: any) => {
            try {
                // Scrape Rank
                const serp = await scrapeGoogle(kw.keyword, 50);

                // Find rank
                let newRank = 0;
                // If target_url, match domain; otherwise use user's project domain if possible
                const targetDomain = kw.target_url ? new URL(kw.target_url).hostname : "";

                const myResult = serp.find(r => targetDomain && r.link.includes(targetDomain));
                if (myResult) newRank = myResult.rank;

                // Update DB with History
                const oldHistory = kw.history || [];
                // Only add history if day changed
                const today = new Date().toISOString().split('T')[0];
                const lastEntryDate = oldHistory.length > 0 ? oldHistory[oldHistory.length - 1].date.split('T')[0] : "";

                if (today !== lastEntryDate) {
                    oldHistory.push({ date: new Date().toISOString(), rank: newRank });
                } else {
                    // Update today's entry
                    oldHistory[oldHistory.length - 1].rank = newRank;
                }

                // Limit history length? Maybe keep last 90 days.
                if (oldHistory.length > 90) oldHistory.shift();

                await supabase
                    .from("seo_keywords")
                    .update({
                        current_rank: newRank,
                        history: oldHistory,
                        target_url: myResult ? myResult.link : kw.target_url // Update target URL if changed
                    })
                    .eq("id", kw.id);

                updatedCount++;
            } catch (e) {
                console.error(`Failed to update keyword ${kw.keyword}:`, e);
            }
        });

        await Promise.all(updates);

        return NextResponse.json({ success: true, updated: updatedCount });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
