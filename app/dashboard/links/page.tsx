
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link2, Search, ExternalLink } from "lucide-react";

export default function LinksPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any[] | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        const form = new FormData(e.currentTarget);
        const targetUrl = form.get("targetUrl") as string;
        const keyword = form.get("keyword") as string;

        // Extract domain (naive)
        let domain = "";
        try {
            domain = new URL(targetUrl).hostname;
        } catch {
            alert("Invalid URL");
            setLoading(false);
            return;
        }

        try {
            const resp = await fetch("/api/links", {
                method: "POST",
                body: JSON.stringify({ targetUrl, keyword, domain }),
            });
            const json = await resp.json();
            setResult(json.opportunities || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-8 max-w-4xl space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Smart Internal Linker</h1>
                <p className="text-muted-foreground">Find pages on your site that should link to your target page (Semantic Cluster building).</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Discovery Opportunities</CardTitle>
                    <CardDescription>Enter the page you want to boost + the keyword it targets.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="targetUrl">Target Page (To Boost)</Label>
                            <Input id="targetUrl" name="targetUrl" placeholder="https://yoursite.com/pillar-page" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="keyword">Keyword (Anchor Text)</Label>
                            <Input id="keyword" name="keyword" placeholder="e.g. digital transformation" required />
                        </div>
                        <div className="md:col-span-2">
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? "Searching Site..." : <><Search className="mr-2 h-4 w-4" /> Find Link Opportunities</>}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Link2 className="h-5 w-5" /> Found {result.length} Internal Link Candidates
                    </h3>

                    {result.length === 0 && (
                        <div className="text-muted-foreground text-sm italic">
                            No mentions found. Try a broader keyword, or create new content mentioning this concept.
                        </div>
                    )}

                    {result.map((opp: any, i: number) => (
                        <Card key={i}>
                            <CardContent className="p-4 flex flex-col gap-2">
                                <div className="font-medium text-primary hover:underline">
                                    <a href={opp.url} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                                        {opp.title} <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                                <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                    {opp.context}
                                </p>
                                <div className="text-xs text-green-600 font-medium">
                                    Strategy: Edit this page and add a link to your target page using exact match anchor text.
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
