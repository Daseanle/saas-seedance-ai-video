
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// HARDCODED LOCAL PATH (Based on your input)
const TARGET_ROOT = "/Volumes/MOVESPEED/下载/AIcode/Mywebsite/KunlunGrowth/website";

export async function POST(request: Request) {
    try {
        const { type, filePath, content } = await request.json();

        // Security Check: Only allow local paths in Dev mode usually, but here we force it for Agent
        if (!fs.existsSync(TARGET_ROOT)) {
            return NextResponse.json({ error: `Target root not found: ${TARGET_ROOT}` }, { status: 404 });
        }

        if (type === "write_blog") {
            // Write a new MDX/TSX blog post
            const fullPath = path.join(TARGET_ROOT, "app/blog", filePath);
            // Ensure dir exists
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(fullPath, content, "utf8");
            return NextResponse.json({ success: true, path: fullPath });
        }

        if (type === "update_meta") {
            // Read main layout or page and inject meta
            // precise replacement logic needed
            const targetFile = path.join(TARGET_ROOT, "app/layout.tsx"); // Assuming Next.js App Router
            if (fs.existsSync(targetFile)) {
                let fileContent = fs.readFileSync(targetFile, "utf8");
                // Use regex to replace metadata (Naive implementation)
                // content should contain { title: "...", description: "..." }
                // const newMeta = ...
                // fs.writeFileSync(targetFile, newContent);
                return NextResponse.json({ success: true, message: "Meta update not fully implemented yet (Risk of breaking code)" });
            }
        }

        return NextResponse.json({ error: "Unknown action type" }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
