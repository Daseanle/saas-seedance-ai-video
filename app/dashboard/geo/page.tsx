
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Brain, Sparkles, MessageSquare, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GeoAnalysisPage() {
    const [keyword, setKeyword] = useState("");
    const [brand, setBrand] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const { toast } = useToast();

    const handleAnalyze = async () => {
        if (!keyword || !brand) {
            toast({
                title: "Missing Input",
                description: "Please enter both a keyword and a brand name.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await fetch("/api/geo/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ keyword, brand }),
            });

            if (!response.ok) throw new Error("Analysis failed");

            const data = await response.json();
            setResult(data);
            toast({
                title: "Analysis Complete",
                description: `Successfully analyzed ${brand} for GEO metrics.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to perform GEO analysis. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 w-full flex flex-col gap-8 px-4 sm:px-8 container py-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">GEO Analysis Engine</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Analyze how your brand appears in AI Search Engines (ChatGPT, Perplexity, Gemini).
                    Enter a query to simulate an AI search.
                </p>
            </div>

            {/* Input Section */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-3xl items-end bg-card p-6 rounded-xl border shadow-sm">
                <div className="flex-1 space-y-2 w-full">
                    <label className="text-sm font-medium">Target Keyword / Question</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="e.g. Best SEO tool for startups"
                            className="pl-9"
                        />
                    </div>
                </div>
                <div className="w-full sm:w-[200px] space-y-2">
                    <label className="text-sm font-medium">Your Brand Name</label>
                    <Input
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="e.g. Acme Corp"
                    />
                </div>
                <Button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full sm:w-auto mb-[2px]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" /> Analyze
                        </>
                    )}
                </Button>
            </div>

            {/* Analysis Results */}
            {result && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid gap-6 md:grid-cols-3">
                        {result.engines.map((engine: any, i: number) => (
                            <Card key={i} className={engine.mention ? "border-green-200 dark:border-green-900" : ""}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                            <Brain className="h-5 w-5 text-primary" />
                                            {engine.name}
                                        </CardTitle>
                                        {engine.mention ? (
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                                ✅ Mentioned
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                                                ❌ Not Found
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Visibility Score</span>
                                            <span className="font-bold">{engine.visibility}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${engine.visibility > 80 ? "bg-green-500" : engine.visibility > 50 ? "bg-yellow-500" : "bg-red-500"}`}
                                                style={{ width: `${engine.visibility}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-muted/50 p-3 rounded-md text-sm italic text-muted-foreground border min-h-[80px]">
                                        "{engine.snippet}"
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" /> Sentiment:
                                        <span className={
                                            engine.sentiment === "Positive" || engine.sentiment === "Very Positive" ? "text-green-600 font-medium" :
                                                engine.sentiment === "Neutral" ? "text-yellow-600" : "text-red-600"
                                        }>
                                            {engine.sentiment}
                                        </span>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {/* Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-blue-500" />
                                Optimization Recommendations (AI Generated)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-2 text-sm">
                                {result.recommendations.map((rec: string, i: number) => (
                                    <li key={i}>{rec}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}

            {!result && !loading && (
                <div className="border border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Brain className="h-12 w-12 mb-4 text-muted-foreground/20" />
                    <h3 className="text-lg font-semibold mb-1">Start Your Analysis</h3>
                    <p className="max-w-sm">Enter a keyword and your brand name above to generate a comprehensive GEO report.</p>
                </div>
            )}
        </div>
    );
}
