"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Clock, User, Mail, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function OrganizationApplicationsPage() {
  const [appList, setAppList] = React.useState<any[]>([]);

  const handleStatusChange = (id: number, status: "approved" | "rejected") => {
    setAppList(appList.map(a => a.id === id ? { ...a, status } : a));
    toast.success(`Application ${status === "approved" ? "Approved" : "Declined"}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Volunteer Applications</h1>
        <p className="text-muted-foreground text-sm">Review applicants and assign volunteers to your posted opportunities.</p>
      </div>

      {appList.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Pending Applications</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              When volunteers apply to your opportunities, their applications will appear here for your review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appList.map((app) => (
            <Card key={app.id} className="border-border bg-card">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-base">{app.name}</h3>
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">{app.role}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{app.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{app.phone}</span>
                  </div>
                  {app.notes && <p className="text-xs text-muted-foreground italic">&quot;{app.notes}&quot;</p>}
                </div>

                <div className="flex items-center gap-2">
                  {app.status === "pending" ? (
                    <>
                      <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700 font-semibold" onClick={() => handleStatusChange(app.id, "approved")}>
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-destructive hover:bg-destructive/10" onClick={() => handleStatusChange(app.id, "rejected")}>
                        <XCircle className="w-4 h-4" /> Decline
                      </Button>
                    </>
                  ) : (
                    <Badge variant="outline" className={`capitalize text-xs font-semibold ${app.status === "approved" ? "text-green-600 bg-green-500/10 border-green-500/30" : "text-red-500 bg-red-500/10 border-red-500/30"}`}>
                      {app.status}
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
