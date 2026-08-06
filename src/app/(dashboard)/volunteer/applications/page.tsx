"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle2, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const applications = [
  { id: 1, title: "Coastal Beach Cleanup", org: "Green Earth Foundation", date: "Applied Aug 2, 2026", status: "approved" },
  { id: 2, title: "STEM & Coding Tutor", org: "Bright Futures Academy", date: "Applied Jul 25, 2026", status: "approved" },
  { id: 3, title: "Food Pantry Packing", org: "Community Aid Network", date: "Applied Aug 4, 2026", status: "pending" },
];

export default function VolunteerApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground text-sm">Track the status of your submitted volunteer role applications.</p>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="border-border bg-card">
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base">{app.title}</h3>
                  {app.status === "approved" ? (
                    <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600 gap-1 text-xs">
                      <CheckCircle2 className="w-3 h-3" /> Approved
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 gap-1 text-xs">
                      <Clock className="w-3 h-3" /> Under Review
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" /> {app.org} • {app.date}
                </p>
              </div>

              <Link href="/opportunities">
                <Button variant="ghost" size="sm" className="gap-1 font-semibold">
                  View Opportunity <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
