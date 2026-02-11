
import { NextResponse } from "next/server";
import axios from "axios";

async function generatePostContent(title: string, keyword: string, description: string, geo?: string) {
    const apiKey = process.env.LLM_API_KEY;
    const baseURL = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
    const modelName = "llama-3.3-70b-versatile";

    // Inject GEO localization if provided
    const geoContext = geo && geo !== "Global" ? `IMPORTANT: This article targets the ${geo} market. Use localized language/slang if appropriate and mention local context.` : "";

    const prompt = `
        You are a Premium Content Writer. 
        Write a high-quality blog post in Next.js TSX format.
        Title: ${title}
        Target Keyword: ${keyword}
        Goal: Rank #1 on Google.
        ${geoContext}
        
        Requirements:
        1. Use Tailwind CSS for styling (prose-slate style).
        2. Include a catchy H1 and 3 SEO-optimized H2 headings.
        3. Content length: ~800 words of expert analysis.
        4. Focus on User Intent: ${description}
        5. Return ONLY the code block starting from "import React...".
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
                temperature: 0.7
            })
        });

        const data = await response.json();
        const rawCode = data.choices?.[0]?.message?.content || "";
        return rawCode.replace(/```tsx/g, '').replace(/```/g, '').trim();
    } catch (e) {
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const { idea, siteConfig, filePath } = await request.json();
        const { title, keyword, description } = idea;

        // 1. Generate Deep Content with GEO context
        const postBody = await generatePostContent(title, keyword, description, siteConfig.target_geo);
        if (!postBody) throw new Error("AI failed to generate content.");

        // 2. Prepare GitHub Commit using Dynamic Config
        const token = process.env.GITHUB_TOKEN;
        const repo = siteConfig.repo_path; // Use the repo from DB
        const branch = "main";

        if (!token || !repo) {
            throw new Error("Missing GitHub credentials or target repo.");
        }

        const contentBase64 = Buffer.from(postBody).toString('base64');
        const url = `https://api.github.com/repos/${repo}/contents/${filePath}`;

        // Get existing file SHA if updating
        let sha = null;
        try {
            const checkResp = await axios.get(url, {
                headers: { "Authorization": `token ${token}` }
            });
            sha = checkResp.data.sha;
        } catch (e) { }

        const body: any = {
            message: `🚀 SEO Autopilot: Published "${title}" [via SEO Velocity]`,
            content: contentBase64,
            branch: branch
        };
        if (sha) body.sha = sha;

        await axios.put(url, body, {
            headers: {
                "Authorization": `token ${token}`,
                "Accept": "application/vnd.github.v3+json"
            }
        });

        return NextResponse.json({ success: true, path: filePath });

    } catch (error: any) {
        console.error("GitHub API Error:", error.response?.data || error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
