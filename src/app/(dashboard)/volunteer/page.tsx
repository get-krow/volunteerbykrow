"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock, Heart, Calendar, ArrowRight,
  MapPin, LogOut, Sparkles, Building2
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EventItem {
  id: string;
  title: string;
  org: string;
  date: string;
  hours: number;
  location: string;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function VolunteerDashboard() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [savedCount, setSavedCount] = React.useState(0);

  const handleLeaveEvent = (eventId: string, title: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    toast.success(`Left Event`, {
      description: `You have been removed from "${title}".`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Volunteer Overview 👋</h1>
        <p className="text-muted-foreground mt-1">
          Discover opportunities, track verified hours, and manage your upcoming events.
        </p>
      </div>

      {/* 3 Top Statistic Cards (V1 Spec) */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-3"
      >
        <StatCard
          title="Upcoming Events"
          value={events.length.toString()}
          icon={Calendar}
          description="registered commitments"
        />
        <StatCard
          title="Verified Hours"
          value="0.0"
          icon={Clock}
          description="hours approved by organizers"
        />
        <StatCard
          title="Saved Opportunities"
          value={savedCount.toString()}
          icon={Heart}
          description="bookmarked for later"
        />
      </motion.div>

      {/* Upcoming Events Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Upcoming Opportunities</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your registered volunteer events
            </p>
          </div>
          <Link href="/opportunities">
            <Button size="sm" className="gap-1.5 font-semibold">
              <Sparkles className="w-4 h-4" /> Discover Roles
            </Button>
          </Link>
        </div>

        <div className="pt-4 space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                No upcoming events. Discover opportunities to join your first event!
              </p>
              <Link href="/opportunities">
                <Button variant="outline" size="sm" className="gap-2">
                  Browse Opportunities <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{event.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" /> {event.org}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.hours} hrs
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLeaveEvent(event.id, event.title)}
                  className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/20 shrink-0 self-end sm:self-center"
                >
                  <LogOut className="w-3.5 h-3.5" /> Leave Event
                </Button>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
