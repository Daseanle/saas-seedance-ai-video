
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2, Sparkles, TrendingUp, Copy, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function AuditPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [generating, setGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState("");
    const [selectedEntity, setSelectedEntity] = useState("");
    const [copied, setCopied] = useState(false);
    const [showDialog, setShowDialog] = useState(false);

    // Keep form values in state to reuse for generation
    const [formData, setFormData] = useState({ userUrl: "", competitorUrl: "", keyword: "" });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        const form = new FormData(e.currentTarget);
        const data = {
            userUrl: form.get("userUrl") as string,
            competitorUrl: form.get("competitorUrl") as string,
            keyword: form.get("keyword") as string,
        };
        setFormData(data);

        try {
            const resp = await fetch("/api/audit", {
                method: "POST",
                body: JSON.stringify(data),
            });
            const json = await resp.json();
            setResult(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (entity: string) => {
        setGenerating(true);
        setSelectedEntity(entity);
        setShowDialog(true);
        setGeneratedContent(""); // Clear previous

        try {
            const resp = await fetch("/api/audit/generate", {
                method: "POST",
                body: JSON.stringify({
                    topic: entity,
                    keyword: formData.keyword,
                    context: result?.userTitle // simple context
                })
            });
            const json = await resp.json();
            setGeneratedContent(json.content || "Failed to generate.");
        } catch (e) {
            setGeneratedContent("Error generating content.");
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container py-8 flex flex-col gap-8 max-w-5xl">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">AI Content Audit</h1>
                <p className="text-muted-foreground">
                    Compare your content against top-ranking competitors to uncover missing entities and optimization gaps.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Start New Audit</CardTitle>
                    <CardDescription>Enter the URLs to analyze.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6 items-end">
                        <div className="grid gap-2">
                            <Label htmlFor="userUrl">Your Content URL</Label>
                            <Input id="userUrl" name="userUrl" placeholder="https://yoursite.com/blog/..." required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="competitorUrl">Top Competitor URL</Label>
                            <Input id="competitorUrl" name="competitorUrl" placeholder="https://competitor.com/best-..." required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="keyword">Target Keyword</Label>
                            <Input id="keyword" name="keyword" placeholder="e.g. ai seo tools" required />
                        </div>

                        <div className="md:col-span-3">
                            <Button type="submit" disabled={loading} className="w-full md:w-auto">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing 2 Pages + AI Gap Analysis...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" /> Run Content Audit
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {result && (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Score & Summary */}
                    <Card className="md:col-span-2 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Audit Score: {result.score}/100
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg font-medium mb-2">{result.summary}</p>
                            <div className="flex gap-2 flex-wrap">
                                {result.pros?.map((p: string, i: number) => (
                                    <Badge key={i} variant="outline" className="border-green-500 text-green-600 bg-green-50">
                                        <CheckCircle2 className="w-3 h-3 mr-1" /> {p}
                                    </Badge>
                                ))}
                                {result.cons?.map((c: string, i: number) => (
                                    <Badge key={i} variant="outline" className="border-red-500 text-red-600 bg-red-50">
                                        <AlertCircle className="w-3 h-3 mr-1" /> {c}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Missing Entities (Interactive) */}
                    <Card className="md:col-span-1 border-yellow-500/20">
                        <CardHeader>
                            <CardTitle>Missing Semantic Entities</CardTitle>
                            <CardDescription>Competitor mentions these, but you don't. Add them to rank higher.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {result.missingEntities?.map((entity: string, i: number) => (
                                    <li key={i} className="flex flex-col gap-2 border-b pb-4 last:border-0 last:pb-0">
                                        <span className="font-medium text-sm text-foreground/80">{entity}</span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs w-fit gap-1 ml-auto"
                                            onClick={() => handleGenerate(entity)}
                                        >
                                            <Sparkles className="w-3 h-3" /> Generate Section
                                        </Button>
                                    </li>
                                ))}
                                {result.missingEntities?.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No major missing entities found!</p>
                                )}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Structural Gaps */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Structural Comparison</CardTitle>
                            <CardDescription>Heading structure depth vs competitor.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm font-medium mb-1 text-muted-foreground">Word Count</div>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                    <span>You: <b>{result.userWordCount}</b></span>
                                    <span>Competitor: <b>{result.competitorWordCount}</b></span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all"
                                        style={{ width: `${Math.min(100, (result.userWordCount / Math.max(result.competitorWordCount, 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="bg-muted/50 p-3 rounded border">
                                    <div className="font-bold mb-2 uppercase tracking-wide text-[10px] text-muted-foreground">Your Structure</div>
                                    <ul className="pl-3 list-disc space-y-1 text-muted-foreground max-h-48 overflow-y-auto">
                                        {result.userStructure?.map((h: string, i: number) => <li key={i}>{h}</li>)}
                                    </ul>
                                </div>
                                <div className="bg-muted/50 p-3 rounded border">
                                    <div className="font-bold mb-2 uppercase tracking-wide text-[10px] text-muted-foreground">Competitor H2s</div>
                                    <ul className="pl-3 list-disc space-y-1 text-muted-foreground max-h-48 overflow-y-auto">
                                        {result.competitorStructure?.map((h: string, i: number) => <li key={i}>{h}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Generation Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>AI Generated Section: {selectedEntity}</DialogTitle>
                        <DialogDescription>
                            Copy this content and add it to your article to cover the missing entity.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 p-4 rounded-md bg-muted/40 border min-h-[150px] relative">
                        {generating ? (
                            <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="text-sm">Writing perfect content...</span>
                            </div>
                        ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{generatedContent}</p>
                        )}

                        {!generating && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 h-8 w-8"
                                onClick={copyToClipboard}
                            >
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Close</Button>
                        <Button onClick={copyToClipboard} disabled={generating}>
                            {copied ? "Copied!" : "Copy to Clipboard"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
