
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Globe,
  Search,
  Layers,
  Sparkles
} from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // 1. Fetch All Keywords with History
  const { data: keywords, error } = await supabase
    .from("seo_keywords")
    .select("*")
    .eq("user_id", user.id);

  const totalKeywords = keywords?.length || 0;

  // 2. Compute Metrics
  let totalVelocity = 0;
  let trackedDomains = 0;
  const movers: any[] = [];

  if (keywords) {
    // Calculate Stats
    keywords.forEach((kw: any) => {
      const currentRank = kw.current_rank;
      const history = kw.history || [];
      let velocity = 0;

      if (history.length > 1) {
        const prevRank = history[history.length - 2].rank;
        velocity = prevRank - currentRank;
        if (currentRank === 0) velocity = -prevRank;
        if (prevRank === 0) velocity = 0;
      }

      totalVelocity += velocity;

      movers.push({
        ...kw,
        velocity
      });
    });
  }

  // Sort movers by absolute velocity (biggest changes)
  movers.sort((a, b) => Math.abs(b.velocity) - Math.abs(a.velocity));
  const topMovers = movers.slice(0, 5);

  const avgVelocity = totalKeywords > 0 ? (totalVelocity / totalKeywords) : 0;

  // Fetch Project Count
  const { count: projectCount } = await supabase
    .from("seo_projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);
  trackedDomains = projectCount || 0;

  return (
    <div className="flex-1 w-full flex flex-col gap-8 px-4 sm:px-8 container py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SEO Overview</h1>
        <p className="text-muted-foreground">
          Track your keyword velocity and AI search performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keywords</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKeywords}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Active tracking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Velocity</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {avgVelocity > 0 ? "+" : ""}{avgVelocity.toFixed(1)}
              {avgVelocity > 0 ? (
                <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
              ) : avgVelocity < 0 ? (
                <TrendingDown className="ml-2 h-4 w-4 text-red-500" />
              ) : (
                <Minus className="ml-2 h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Rank positions gained/month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GEO Ready</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">No</div>
            <p className="text-xs text-muted-foreground">
              Start Content Audit to improve
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracked Domains</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trackedDomains}</div>
            <p className="text-xs text-muted-foreground">
              Active projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Top Velocity Keywords */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Movers</CardTitle>
            <CardDescription>Keywords with significant rank changes recently.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topMovers.length > 0 ? (
                topMovers.map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{item.keyword}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Rank #{item.current_rank > 0 ? item.current_rank : '>100'}</span>
                      </div>
                    </div>
                    <div className={`font-bold ${(item.velocity || 0) > 0 ? "text-green-500" : (item.velocity || 0) < 0 ? "text-red-500" : "text-muted-foreground"
                      }`}>
                      {(item.velocity || 0) > 0 ? "+" : ""}{item.velocity}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground py-8 text-center flex flex-col items-center gap-2">
                  <p>No significant movements yet.</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/keywords">Add Keywords</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Optimize your GEO performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/dashboard/audit" className="block group">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-semibold">New Content Audit</div>
                    <Sparkles className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Compare your content against top competitors using AI.
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/simulator" className="block group">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-semibold">GEO Simulator</div>
                    <Globe className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    See how AI Engine answers user questions about your keywords.
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/competitor-watch" className="block group">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-semibold">Competitor Spy</div>
                    <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Check what your competitors are publishing right now.
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
