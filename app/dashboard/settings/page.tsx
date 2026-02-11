
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, CreditCard } from "lucide-react";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";
import { CreditsBalanceCard } from "@/components/dashboard/credits-balance-card";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/sign-in");
    }

    // Get customer data including credits and subscription
    const { data: customerData } = await supabase
        .from("customers")
        .select(
            `
      *,
      subscriptions (
        status,
        current_period_end,
        creem_product_id
      ),
      credits_history (
        amount,
        type,
        created_at
      )
    `
        )
        .eq("user_id", user.id)
        .single();

    const subscription = customerData?.subscriptions?.[0];
    const credits = customerData?.credits || 0;
    const recentCreditsHistory = customerData?.credits_history?.slice(0, 2) || [];

    return (
        <div className="flex-1 w-full flex flex-col gap-8 px-4 sm:px-8 container py-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">
                    Manage your subscription, profile, and security preferences.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" /> Profile Information
                        </CardTitle>
                        <CardDescription>
                            Your personal details and contact information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <Input value={user.email} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name (Mock)</label>
                            <Input placeholder="John Doe" />
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end border-t pt-4">
                        <Button>Save Changes</Button>
                    </CardFooter>
                </Card>

                {/* Subscription & Billing */}
                <div className="space-y-6">
                    <SubscriptionStatusCard subscription={subscription} />
                    <CreditsBalanceCard
                        credits={credits}
                        recentHistory={recentCreditsHistory}
                    />
                </div>
            </div>
        </div>
    );
}
