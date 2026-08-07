"use client";

import * as React from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOpportunitiesAction } from "@/actions/opportunities";
import { createClient } from "@/lib/supabase/client";

export default function OrganizationCalendarPage() {
  const [scheduledEvents, setScheduledEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadCalendar() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const res = await getOpportunitiesAction({ orgUserId: user?.id });
      if (res?.opportunities) {
        setScheduledEvents(res.opportunities.map((opp: any) => ({
          id: opp.id,
          title: opp.title,
          date: new Date(opp.start_date || Date.now()).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
          hours: `${opp.volunteer_hours || 4} Hours Shift`,
          spots: `${opp.spots_filled || 0} / ${opp.capacity || 20} Registered Volunteers`,
          location: opp.is_remote ? "Remote / Online" : opp.address || "Local Community",
          status: opp.status,
        })));
      }
      setLoading(false);
    }
    loadCalendar();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading organization calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Organization Event Calendar</h1>
          <p className="text-muted-foreground text-sm">Schedule and track your upcoming volunteer events and shifts.</p>
        </div>

        <Link href="/organization/opportunities/new">
          <Button className="gap-1.5 font-semibold">
            <Plus className="w-4 h-4" /> Add Event
          </Button>
        </Link>
      </div>

      {scheduledEvents.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Scheduled Events</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your posted volunteer opportunities will automatically appear here on your event calendar.
            </p>
            <Link href="/organization/opportunities/new">
              <Button className="gap-1.5 font-semibold mt-2">
                <Plus className="w-4 h-4" /> Schedule First Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {scheduledEvents.map((evt) => (
            <Card key={evt.id} className="border-border bg-card">
              <CardHeader className="p-6 pb-2">
                <div className="flex items-center justify-between mb-1">
                  <Badge className="bg-primary text-primary-foreground">{evt.date}</Badge>
                  <span className="text-xs text-muted-foreground">{evt.spots}</span>
                </div>
                <CardTitle className="text-xl font-bold">{evt.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> <span>{evt.hours}</span>
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
