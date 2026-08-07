"use client";

import * as React from "react";
import { Users, Mail, Phone, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { getOrgApplicationsAction } from "@/actions/applications";
import { Loader2 } from "lucide-react";

export default function OrganizationVolunteersPage() {
  const [volunteers, setVolunteers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadVolunteers() {
      const res = await getOrgApplicationsAction();
      if (res?.applications) {
        // Map unique volunteers from applications
        const map = new Map();
        res.applications.forEach((app: any) => {
          const prof = app.profiles;
          if (prof?.id && !map.has(prof.id)) {
            map.set(prof.id, {
              id: prof.id,
              name: prof.full_name || "Volunteer",
              email: prof.email || "volunteer@krow.app",
              totalHours: parseFloat(prof.total_hours || "0"),
            });
          }
        });
        setVolunteers(Array.from(map.values()));
      }
      setLoading(false);
    }
    loadVolunteers();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading volunteer roster...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Volunteer Roster</h1>
        <p className="text-muted-foreground text-sm">View active volunteers registered with your organization.</p>
      </div>

      {volunteers.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Active Volunteers Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Volunteers will appear in your roster once they register for your published opportunities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-3 gap-6">
          {volunteers.map((v) => (
            <Card key={v.id} className="border-border bg-card">
              <CardContent className="p-6 text-center space-y-3">
                <Avatar className="h-16 w-16 mx-auto border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {v.name ? v.name.slice(0, 2).toUpperCase() : "V"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-base">{v.name}</h3>
                  <p className="text-xs text-muted-foreground">{v.email}</p>
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">{v.totalHours || 0} hrs served</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
