"use client";

import * as React from "react";
import { Briefcase, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const opps = [
  { id: 1, title: "Coastal Beach Cleanup", org: "Green Earth Foundation", status: "published" },
  { id: 2, title: "STEM Coding Tutor", org: "Bright Futures Academy", status: "published" },
];

export default function AdminOpportunitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Audit Opportunities</h1>
        <p className="text-muted-foreground text-sm">Monitor public listings for platform safety compliance.</p>
      </div>

      <div className="space-y-3">
        {opps.map((op) => (
          <Card key={op.id} className="border-border bg-card">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{op.title}</h3>
                <p className="text-xs text-muted-foreground">{op.org}</p>
              </div>
              <Badge variant="outline" className="text-xs uppercase bg-green-500/10 text-green-600 border-green-500/30">{op.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
