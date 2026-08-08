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
  opportunityId?: string;
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

import { createClient } from "@/lib/supabase/client";
import { OnboardingModal } from "@/components/volunteer/onboarding-modal";
import { Badge } from "@/components/ui/badge";
import { getUserApplicationsAction, cancelApplicationAction } from "@/actions/applications";

export default function VolunteerDashboard() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [verifiedHours, setVerifiedHours] = React.useState<number>(0);
  const [savedCount, setSavedCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // Profile metadata
  const [profileName, setProfileName] = React.useState("Volunteer");
  const [profileAge, setProfileAge] = React.useState<number | null>(null);
  const [profileLocation, setProfileLocation] = React.useState<string>("");
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setProfileName(user.user_metadata?.full_name || "Volunteer");

        // Fetch profile details
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

        const metaLocation = user.user_metadata?.location;
        const metaBirthdate = user.user_metadata?.birthdate;
        const metaAge = user.user_metadata?.age;

        const constructedLoc = [prof?.city || user.user_metadata?.city, prof?.province_state || user.user_metadata?.province_state, prof?.country || user.user_metadata?.country].filter(Boolean).join(", ");
        const resolvedLocation = prof?.location || metaLocation || constructedLoc || "Local Community";
        const resolvedBirthdate = prof?.birthdate || metaBirthdate || "";

        let resolvedAge: number | null = prof?.age ?? metaAge ?? null;
        if (resolvedAge === null && resolvedBirthdate) {
          const diff = Date.now() - new Date(resolvedBirthdate).getTime();
          const computed = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
          if (computed > 0) resolvedAge = computed;
        }

        if (prof?.full_name) setProfileName(prof.full_name);
        setProfileAge(resolvedAge);
        setProfileLocation(resolvedLocation);

        const hasCompletedOnboarding = typeof window !== "undefined" && (
          localStorage.getItem("krow_onboarding_completed") === "true" ||
          localStorage.getItem("krow_onboarding_dismissed") === "true"
        );

        // ONLY ask ONCE: if missing details and not previously completed or dismissed
        if ((!resolvedBirthdate || !resolvedLocation || resolvedLocation === "Local Community") && !hasCompletedOnboarding) {
          setShowOnboarding(true);
        }

        // Calculate total verified hours
        const { data: vhData } = await supabase
          .from("volunteer_hours")
          .select("hours")
          .eq("volunteer_id", user.id)
          .in("status", ["approved", "verified"]);

        const sumHours = vhData ? vhData.reduce((acc, curr) => acc + (parseFloat(curr.hours) || 0), 0) : 0;
        setVerifiedHours(sumHours);
      }

      // Load applications
      const res = await getUserApplicationsAction();
      if (res?.applications) {
        setEvents(res.applications.map((app: any) => {
          const opp = app.opportunities;
          return {
            id: app.id,
            opportunityId: app.opportunity_id || opp?.id,
            title: opp?.title || "Volunteer Opportunity",
            org: opp?.organizations?.name || "Verified Organization",
            date: new Date(opp?.start_date || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            hours: opp?.volunteer_hours || 4,
            location: opp?.is_remote ? "Remote" : opp?.address || "Local Community",
          };
        }));
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleLeaveEvent = async (oppId: string, title: string) => {
    const res = await cancelApplicationAction(oppId);
    if (res?.error) {
      toast.error(res.error);
      return;
    }

    setEvents(events.filter(e => e.opportunityId !== oppId && e.id !== oppId));
    toast.success(`Left Event`, {
      description: `Your registration for "${title}" has been cancelled.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Onboarding Modal post-signin */}
      <OnboardingModal
        open={showOnboarding}
        onOpenChange={(val) => {
          setShowOnboarding(val);
          if (!val && typeof window !== "undefined") {
            localStorage.setItem("krow_onboarding_dismissed", "true");
          }
        }}
        onComplete={(data) => {
          setProfileAge(data.age);
          setProfileLocation(data.location);
          if (typeof window !== "undefined") {
            localStorage.setItem("krow_onboarding_completed", "true");
          }
        }}
      />

      {/* Header & Profile Bio Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-background to-card shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Welcome, {profileName} 👋</h1>
            {profileAge !== null && (
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary font-bold text-xs">
                {profileAge} years old
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-semibold text-foreground">{profileLocation || "Location Not Set"}</span>
            <span>•</span>
            <span>Verified Volunteer Account</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowOnboarding(true)}
          className="text-xs font-semibold shrink-0 self-start sm:self-center"
        >
          Update DOB & Location
        </Button>
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
          value={verifiedHours.toFixed(1)}
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
