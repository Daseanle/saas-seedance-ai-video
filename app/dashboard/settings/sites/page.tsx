
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Globe, Github, Layers, MapPin, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SiteManagerPage() {
    const [sites, setSites] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const { toast } = useToast();

    // Form Stats
    const [newSite, setNewSite] = useState({
        domain: "",
        repo_path: "",
        framework: "nextjs",
        blog_path: "app/blog",
        target_geo: "Global"
    });

    const fetchSites = async () => {
        const resp = await fetch("/api/sites");
        const data = await resp.json();
        if (Array.isArray(data)) setSites(data);
    };

    useEffect(() => { fetchSites(); }, []);

    const handleAddSite = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        try {
            const resp = await fetch("/api/sites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSite)
            });
            const data = await resp.json();
            if (data.success) {
                toast({ title: "Success", description: "Site added to matrix." });
                fetchSites();
                setNewSite({ domain: "", repo_path: "", framework: "nextjs", blog_path: "app/blog", target_geo: "Global" });
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="container py-8 max-w-5xl space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">Site Matrix</h1>
                    <p className="text-muted-foreground">Manage multiple domains and automate their SEO execution.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={async () => {
                        const r = await fetch("/api/debug/auto-scan");
                        const d = await r.json();
                        if (d.success) { fetchSites(); toast({ title: "Auto-ID Success", description: "All 4 sites synced from history." }); }
                    }}>
                        <Layers className="mr-2 h-4 w-4" /> Auto-Identify (History)
                    </Button>
                    <Button variant="secondary">
                        <Github className="mr-2 h-4 w-4" /> Sync GitHub Repos
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Add Form */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><PlusCircle className="h-4 w-4" /> Add New Site</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddSite} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Domain</label>
                                <Input placeholder="example.com" value={newSite.domain} onChange={e => setNewSite({ ...newSite, domain: e.target.value })} required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">GitHub Repo</label>
                                <Input placeholder="user/repo" value={newSite.repo_path} onChange={e => setNewSite({ ...newSite, repo_path: e.target.value })} required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Blog Path</label>
                                <Input placeholder="app/blog" value={newSite.blog_path} onChange={e => setNewSite({ ...newSite, blog_path: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Target Geo/GEO</label>
                                <Input placeholder="USA/Global/UK" value={newSite.target_geo} onChange={e => setNewSite({ ...newSite, target_geo: e.target.value })} />
                            </div>
                            <Button type="submit" className="w-full" disabled={adding}>
                                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy Agent to Site"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List */}
                <div className="md:col-span-2 space-y-4">
                    {sites.map((site) => (
                        <Card key={site.id} className="hover:border-primary transition-all">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full">
                                            <Globe className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl">{site.domain}</h3>
                                            <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1"><Github className="h-3 w-3" /> {site.repo_path}</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {site.target_geo}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {sites.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed rounded-xl">
                            <p className="text-muted-foreground font-medium">No sites in matrix yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
