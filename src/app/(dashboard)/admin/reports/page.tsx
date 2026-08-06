"use client";

import * as React from "react";
import { FileBarChart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Compliance Reports</h1>
        <p className="text-muted-foreground text-sm">Generate platform-wide service hour audits for educational districts and government reporting.</p>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Q2 2026 Platform Service Hours Audit.csv</h3>
            <p className="text-xs text-muted-foreground">Generated Aug 6, 2026 • 84,000 Total Verified Hours</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => toast("Exporting CSV Audit Report...")}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
