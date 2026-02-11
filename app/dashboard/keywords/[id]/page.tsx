
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { KeywordChart } from "@/components/keywords/keyword-chart";
import { GoogleTrendsChart } from "@/components/keywords/trends-chart";

export default async function KeywordDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/sign-in");
    }

    // Fetch Keyword Details
    const { data: keyword, error } = await supabase
        .from("seo_keywords")
        .select("*")
        .eq("id", params.id)
        .single();

    if (error || !keyword) {
        return redirect("/dashboard/keywords");
    }

    // Process History for Chart
    // History format: [{ date: string, rank: number }]
    const history = keyword.history || [];

    // Calculate Stats
    const currentRank = keyword.current_rank;
    const startRank = history.length > 0 ? history[0].rank : currentRank;
    const bestRank = history.reduce((min: number, h: any) => (h.rank > 0 && h.rank < min) ? h.rank : min, 100);
    const totalChange = (startRank === 0 ? 100 : startRank) - (currentRank === 0 ? 100 : currentRank);

    return (
        <div className="flex-1 w-full flex flex-col gap-8 px-4 sm:px-8 container py-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/keywords"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        {keyword.keyword}
                        <Badge variant="outline">{keyword.volume?.toLocaleString() || 0} Vol</Badge>
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Tracking history for <a href={keyword.target_url} target="_blank" className="underline hover:text-primary">{keyword.target_url}</a>
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Current Rank</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">#{currentRank > 0 ? currentRank : '>100'}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Best Rank</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">#{bestRank}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Change</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold flex items-center">
                            {totalChange > 0 ? "+" : ""}{totalChange}
                            {totalChange > 0 ? <TrendingUp className="ml-2 h-5 w-5 text-green-500" /> : <TrendingDown className="ml-2 h-5 w-5 text-red-500" />}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recharts Component (Client Side) */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Rank History (Your Site)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <KeywordChart data={history} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Google Trends (Interest)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <GoogleTrendsChart keyword={keyword.keyword} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
