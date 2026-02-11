
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();

        // Ensure table exists (This won't work if table not created manually, but checking)
        const { data: currentSites } = await supabase.from("seo_sites").select("id");

        const vacuumSite = {
            domain: "www.vacuumpartshub.com",
            repo_path: "Daseanle/vacuum-parts-hub",
            framework: "nextjs",
            blog_path: "app/blog",
            target_geo: "Global"
        };

        const kunlunSite = {
            domain: "kunlungrowth.com",
            repo_path: "Daseanle/kunlun-growth-website",
            framework: "nextjs",
            blog_path: "app/blog",
            target_geo: "China/Global"
        };

        const wechatSite = {
            domain: "wechatmedia.com",
            repo_path: "Daseanle/wechatmedia",
            framework: "nextjs",
            blog_path: "app/blog",
            target_geo: "Global"
        };

        const janitorSite = {
            domain: "www.janitor-ai.chat",
            repo_path: "Daseanle/janitor-chat",
            framework: "nextjs",
            blog_path: "app/blog",
            target_geo: "Global"
        };

        const { data, error } = await supabase
            .from("seo_sites")
            .upsert([kunlunSite, vacuumSite, wechatSite, janitorSite], { onConflict: 'domain' })
            .select();

        if (error) throw error;
        return NextResponse.json({ message: "Seeding successful", sites: data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
