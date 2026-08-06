"use client";

import * as React from "react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const pendingHours = [
  { id: 1, name: "Alex Rivera", event: "Coastal Beach Cleanup", hours: 4, date: "Aug 2, 2026", status: "pending" },
  { id: 2, name: "Jordan Smith", event: "Coastal Beach Cleanup", hours: 4, date: "Aug 2, 2026", status: "pending" },
];

export default function OrganizationHoursPage() {
  const [logs, setLogs] = React.useState(pendingHours);

  const handleVerify = (id: number, status: "approved" | "rejected") => {
    setLogs(logs.map(l => l.id === id ? { ...l, status } : l));
    toast.success(`Hours Log ${status === "approved" ? "Approved & Signed!" : "Declined"}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Verify Hours</h1>
        <p className="text-muted-foreground text-sm">Approve or audit service hour logs submitted by volunteers.</p>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <Card key={log.id} className="border-border bg-card">
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-base">{log.name}</h3>
                  <Badge variant="outline" className="text-xs">{log.event}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{log.date} • <strong className="text-primary">{log.hours} hours logged</strong></p>
              </div>

              <div className="flex items-center gap-2">
                {log.status === "pending" ? (
                  <>
                    <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 font-semibold" onClick={() => handleVerify(log.id, "approved")}>
                      <CheckCircle2 className="w-4 h-4" /> Verify Hours
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-destructive hover:bg-destructive/10" onClick={() => handleVerify(log.id, "rejected")}>
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                  </>
                ) : (
                  <Badge variant="outline" className={`capitalize text-xs font-semibold ${log.status === "approved" ? "text-green-600 bg-green-500/10 border-green-500/30" : "text-red-500 bg-red-500/10 border-red-500/30"}`}>
                    {log.status}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
