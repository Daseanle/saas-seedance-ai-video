
import { NextResponse } from "next/server";
import { scrapePageContent } from "@/utils/scraper";

export async function POST(request: Request) {
    try {
        const { userUrl, competitorUrl, keyword } = await request.json();

        if (!userUrl || !keyword) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Parallel Scraping
        const [userPage, competitorPage] = await Promise.all([
            scrapePageContent(userUrl),
            competitorUrl ? scrapePageContent(competitorUrl) : Promise.resolve(null)
        ]);

        if (!userPage) {
            return NextResponse.json({ error: "Failed to scrape your URL. Is it public?" }, { status: 400 });
        }

        // 2. Prepare Data for Analysis
        const userWordCount = userPage.wordCount;
        const competitorWordCount = competitorPage?.wordCount || 0;

        // Extract H2s and H3s
        const userStructure = [...userPage.headings.h2, ...userPage.headings.h3];
        const competitorStructure = competitorPage ? [...competitorPage.headings.h2, ...competitorPage.headings.h3] : [];

        // 3. AI Analysis (Supporting NVIDIA / Custom API)
        let aiAnalysisResult = {
            score: 50,
            summary: "Comparison complete. See details below.",
            missingEntities: ["(Waiting for LLM analysis...)"],
            pros: ["Good word count"],
            cons: ["Could be better optimized"]
        };

        // Use LLM_API_KEY from env (NVIDIA or OpenAI)
        const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
        const baseURL = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
        const modelName = process.env.LLM_MODEL || "gpt-3.5-turbo";

        if (apiKey) {
            try {
                const prompt = `
          You are an expert SEO Content Auditor.
          Target Keyword: "${keyword}"
          
          Analyze the following two content structures and text samples.
          
          User Content (Title: ${userPage.title}):
          Headings: ${JSON.stringify(userStructure.slice(0, 30))}
          Text Sample: ${userPage.text.substring(0, 1500)}...
          
          Competitor Content (Title: ${competitorPage?.title || "N/A"}):
          Headings: ${JSON.stringify(competitorStructure.slice(0, 30))}
          Text Sample: ${competitorPage?.text.substring(0, 1500) || "N/A"}...
          
          Task:
          1. Identify specific "Semantic Entities" or topics that the Competitor covers but the User misses. Focus on technical terms relevant to the keyword.
          2. Give a Score (0-100) based on relevance and depth.
          3. List Pros and Cons of User's content structure.
          
          IMPORTANT: Return ONLY valid JSON format. Do not use markdown code blocks. The JSON structure: 
          { "score": number, "summary": string, "missingEntities": string[], "pros": string[], "cons": string[] }
        `;

                const openAIResponse = await fetch(`${baseURL}/chat/completions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: modelName,
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.2, // Low temp for structured output
                        max_tokens: 1000
                    })
                });

                const aiData = await openAIResponse.json();
                const content = aiData?.choices?.[0]?.message?.content;

                if (content) {
                    // Robust Parsing: Remove markdown formatting if present
                    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
                    try {
                        const parsed = JSON.parse(cleanContent);
                        aiAnalysisResult = { ...aiAnalysisResult, ...parsed };
                    } catch (e) {
                        console.error("JSON Parse Error:", e);
                        // Fallback: Try to extract JSON from text if parsing fails
                        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            aiAnalysisResult = { ...aiAnalysisResult, ...JSON.parse(jsonMatch[0]) };
                        }
                    }
                }
            } catch (e) {
                console.error("LLM API Error:", e);
                // Fallback to heuristic
            }
        } else {
            // Fallback Heuristic Analysis (No API Key)
            console.log("No API Key found, using heuristic fallback.");
            const keywordRegex = new RegExp(keyword, 'gi');
            const userDensity = (userPage.text.match(keywordRegex) || []).length;

            aiAnalysisResult.score = Math.min(100, 50 + (userDensity > 0 ? 10 : 0) + (userWordCount > 500 ? 10 : 0) + (userStructure.length > 5 ? 10 : 0));
            aiAnalysisResult.summary = `Your content has ${userWordCount} words vs competitor's ${competitorWordCount}. You mentioned the keyword ${userDensity} times. configure LLM_API_KEY for deeper insights.`;
            aiAnalysisResult.missingEntities = competitorPage ?
                competitorStructure.filter(h => !userPage.text.includes(h.split(' ')[0])).slice(0, 5) :
                ["Add more sub-headings", "Cover related FAQs"];
        }

        return NextResponse.json({
            ...aiAnalysisResult,
            userWordCount,
            competitorWordCount,
            userStructure,
            competitorStructure,
            userTitle: userPage.title,
            competitorTitle: competitorPage?.title
        });

    } catch (error: any) {
        console.error("Audit API Error:", error);
        return NextResponse.json({ error: error.message || "Analysis failed" }, { status: 500 });
    }
}
