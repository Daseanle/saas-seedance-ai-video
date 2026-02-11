
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Search, Loader2 } from "lucide-react";

export default function SimulatorPage() {
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [simulation, setSimulation] = useState<any>(null);

    const handleSimulate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSimulation(null);

        try {
            const res = await fetch("/api/geo/simulate", {
                method: "POST",
                body: JSON.stringify({ query }),
            });
            const data = await res.json();
            setSimulation(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-8 max-w-4xl flex flex-col gap-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">GEO Answer Simulator</h1>
                <p className="text-muted-foreground">
                    See how AI Answer Engines (like Perplexity/ChatGPT) construct answers based on live search results.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Query Simulation</CardTitle>
                    <CardDescription>Enter a question your target customers might ask.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSimulate} className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="query" className="sr-only">Query</Label>
                            <Input
                                id="query"
                                placeholder="e.g. best seo tools for startups"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                            Simulate AI Answer
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {simulation && (
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left: Source Context */}
                    <Card className="md:col-span-1 border-dashed">
                        <CardHeader>
                            <CardTitle className="text-sm">Retrieved Sources (RAG)</CardTitle>
                            <CardDescription>What AI "read" from Google</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs">
                            {simulation.sources.map((src: any, i: number) => (
                                <div key={i} className="mb-2">
                                    <div className="font-semibold truncate text-primary">{src.title}</div>
                                    <div className="text-muted-foreground line-clamp-2">{src.snippet}</div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Right: Generated Answer */}
                    <Card className="md:col-span-2 bg-muted/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="h-5 w-5 text-purple-600" />
                                Simulated AI Answer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="prose dark:prose-invert text-sm">
                                {simulation.answer.split('\n').map((line: string, i: number) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm mb-1">Optimization Opportunity</h4>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                    If your brand isn't mentioned above, you need to target the "Sources" on the left. AI engines primarily cite top-ranking pages.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
