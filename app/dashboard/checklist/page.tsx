
"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TASKS = [
    {
        category: "Technical Foundation",
        items: [
            "Improve Core Web Vitals (LCP < 2.5s)",
            "Ensure Mobile-Friendliness (Google Indexing)",
            "Implement JSON-LD Schema (Organization, FAQ, Article)",
            "Fix Broken Links (404 Errors)"
        ]
    },
    {
        category: "Content Optimization (GEO)",
        items: [
            "Target High-Volume Keywords from Data",
            "Include 'Direct Answers' in first 100 words (for AI snippets)",
            "Add Statistics & Data Tables (AI loves structure)",
            "Use Authoritative Citations & External Links"
        ]
    },
    {
        category: "Authority Building",
        items: [
            "Acquire Backlinks from Niche Directories",
            "Guest Post on Industry Blogs",
            "Share Content on Social Media (Reddit/LinkedIn)",
            "Update Old Content (>6 months)"
        ]
    }
];

export default function ChecklistPage() {
    const [checked, setChecked] = useState<Record<string, boolean>>({});

    const toggle = (task: string) => {
        setChecked(prev => ({ ...prev, [task]: !prev[task] }));
    };

    const completedCount = Object.values(checked).filter(Boolean).length;
    const totalCount = TASKS.reduce((acc, cat) => acc + cat.items.length, 0);
    const progress = Math.round((completedCount / totalCount) * 100);

    return (
        <div className="container py-8 max-w-4xl space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">SEO & GEO Checklist</h1>
                <p className="text-muted-foreground">Follow these steps to dominate AI Search Engines.</p>
            </div>

            {/* Progress Bar */}
            <Card className="bg-muted/40 border-primary/20">
                <CardContent className="pt-6">
                    <div className="flex justify-between mb-2 text-sm font-medium">
                        <span>Progress</span>
                        <span>{progress}% Completed</span>
                    </div>
                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-in-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {TASKS.map((category, idx) => (
                    <Card key={idx} className={idx === 0 ? "md:col-span-2" : ""}>
                        <CardHeader>
                            <CardTitle>{category.category}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {category.items.map((item, i) => (
                                <div key={i} className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded transition-colors">
                                    <Checkbox
                                        id={`${idx}-${i}`}
                                        checked={checked[item]}
                                        onCheckedChange={() => toggle(item)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor={`${idx}-${i}`}
                                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${checked[item] ? "line-through text-muted-foreground" : ""}`}
                                        >
                                            {item}
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
