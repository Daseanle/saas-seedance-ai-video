
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();

        // 既然用户已经提供了全部信息，我们直接批量硬编码同步，不废话
        const sitesToSync = [
            {
                domain: "kunlungrowth.com",
                repo_path: "Daseanle/kunlun-growth-website",
                framework: "nextjs",
                blog_path: "app/blog",
                target_geo: "China/Global"
            },
            {
                domain: "www.vacuumpartshub.com",
                repo_path: "Daseanle/vacuum-parts-hub",
                framework: "nextjs",
                blog_path: "app/blog",
                target_geo: "Global"
            },
            {
                domain: "wechatmedia.com",
                repo_path: "Daseanle/wechatmedia",
                framework: "nextjs",
                blog_path: "app/blog",
                target_geo: "Global"
            },
            {
                domain: "www.janitor-ai.chat",
                repo_path: "Daseanle/janitor-chat",
                framework: "nextjs",
                blog_path: "app/blog",
                target_geo: "Global"
            }
        ];

        // 执行 Upsert (存在则更新，不存在则插入)
        const { data, error } = await supabase
            .from("seo_sites")
            .upsert(sitesToSync, { onConflict: 'domain' })
            .select();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: "All 4 sites identified and synced from user history.",
            synced_count: data.length
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
