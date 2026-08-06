"use client";

import * as React from "react";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground text-sm">System metrics, user acquisition, and hour verification trends.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card"><CardContent className="p-6"><p className="text-xs text-muted-foreground">Monthly Active Volunteers</p><p className="text-3xl font-bold text-primary">12,400</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-6"><p className="text-xs text-muted-foreground">Active Organizations</p><p className="text-3xl font-bold text-green-500">350</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-6"><p className="text-xs text-muted-foreground">Verified Certificates</p><p className="text-3xl font-bold text-amber-500">4,120</p></CardContent></Card>
      </div>
    </div>
  );
}
