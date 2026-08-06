"use client";

import * as React from "react";
import { LifeBuoy, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tickets = [
  { id: 1, user: "John Doe", subject: "Org verification document question", status: "open" },
  { id: 2, user: "Sarah Smith", subject: "Certificate name typo correction", status: "open" },
];

export default function AdminSupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground text-sm">Resolve inquiries submitted by volunteers and organizations.</p>
      </div>

      <div className="space-y-3">
        {tickets.map((t) => (
          <Card key={t.id} className="border-border bg-card">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{t.subject}</h3>
                <p className="text-xs text-muted-foreground">From: {t.user}</p>
              </div>
              <Badge variant="outline" className="text-xs text-amber-500 bg-amber-500/10 border-amber-500/30 uppercase">{t.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
