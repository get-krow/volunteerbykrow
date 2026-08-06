"use client";

import * as React from "react";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const upcomingEvents = [
  { id: 1, title: "Coastal Beach Cleanup", org: "Green Earth Foundation", date: "Saturday, Aug 15, 2026", time: "9:00 AM - 1:00 PM", location: "Santa Monica State Beach, Pier 2" },
  { id: 2, title: "After-School STEM Tutoring", org: "Bright Futures Academy", date: "Tuesday, Aug 18, 2026", time: "4:00 PM - 6:00 PM", location: "Online / Zoom" },
];

export default function VolunteerCalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Event Calendar</h1>
        <p className="text-muted-foreground text-sm">View your upcoming scheduled volunteer shifts and events.</p>
      </div>

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
    </div>
  );
}
