"use client";

import * as React from "react";
import { BarChart3, TrendingUp, Users, Clock, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrganizationAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Community Impact Analytics</h1>
        <p className="text-muted-foreground text-sm">Track your organization&apos;s volunteer engagement, hours verified, and impact footprint.</p>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="border-border bg-card"><CardContent className="p-6 space-y-1"><p className="text-xs text-muted-foreground">Total Volunteers</p><p className="text-3xl font-bold text-primary">142</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-6 space-y-1"><p className="text-xs text-muted-foreground">Hours Verified</p><p className="text-3xl font-bold text-green-500">680 hrs</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-6 space-y-1"><p className="text-xs text-muted-foreground">Active Roles</p><p className="text-3xl font-bold text-amber-500">5 roles</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-6 space-y-1"><p className="text-xs text-muted-foreground">Satisfaction</p><p className="text-3xl font-bold text-blue-500">99.2%</p></CardContent></Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Monthly Hours Verification Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex items-center justify-center h-48 bg-muted/30 rounded-xl">
          <p className="text-xs text-muted-foreground">Visual analytics chart rendering verified service hours over past 6 months.</p>
        </CardContent>
      </Card>
    </div>
  );
}
