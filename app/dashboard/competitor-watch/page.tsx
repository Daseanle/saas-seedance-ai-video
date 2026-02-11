
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, ExternalLink, RefreshCw } from "lucide-react";
import Link from 'next/link';

export default function CompetitorWatchPage() {
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState("");
    const [result, setResult] = useState<any>(null);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const resp = await fetch("/api/spy", {
                method: "POST",
                body: JSON.stringify({ url }),
            });
            const data = await resp.json();
            setResult(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-8 max-w-4xl space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Competitor Radar</h1>
                <p className="text-muted-foreground">Instantly discover what your competitors are publishing.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Scan New Content</CardTitle>
                    <CardDescription>Enter a competitor's domain (e.g. hubspot.com/blog)</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleScan} className="flex gap-4">
                        <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://competitor.com/blog"
                            required
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                            Scan Now
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {result && result.recentLinks?.length > 0 && (
                <div className="grid gap-4">
                    <h3 className="text-lg font-semibold">Latest Articles Found</h3>
                    {result.recentLinks.map((link: any, i: number) => (
                        <Card key={i} className="hover:bg-muted/50 transition-colors">
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <div className="font-medium text-primary line-clamp-1">{link.text}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-md">{link.url}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" asChild>
                                        <a href={link.url} target="_blank" rel="noreferrer">
                                            <ExternalLink className="h-4 w-4 mr-1" /> View
                                        </a>
                                    </Button>
                                    <Button size="sm" asChild>
                                        <Link href={`/dashboard/audit?competitorUrl=${encodeURIComponent(link.url)}`}>
                                            Audit This
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
