
"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export function KeywordChart({ data }: { data: { date: string, rank: number }[] }) {
    const formattedData = data.map(d => ({
        ...d,
        displayRank: d.rank > 0 ? d.rank : 100, // Handle non-ranking > 100
        readableDate: new Date(d.date).toLocaleDateString()
    }));

    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                <XAxis
                    dataKey="readableDate"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                />
                <YAxis
                    reversed={true}
                    hide={false}
                    width={40}
                    domain={[1, 100]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                    itemStyle={{ color: "hsl(var(--primary))" }}
                />
                <Line
                    type="monotone"
                    dataKey="displayRank"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
