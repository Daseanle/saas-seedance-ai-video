
"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Loader2 } from "lucide-react";

export function GoogleTrendsChart({ keyword }: { keyword: string }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!keyword) return;

        const fetchData = async () => {
            try {
                const res = await fetch("/api/trends", {
                    method: "POST",
                    body: JSON.stringify({ keyword }),
                });
                const json = await res.json();
                if (json.timeline) {
                    setData(json.timeline);
                } else {
                    setError(true);
                }
            } catch (e) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [keyword]);

    if (loading) return <div className="h-[200px] flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin mr-2" /> Loading Trends...</div>;
    if (error) return <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Trends data unavailable (API Rate Limited). Try <a href={`https://trends.google.com/trends/explore?q=${encodeURIComponent(keyword)}`} target="_blank" className="underline ml-1">Google Trends</a> directly.</div>;
    if (data.length === 0) return <div className="h-[200px] flex items-center justify-center text-muted-foreground">No trend data found.</div>;

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
            </ResponsiveContainer>
            <div className="text-center text-xs text-muted-foreground mt-2">
                Last 30 Days Search Interest (Google)
            </div>
        </div>
    );
}
