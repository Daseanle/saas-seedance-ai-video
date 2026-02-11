
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar } from "lucide-react";

// Mock Reports
const reports = [
    { id: 1, title: "Monthly SEO Velocity Report", date: "Oct 2024", type: "PDF", size: "2.4 MB" },
    { id: 2, title: "AI Visibility Analysis", date: "Sep 2024", type: "PDF", size: "1.1 MB" },
    { id: 3, title: "Keyword Opportunity Audit", date: "Sep 2024", type: "CSV", size: "450 KB" },
];

export default async function ReportsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/sign-in");
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-6 px-4 sm:px-8 container py-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">SEO Reports</h1>
                <p className="text-muted-foreground">
                    Download your automated SEO performance reports.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                    <Card key={report.id}>
                        <CardHeader className="flex flex-row items-center gap-4 pb-2">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-base">{report.title}</CardTitle>
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {report.date}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs font-medium bg-secondary px-2 py-1 rounded">
                                    {report.type} • {report.size}
                                </span>
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-3 w-3" /> Download
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Generate New Report Card */}
                <Card className="border-dashed flex flex-col items-center justify-center p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="bg-muted p-3 rounded-full mb-3">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">Generate New Report</h3>
                    <p className="text-sm text-muted-foreground mb-4">Create a custom report for specific timeframe.</p>
                    <Button>Create Report</Button>
                </Card>
            </div>
        </div>
    );
}
