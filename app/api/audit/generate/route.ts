
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { topic, keyword, context } = await request.json();

        if (!topic || !keyword) {
            return NextResponse.json({ error: "Missing topic or keyword" }, { status: 400 });
        }

        // Use Environment Variables (NVIDIA/Groq/OpenAI)
        const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
        const baseURL = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
        const modelName = process.env.LLM_MODEL || "gpt-3.5-turbo";

        if (!apiKey) {
            return NextResponse.json({
                content: `(Simulation) Here is a generated paragraph about "${topic}" optimized for "${keyword}". \n\n` +
                    `To unlock real AI generation, please configure LLM_API_KEY in Vercel settings.`
            });
        }

        const prompt = `
      You are an expert SEO Content Writer.
      
      Task: Write a single, highly optimized paragraph (150-200 words) about "${topic}".
      Target Keyword: "${keyword}"
      Context: This paragraph will be added to an existing article about "${keyword}".
      Style: Professional, informative, and engaging. Match the tone of the existing content if provided.
      
      Requirements:
      1. Use the term "${topic}" naturally.
      2. Answer potential user questions about this topic directly (for GEO optimization).
      3. Use active voice.
      
      Existing Content snippet for style reference: "${context?.substring(0, 200) || "N/A"}..."
      
      Output ONLY the paragraph text. No intro, no outro.
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
                    temperature: 0.7,
                    max_tokens: 400
                })
            });

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || "Failed to generate content.";

            return NextResponse.json({ content });

        } catch (error: any) {
            console.error("LLM Generation Error:", error);
            return NextResponse.json({ error: "Failed to connect to LLM" }, { status: 500 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
