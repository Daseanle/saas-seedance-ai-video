
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeGoogle } from "@/utils/scraper";

// Initialize Supabase Admin Client (Bypass RLS)
// Note: This requires SUPABASE_SERVICE_ROLE_KEY in .env.local / Vercel Env
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
    // Optional: Verify Cron Secret to prevent public abuse
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    try {
        console.log("Starting Scheduled Ranking Update...");

        // 1. Fetch all keywords with their associated Project Domain
        // We assume the relation: seo_keywords.project_id -> seo_projects.id
        const { data: keywords, error } = await supabaseAdmin
            .from("seo_keywords")
            .select(`
        id,
        keyword,
        rank,
        project_id,
        seo_projects (
          domain
        )
      `)
            .not("project_id", "is", null); // Only process keywords linked to a project

        if (error) throw error;
        if (!keywords || keywords.length === 0) {
            return NextResponse.json({ message: "No keywords to update" });
        }

        console.log(`Found ${keywords.length} keywords to update.`);

        const updates = [];

        // 2. Loop through keywords and scrape Google
        // WARNING: In a production app with 100+ keywords, this will timeout Vercel limit (10s/60s).
        // You would use a Queue (like QStash) for that. For dogfooding (<20 keywords), this loop is fine.
        for (const record of keywords) {
            const { keyword, rank: currentRank, seo_projects } = record;
            // @ts-ignore - Supabase types join handling
            const targetDomain = seo_projects?.domain?.toLowerCase().replace("https://", "").replace("http://", "").replace("www.", "").split('/')[0];

            if (!targetDomain) continue;

            // Scrape Google
            const searchResults = await scrapeGoogle(keyword);

            // Find rank of our domain
            // rank is 1-based index in results. If not found in top 10, we can assume > 10 (or keep old rank if we prefer)
            const foundItem = searchResults.find(item => item.link.includes(targetDomain));

            let newRank = currentRank;
            let velocity = 0;

            if (foundItem) {
                newRank = foundItem.rank;
                // If we found it, and we had a previous rank, calculate velocity
                // (Positive velocity means rank improved, e.g. 5 -> 3 is +2 velocity in our logic earlier? 
                // Wait, normally Rank 3 is better than 5. 
                // Let's standardize: 
                // Improvement: Old(5) - New(3) = +2. 
                // Decline: Old(3) - New(5) = -2.

                // Handle case where previous rank was null (new keyword)
                const oldRankVal = currentRank || 100;
                velocity = oldRankVal - newRank;
            } else {
                // Not found in top 10.
                // If it was previously 5, and now not in top 10, velocity is negative.
                // Let's assume "Not Found" = Rank 100 for calculation? Or just ignore velocity for now to be safe.
                // Let's just set velocity to 0 if not found to avoid weird spikes, or set rank to null?
                // Let's keep existing rank but maybe mark it? For Mvp, let's strictly update if found.
                if (currentRank && currentRank <= 10) {
                    // It dropped out of top 10
                    velocity = currentRank - 11; // Negative
                    newRank = null; // Or >10
                }
            }

            // Prepare Update
            if (foundItem || (currentRank && !foundItem)) {
                updates.push({
                    id: record.id,
                    rank: newRank || 0, // 0 or null for "not ranked"
                    prev_rank: currentRank,
                    velocity: velocity,
                    updated_at: new Date().toISOString()
                });
            }

            // Be nice to Google (Delay 1s)
            await new Promise(r => setTimeout(r, 1000));
        }

        // 3. Batch Update back to Supabase
        for (const update of updates) {
            await supabaseAdmin
                .from("seo_keywords")
                .update({
                    rank: update.rank,
                    prev_rank: update.prev_rank,
                    velocity: update.velocity,
                    updated_at: update.updated_at
                })
                .eq("id", update.id);
        }

        return NextResponse.json({
            success: true,
            processed: keywords.length,
            updated: updates.length
        });

    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
