"use client";

import * as React from "react";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getUserApplicationsAction } from "@/actions/applications";
import { Loader2 } from "lucide-react";

export default function VolunteerCalendarPage() {
  const [upcomingEvents, setUpcomingEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadCalendar() {
      const res = await getUserApplicationsAction();
      if (res?.applications) {
        setUpcomingEvents(res.applications.map((app: any) => {
          const opp = app.opportunities;
          return {
            id: app.id,
            title: opp?.title || "Volunteer Opportunity",
            org: opp?.organizations?.name || "Verified Organization",
            date: new Date(opp?.start_date || Date.now()).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
            time: `${opp?.volunteer_hours || 4} Hours Shift`,
            location: opp?.is_remote ? "Remote / Online" : opp?.address || "Local Community",
          };
        }));
      }
      setLoading(false);
    }
    loadCalendar();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading your volunteer calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Event Calendar</h1>
        <p className="text-muted-foreground text-sm">View your upcoming scheduled volunteer shifts and events.</p>
      </div>

      {upcomingEvents.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Scheduled Events</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your registered volunteer shifts and events will automatically appear on your calendar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {upcomingEvents.map((evt) => (
            <Card key={evt.id} className="border-border bg-card">
              <CardHeader className="p-6 pb-2">
                <Badge className="w-fit mb-1 bg-primary text-primary-foreground">{evt.date}</Badge>
                <CardTitle className="text-xl font-bold">{evt.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{evt.org}</p>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> <span>{evt.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> <span>{evt.location}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
