
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Loader2, ExternalLink, MessageCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RedditPost {
    id: string;
    title: string;
    link: string;
    updated: string;
    subreddit: string;
    preview: string;
}

export default function RedditMonitorPage() {
    const [loading, setLoading] = useState(false);
    const [keywords, setKeywords] = useState("seo, tool, saas");
    const [posts, setPosts] = useState<RedditPost[]>([]);
    const { toast } = useToast();

    const handleScan = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setPosts([]);

        try {
            const resp = await fetch("/api/reddit/monitor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keywords }),
            });
            const data = await resp.json();

            if (data.posts) {
                setPosts(data.posts);
                toast({
                    title: "Scan Complete",
                    description: `Found ${data.posts.length} relevant posts across 5 subreddits.`,
                });
            } else {
                toast({
                    title: "No posts found",
                    description: "Try broader keywords.",
                });
            }
        } catch (error) {
            toast({
                title: "Scan Failed",
                description: "Could not fetch Reddit data.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-8 max-w-5xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reddit Monitor</h1>
                    <p className="text-muted-foreground">
                        Track discussions across r/SaaS, r/Marketing, etc.
                    </p>
                </div>
                <Button onClick={() => handleScan()} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Refresh Feed
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filter Settings</CardTitle>
                    <CardDescription>Enter keywords to watch (comma separated).</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleScan} className="flex gap-4">
                        <Input
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="e.g. competitor name, problem, how to..."
                            className="flex-1"
                        />
                        <Button type="submit" disabled={loading}>
                            <Search className="mr-2 h-4 w-4" /> Scan Now
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {posts.map((post) => (
                    <Card key={post.id} className="hover:border-primary transition-colors">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                        <span className="font-bold text-primary">r/{post.subreddit}</span>
                                        <span>•</span>
                                        <span>{new Date(post.updated).toLocaleString()}</span>
                                    </div>
                                    <CardTitle className="text-lg leading-snug">
                                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {post.title}
                                        </a>
                                    </CardTitle>
                                </div>
                                <Button size="sm" variant="outline" asChild>
                                    <a href={post.link} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" /> View
                                    </a>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {post.preview.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')}
                            </p>
                            <div className="mt-4 flex gap-2">
                                <Button size="sm" variant="secondary" asChild className="text-xs h-8">
                                    <a href={post.link} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="mr-2 h-3 w-3" /> Reply Opportunity
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {!loading && posts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                        No recent posts found matching your keywords.
                    </div>
                )}
            </div>
        </div>
    );
}
