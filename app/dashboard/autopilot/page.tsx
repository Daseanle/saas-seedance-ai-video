
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Rocket, AlertCircle, ListTodo, Github, Send, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function AutopilotPage() {
    const [url, setUrl] = useState("");
    const [sites, setSites] = useState<any[]>([]);
    const [selectedSiteId, setSelectedSiteId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [publishingId, setPublishingId] = useState<number | null>(null);
    const [stage, setStage] = useState<string>("");
    const [plan, setPlan] = useState<any>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSites = async () => {
            try {
                const resp = await fetch("/api/sites");
                const data = await resp.json();
                if (Array.isArray(data)) {
                    setSites(data);
                    // Only set default if not already set manually
                    if (data.length > 0 && !selectedSiteId) {
                        setSelectedSiteId(data[0].domain);
                    }
                }
            } catch (e) { }
        };
        fetchSites();
    }, []); // Only run once on mount

    // Clear plan ONLY when site ID actually changes to a different one
    useEffect(() => {
        if (selectedSiteId) {
            setPlan(null);
        }
    }, [selectedSiteId]);

    const selectedSite = sites.find(s => s.domain === selectedSiteId);

    const startAutopilot = async (e: React.FormEvent) => {
        e.preventDefault();
        const targetUrl = selectedSite ? selectedSite.domain : url;
        if (!targetUrl) return;

        let finalUrl = targetUrl;
        if (!finalUrl.startsWith("http")) finalUrl = "https://" + finalUrl;

        setLoading(true);
        setPlan(null);

        try {
            console.log("Starting analysis for:", finalUrl);
            console.log("Selected Site Config:", selectedSite);

            setStage(`Analyzing ${new URL(finalUrl).hostname}...`);

            const resp = await fetch("/api/autopilot/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: finalUrl }),
            });

            const data = await resp.json();

            if (data.plan) {
                setPlan(data.plan);
                toast({
                    title: "Strategy Ready",
                    description: `Identified ${data.plan.content_ideas.length} SEO gaps.`,
                });
            } else {
                console.error("AI Analysis Error Detail:", data);
                throw new Error(data.error || data.logs?.join(" -> ") || "Analysis failed.");
            }

        } catch (error: any) {
            toast({
                title: "Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
            setStage("");
        }
    };

    const handleCloudPublish = async (idea: any, index: number) => {
        if (!selectedSite) {
            toast({ title: "No Site Selected", description: "Config a site in Settings first.", variant: "destructive" });
            return;
        }

        setPublishingId(index);
        try {
            const slug = idea.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-').substring(0, 50);
            const filePath = `${selectedSite.blog_path}/${slug}/page.tsx`.replace(/\/+/g, '/');

            // Note: We move the AI generation to the backend to keep the client light
            const resp = await fetch("/api/github/write", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idea: { ...idea, title: idea.title },
                    siteConfig: selectedSite,
                    filePath
                })
            });

            const data = await resp.json();
            if (data.success) {
                toast({
                    title: "Live on GitHub!",
                    description: `File created in ${selectedSite.repo_path}.`,
                });
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast({
                title: "Publish Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setPublishingId(null);
        }
    };

    return (
        <div className="container py-8 max-w-4xl space-y-8">
            <div className="text-center space-y-4">
                <Rocket className="w-12 h-12 mx-auto text-primary" />
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">SEO Autopilot</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                    Select a site from your matrix to begin automated growth.
                </p>
            </div>

            <Card className="bg-muted/50 border-2 border-primary/20 p-2">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold text-muted-foreground block px-1">Target Site</label>
                            {sites.length > 0 ? (
                                <select
                                    className="w-full h-12 rounded-md border border-input bg-background px-3 text-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                                    value={selectedSiteId}
                                    onChange={(e) => {
                                        console.log("Selecting:", e.target.value);
                                        setSelectedSiteId(e.target.value);
                                    }}
                                >
                                    {sites.map((s, idx) => (
                                        <option key={idx} value={s.domain}>{s.domain} ({s.repo_path})</option>
                                    ))}
                                </select>
                            ) : (
                                <Input disabled placeholder="No sites configured. Go to Settings." className="h-12" />
                            )}
                        </div>
                        <div className="flex items-end flex-none">
                            <Button onClick={startAutopilot} disabled={loading || sites.length === 0} size="lg" className="h-12 px-8 text-lg font-bold">
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
                                Launch Agent
                            </Button>
                        </div>
                    </div>
                    {sites.length === 0 && (
                        <div className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg text-yellow-800 text-sm gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Please <Link href="/dashboard/settings/sites" className="underline font-bold">add a site</Link> to your matrix first.
                        </div>
                    )}
                    {stage && (
                        <div className="text-center text-sm text-primary animate-pulse font-medium">
                            {stage}
                        </div>
                    )}
                </CardContent>
            </Card>

            {plan && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">SEO Health</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{plan.audit_score}/100</div></CardContent></Card>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Keywords</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{plan.keywords_found}</div></CardContent></Card>
                        <Card><CardHeader className="pb-2"><CardTitle className="text-xs uppercase text-muted-foreground">Growth Ideas</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-green-600">+{plan.content_ideas.length}</div></CardContent></Card>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-bold flex items-center gap-2">Strategy for {selectedSite?.domain}</h2>
                        </div>

                        <div className="grid gap-4">
                            {plan.content_ideas.map((idea: any, i: number) => (
                                <Card key={i} className="group hover:shadow-md transition-all">
                                    <div className="p-5 flex items-start gap-4">
                                        <div className="bg-primary/10 text-primary w-10 h-10 rounded-lg flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                                        <div className="space-y-2 flex-1">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-lg leading-tight">{idea.title}</h3>
                                                    <div className="flex gap-2">
                                                        <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase">{idea.intent}</span>
                                                        <span className="text-[10px] font-bold text-primary uppercase">Target: {idea.keyword}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="font-bold hover:bg-primary hover:text-white"
                                                    disabled={publishingId !== null}
                                                    onClick={() => handleCloudPublish(idea, i)}
                                                >
                                                    {publishingId === i ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Github className="mr-2 h-3 w-3" /> Commit</>}
                                                </Button>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed italic">{idea.description}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
