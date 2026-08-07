"use client";

import * as React from "react";
import { Briefcase, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminOpportunitiesPage() {
  const [opps, setOpps] = React.useState<any[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Audit Opportunities</h1>
        <p className="text-muted-foreground text-sm">Monitor public listings for platform safety compliance.</p>
      </div>

      {opps.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Opportunities to Audit</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Newly created organization listings will appear here for administrative oversight and safety review.
            </p>
          </CardContent>
        </Card>
      ) : (
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
      )}
    </div>
  );
}
