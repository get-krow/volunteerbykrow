"use client";

import * as React from "react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function OrganizationHoursPage() {
  const [logs, setLogs] = React.useState<any[]>([]);

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

      {logs.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Pending Hours to Verify</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              When volunteers complete events and log hours for your organization, they will appear here for your verification.
            </p>
          </CardContent>
        </Card>
      ) : (
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
      )}
    </div>
  );
}
