
import { NextResponse } from "next/server";
import { scrapeGoogle } from "@/utils/scraper";

export async function POST(request: Request) {
    try {
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json({ error: "Missing query" }, { status: 400 });
        }

        // 1. Scrape Google SERP (Top 5)
        const googleResults = await scrapeGoogle(query);
        const topResults = googleResults.slice(0, 5);

        // 2. Generate AI Answer (Simulating Perplexity/ChatGPT)
        let answer = "";

        // Environment Variables specific for LLM (NVIDIA or OpenAI)
        const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
        const baseURL = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
        const modelName = process.env.LLM_MODEL || "gpt-3.5-turbo";

        if (apiKey) {
            // Use Real LLM
            const prompt = `
          Context (Search Results):
          ${topResults.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}
          
          User Question: "${query}"
          
          Task: Answer the user question based ONLY on the context provided. Cite sources if possible.
          Style: Like Perplexity/ChatGPT. Keep it concise, professional, and highlight brands mentioned in the context.
        `;

            try {
                const openAIResponse = await fetch(`${baseURL}/chat/completions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: modelName,
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.7,
                        max_tokens: 500
                    })
                });

                const data = await openAIResponse.json();
                answer = data.choices?.[0]?.message?.content || "Running LLM failed to generate answer.";
            } catch (e) {
                console.error("LLM API Error:", e);
                answer = "Error connecting to AI service.";
            }
        } else {
            // Fallback Mock Answer (without API cost)
            answer = `(Simulation Mode - Configure LLM_API_KEY for real AI generation)\n\n` +
                `Based on the top search results, here is a summary answer for "${query}":\n\n` +
                `According to ${topResults[0]?.title || "sources"}, the most relevant information suggests key factors include important SEO considerations.\n` +
                `- ${topResults[0]?.snippet || "N/A"}\n` +
                `- ${topResults[1]?.snippet || "N/A"}\n\n` +
                `For a comprehensive understanding, you should review content from these authoritative domains.`;
        }

        return NextResponse.json({
            sources: topResults,
            answer
        });

    } catch (error: any) {
        console.error("Simulation API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
