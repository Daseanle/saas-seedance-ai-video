
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    TrendingUp,
    Globe,
    FileText,
    Settings,
    ChevronLeft,
    Grid,
    Sparkles,
    Bot,
    CheckSquare,
    Eye,
    Link2,
    Pickaxe,
    MessageCircle,
    Rocket,
    Github
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarNavItems = [
    {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Autopilot (One-Click)",
        href: "/dashboard/autopilot",
        icon: Rocket,
    },
    {
        title: "Cloud Publish (GitHub)",
        href: "/dashboard/github",
        icon: Github
    },
    {
        title: "Keywords",
        href: "/dashboard/keywords",
        icon: TrendingUp,
    },
    {
        title: "Reddit Monitor",
        href: "/dashboard/reddit",
        icon: MessageCircle
    },
    {
        title: "Keyword Mining",
        href: "/dashboard/mining",
        icon: Pickaxe,
    },
    {
        title: "Content Audit",
        href: "/dashboard/audit",
        icon: Sparkles,
    },
    {
        title: "GEO Analysis",
        href: "/dashboard/geo",
        icon: Globe,
    },
    {
        title: "GEO Simulator",
        href: "/dashboard/simulator",
        icon: Bot
    },
    {
        title: "SEO Checklist",
        href: "/dashboard/checklist",
        icon: CheckSquare
    },
    {
        title: "Competitor Watch",
        href: "/dashboard/competitor-watch",
        icon: Eye
    },
    {
        title: "Internal Links",
        href: "/dashboard/links",
        icon: Link2
    },
    {
        title: "Reports",
        href: "/dashboard/reports",
        icon: FileText,
    },
    {
        title: "Sites (Settings)",
        href: "/dashboard/settings/sites",
        icon: Settings,
    },
];

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen flex-col space-y-6 md:flex-row md:space-x-12 md:space-y-0">
            <aside className="hidden w-[200px] flex-col md:flex border-r min-h-[calc(100vh-65px)] px-4 py-6 bg-muted/20">
                <nav className="grid items-start gap-2">
                    {sidebarNavItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                        >
                            <span
                                className={cn(
                                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                    pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
                                )}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                <span>{item.title}</span>
                            </span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Mobile nav placeholder - can be expanded later */}

            <main className="flex w-full flex-1 flex-col overflow-hidden">
                {children}
            </main>
        </div>
    );
}
