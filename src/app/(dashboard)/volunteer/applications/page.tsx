"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle2, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function VolunteerApplicationsPage() {
  const [applications, setApplications] = React.useState<any[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Applications</h1>
        <p className="text-muted-foreground text-sm">Track the status of your submitted volunteer role applications.</p>
      </div>

      {applications.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Applications Submitted</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You haven&apos;t applied for any volunteer roles yet. Explore published opportunities to get started!
            </p>
            <Link href="/opportunities" className="inline-block pt-2">
              <Button size="sm" className="gap-1.5 font-semibold">
                Browse Opportunities <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
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
      )}
    </div>
  );
}
