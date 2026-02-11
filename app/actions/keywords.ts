
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { scrapeGoogle } from "@/utils/scraper";

// Helper to estimate volume using LLM (since we don't have paid API)
async function estimateKeywordMetrics(keyword: string) {
    const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
    const baseURL = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
    const modelName = process.env.LLM_MODEL || "gpt-3.5-turbo";

    if (!apiKey) return { volume: 0, difficulty: "Unknown" };

    const prompt = `
      You are an SEO Data Estimator.
      Task: Estimate the monthly Search Volume and Keyword Difficulty (High/Med/Low) for the keyword: "${keyword}".
      
      Based on your knowledge, provide a realistic numeric estimate for Global Volume.
      
      Return ONLY valid JSON: {"volume": number, "difficulty": "High" | "Medium" | "Low"}
    `;

    try {
        const response = await fetch(`${baseURL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1
            })
        });

        const data = await response.json();
        const contentRaw = data.choices?.[0]?.message?.content || "";
        // Try to extract JSON if embedded
        const jsonMatch = contentRaw.match(/\{[\s\S]*\}/);
        const content = jsonMatch ? jsonMatch[0] : contentRaw;

        try {
            return JSON.parse(content);
        } catch {
            return { volume: 0, difficulty: "Medium" };
        }
    } catch (e) {
        console.error("LLM Estimate Error:", e);
        return { volume: 0, difficulty: "Medium" };
    }
}

export async function addKeyword(prevState: any, formData: FormData) {
    const supabase = await createClient();

    // 1. Get User
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { message: "Unauthorized", success: false };
    }

    const keyword = formData.get("keyword") as string;
    if (!keyword) {
        return { message: "Keyword is required", success: false };
    }

    try {
        // 2. Get Project Domain (Assuming 1 project per user for MVP)
        const { data: project } = await supabase
            .from("seo_projects")
            .select("id, domain")
            .eq("user_id", user.id)
            .single();

        if (!project) {
            return { message: "Project not found. Please create a project first.", success: false };
        }

        const domain = project.domain.replace(/^https?:\/\//, '').replace(/\/$/, ''); // clean domain

        // 3. REAL Data Fetching (No Mock)

        // A. Estimate Volume/Difficulty via AI
        const metrics = await estimateKeywordMetrics(keyword);

        // B. Scrape Google for REAL Ranking
        // We scrape top 50 results to find the user's position
        const serpResults = await scrapeGoogle(keyword, 50);

        let currentRank = 0; // 0 means not found in top 50
        const myResult = serpResults.find(r => r.link.includes(domain));

        if (myResult) {
            currentRank = myResult.rank;
        }

        // 4. Insert into DB
        const { error } = await supabase.from("seo_keywords").insert({
            project_id: project.id,
            keyword: keyword,
            volume: metrics.volume,
            difficulty: metrics.difficulty,
            current_rank: currentRank,
            target_url: myResult ? myResult.link : `https://${domain}`, // If found, use the ranking URL
            history: [{ date: new Date().toISOString(), rank: currentRank }] // Init history
        });

        if (error) {
            console.error(error);
            return { message: "Failed to add keyword", success: false };
        }

        revalidatePath("/dashboard/keywords");
        return { message: `Added "${keyword}" (Rank #${currentRank > 0 ? currentRank : '>50'})`, success: true };

    } catch (error: any) {
        return { message: error.message, success: false };
    }
}

export async function deleteKeyword(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id");

    await supabase.from("seo_keywords").delete().eq("id", id);
    revalidatePath("/dashboard/keywords");
}
