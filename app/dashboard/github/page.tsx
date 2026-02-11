
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, PlusCircle, LayoutTemplate, Github, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GitHubManagerPage() {
    const [title, setTitle] = useState("My Awesome SEO Strategy");
    const [slug, setSlug] = useState("my-awesome-seo-strategy");
    const [content, setContent] = useState(
        `export const metadata = {
  title: 'My Awesome SEO Strategy',
  description: 'How to double your SaaS traffic in 2026.',
};

export default function Post() {
  return (
    <article className="prose lg:prose-xl mx-auto py-10">
      <h1>My Awesome SEO Strategy</h1>
      <p>Content goes here...</p>
    </article>
  );
}`
    );
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handlePublish = async () => {
        setLoading(true);
        try {
            // Assume we deploy to app/blog/[slug]/page.tsx
            const filePath = `app/blog/${slug}/page.tsx`;

            const resp = await fetch("/api/github/write", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filePath,
                    content,
                    message: `SEO Autopilot: New Post ${title}`
                })
            });

            const data = await resp.json();

            if (data.success) {
                toast({
                    title: "Published to GitHub!",
                    description: `File created at ${data.url}. Vercel should be deploying now.`
                });
                // Clear
                setTitle("");
                setSlug("");
            } else {
                throw new Error(data.error);
            }

        } catch (error: any) {
            toast({
                title: "Publish Failed",
                description: error.message || "Could not write to GitHub. Check Token.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-8 max-w-5xl space-y-6">
            <div className="flex items-center gap-4">
                <Github className="w-10 h-10" />
                <div>
                    <h1 className="text-3xl font-bold">Cloud Publisher (GitHub)</h1>
                    <p className="text-muted-foreground">Directly inject content into your target repository.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Blog Post</CardTitle>
                    <CardDescription>This will commit a new TSX/MDX file to your repo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Post Title</label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">URL Slug</label>
                            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="enter-url-slug" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">File Content (TSX / Markdown)</label>
                        <textarea
                            className="w-full h-64 p-4 rounded-md border text-sm font-mono bg-muted/30"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    <Button onClick={handlePublish} disabled={loading} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Push to Production
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
