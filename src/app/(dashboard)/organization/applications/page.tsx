"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Clock, User, Mail, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import { getOrgApplicationsAction, verifyAttendanceAction } from "@/actions/applications";
import { Loader2 } from "lucide-react";

export default function OrganizationApplicationsPage() {
  const [appList, setAppList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [verifyingId, setVerifyingId] = React.useState<string | null>(null);

  const fetchApplications = React.useCallback(async () => {
    const res = await getOrgApplicationsAction();
    if (res?.applications) {
      setAppList(res.applications.map((app: any) => ({
        id: app.id,
        volunteerId: app.volunteer_id,
        opportunityId: app.opportunity_id,
        name: app.profiles?.full_name || "Volunteer",
        email: app.profiles?.email || "volunteer@krow.app",
        role: app.opportunities?.title || "Volunteer Opportunity",
        hours: app.opportunities?.volunteer_hours || 4,
        date: new Date(app.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: app.status || "pending",
      })));
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleVerifyAttendance = async (app: any) => {
    setVerifyingId(app.id);
    const res = await verifyAttendanceAction(app.id, app.volunteerId, app.opportunityId, app.hours);
    setVerifyingId(null);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || "Attendance verified and hours credited!");
      fetchApplications();
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading volunteer applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Volunteer Applications & Attendance</h1>
        <p className="text-muted-foreground text-sm">Review applicants, confirm shift attendance, and verify logged volunteer hours.</p>
      </div>

      {appList.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Pending Applications</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              When volunteers register for your opportunities, their attendance and application details will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appList.map((app) => (
            <Card key={app.id} className="border-border bg-card">
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-base">{app.name}</h3>
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">{app.role}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{app.email}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" />{app.hours} Hours Shift</span>
                    <span>Applied on {app.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {app.status === "pending" ? (
                    <Button
                      size="sm"
                      disabled={verifyingId === app.id}
                      className="gap-1.5 bg-green-600 hover:bg-green-700 font-semibold"
                      onClick={() => handleVerifyAttendance(app)}
                    >
                      {verifyingId === app.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Verify Attendance & Credit Hours
                    </Button>
                  ) : (
                    <Badge variant="outline" className="capitalize text-xs font-semibold text-green-600 bg-green-500/10 border-green-500/30 gap-1 py-1 px-3">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Credited ({app.hours} hrs)
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
