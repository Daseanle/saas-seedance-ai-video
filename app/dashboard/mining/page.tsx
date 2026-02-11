
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Loader2, Download, Copy, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MiningPage() {
    const [loading, setLoading] = useState(false);
    const [seed, setSeed] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const { toast } = useToast();

    const handleMine = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!seed) return;

        setLoading(true);
        setResults([]);

        try {
            const resp = await fetch("/api/mining/suggest", {
                method: "POST",
                body: JSON.stringify({ seed }),
            });
            const data = await resp.json();

            if (data.suggestions) {
                setResults(data.suggestions);
                toast({
                    title: "Mining Complete",
                    description: `Found ${data.suggestions.length} keywords based on "${seed}".`,
                });
            }
        } catch (e) {
            toast({
                title: "Mining Failed",
                description: "Could not fetch suggestions.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const copyAll = () => {
        const text = results.map(r => r.keyword).join('\n');
        navigator.clipboard.writeText(text);
        toast({ title: "Copied all keywords" });
    };

    return (
        <div className="container py-8 max-w-4xl space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Keyword Miner</h1>
                <p className="text-muted-foreground">
                    Bulk discover long-tail keywords using Google Autocomplete (A-Z Method).
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Discovery Engine</CardTitle>
                    <CardDescription>Enter a seed keyword (e.g. "AI Tools") to generate hundreds of variations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleMine} className="flex gap-4">
                        <Input
                            value={seed}
                            onChange={(e) => setSeed(e.target.value)}
                            placeholder="Enter seed keyword..."
                            className="flex-1"
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Start Mining
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {results.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle>Results ({results.length})</CardTitle>
                            <CardDescription>Sorted by relevance score.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={copyAll}>
                                <Copy className="mr-2 h-4 w-4" /> Copy List
                            </Button>
                            <Button variant="outline" size="sm" disabled>
                                <Download className="mr-2 h-4 w-4" /> Export CSV
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <div className="grid grid-cols-12 bg-muted p-3 text-xs font-medium text-muted-foreground uppercase">
                                <div className="col-span-1">#</div>
                                <div className="col-span-8">Keyword</div>
                                <div className="col-span-2">Source</div>
                                <div className="col-span-1 text-right">Score</div>
                            </div>
                            <div className="divide-y max-h-[500px] overflow-y-auto">
                                {results.map((r, i) => (
                                    <div key={i} className="grid grid-cols-12 p-3 text-sm items-center hover:bg-muted/50">
                                        <div className="col-span-1 text-muted-foreground">{i + 1}</div>
                                        <div className="col-span-8 font-medium">{r.keyword}</div>
                                        <div className="col-span-2 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded w-fit">
                                            {r.source === "Root" ? "Seed" : `+ ${r.source}`}
                                        </div>
                                        <div className="col-span-1 text-right font-mono text-xs">
                                            {r.score}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
