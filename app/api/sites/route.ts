
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const DEFAULTS = [
    { domain: "kunlungrowth.com", repo_path: "Daseanle/kunlun-growth-website", framework: "nextjs", blog_path: "app/blog", target_geo: "China/Global" },
    { domain: "www.vacuumpartshub.com", repo_path: "Daseanle/vacuum-parts-hub", framework: "nextjs", blog_path: "app/blog", target_geo: "Global" },
    { domain: "wechatmedia.com", repo_path: "Daseanle/wechatmedia", framework: "nextjs", blog_path: "app/blog", target_geo: "Global" },
    { domain: "www.janitor-ai.chat", repo_path: "Daseanle/janitor-chat", framework: "nextjs", blog_path: "app/blog", target_geo: "Global" }
];

export async function GET() {
    try {
        const supabase = await createClient();
        let { data: sites, error } = await supabase.from("seo_sites").select("*");

        // 如果数据库为空，启动“强制记忆注入”
        if (!sites || sites.length === 0) {
            console.log("Memory Injection Triggered...");
            const { data: inserted, error: insError } = await supabase
                .from("seo_sites")
                .upsert(DEFAULTS, { onConflict: 'domain' })
                .select();

            if (insError) {
                // 如果数据库表还没建，至少先给前端返回硬编码的数据，不让用户看到空白
                return NextResponse.json(DEFAULTS);
            }
            return NextResponse.json(inserted);
        }

        return NextResponse.json(sites);
    } catch (error: any) {
        // 报错也返回默认数据，这是保底方案
        return NextResponse.json(DEFAULTS);
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const body = await request.json();
        const { data, error } = await supabase.from("seo_sites").insert([body]).select();
        if (error) throw error;
        return NextResponse.json({ success: true, site: data[0] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
