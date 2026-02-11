
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { AddKeywordDialog } from "@/components/keywords/add-keyword-dialog";

export default async function KeywordsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/sign-in");
    }

    // Fetch real data from Supabase
    const { data: keywords, error } = await supabase
        .from("seo_keywords")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching keywords:", error);
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-6 px-4 sm:px-8 container py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Keywords Tracker</h1>
                    <p className="text-muted-foreground">
                        Monitor your rankings and velocity across Google and AI engines.
                    </p>
                </div>
                <AddKeywordDialog />
            </div>

            {/* Filters (Mock UI for now) */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search keywords..."
                        className="pl-8"
                    />
                </div>
                <Button variant="outline">Filter</Button>
            </div>

            {/* Real Keywords Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Keyword</TableHead>
                            <TableHead>Volume</TableHead>
                            <TableHead>Current Rank</TableHead>
                            <TableHead>Velocity</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>AI Visibility</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {keywords && keywords.length > 0 ? (
                            keywords.map((kw: any) => {
                                // Calculate computed fields from history if available
                                const history = kw.history || [];
                                const currentRank = kw.current_rank;
                                let prevRank = 0;
                                let velocity = 0;

                                if (history.length > 1) {
                                    // Get the second to last entry
                                    const prevEntry = history[history.length - 2];
                                    prevRank = prevEntry.rank;
                                    velocity = prevRank - currentRank; // Positive means improved (rank went down, e.g. 10 -> 5)
                                    // Make velocity intuitive: +5 means gained 5 spots.
                                    if (currentRank === 0) velocity = -prevRank; // Dropped out
                                    if (prevRank === 0) velocity = 0; // New
                                }

                                return (
                                    <TableRow key={kw.id}>
                                        <TableCell className="font-medium">
                                            {kw.keyword}
                                            <div className="md:hidden text-xs text-muted-foreground mt-1">
                                                Vol: {kw.volume?.toLocaleString() || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{kw.volume?.toLocaleString() || 0}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{currentRank > 0 ? `#${currentRank}` : '>100'}</span>
                                                {prevRank > 0 && velocity > 0 ? (
                                                    <span className="text-xs text-green-500 flex items-center">
                                                        <TrendingUp className="h-3 w-3 mr-1" />
                                                        was #{prevRank}
                                                    </span>
                                                ) : prevRank > 0 && velocity < 0 ? (
                                                    <span className="text-xs text-red-500 flex items-center">
                                                        <TrendingDown className="h-3 w-3 mr-1" />
                                                        was #{prevRank}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground"></span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={velocity > 0 ? "default" : velocity < 0 ? "destructive" : "secondary"}
                                                className={velocity > 0 ? "bg-green-500 hover:bg-green-600" : ""}
                                            >
                                                {velocity > 0 ? "+" : ""}{velocity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <span className={`text-xs px-2 py-1 rounded-full ${kw.difficulty === "High" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                kw.difficulty === "Medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                                    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                }`}>
                                                {kw.difficulty || "Unknown"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {/* AI Visibility Placeholder (Future) */}
                                            <span className="text-muted-foreground text-sm">-</span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="icon" variant="ghost" asChild>
                                                <Link href={`/dashboard/keywords/${kw.id}`}>
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    No keywords tracked yet. Click "Add Keyword" to start.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
