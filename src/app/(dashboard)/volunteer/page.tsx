"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock, FileText, Heart, Award, Calendar, ArrowRight,
  TrendingUp, MapPin, CheckCircle2,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const recentActivity = [
  {
    id: 1,
    type: "application",
    title: "Application Approved",
    description: "Beach Cleanup event at Green Earth",
    time: "2 hours ago",
    icon: CheckCircle2,
    color: "text-green-600",
  },
  {
    id: 2,
    type: "hours",
    title: "Hours Verified",
    description: "3 hours at Community Food Drive",
    time: "5 hours ago",
    icon: Clock,
    color: "text-blue-600",
  },
  {
    id: 3,
    type: "achievement",
    title: "New Achievement",
    description: 'Earned "50 Hours" milestone badge',
    time: "1 day ago",
    icon: Award,
    color: "text-yellow-600",
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Park Restoration Day",
    org: "Green Earth Foundation",
    date: "Aug 12, 2026",
    hours: 4,
    location: "Central Park",
  },
  {
    id: 2,
    title: "After-School Tutoring",
    org: "Bright Futures Academy",
    date: "Aug 14, 2026",
    hours: 2,
    location: "Lincoln Elementary",
  },
  {
    id: 3,
    title: "Meal Prep & Distribution",
    org: "Community Aid Network",
    date: "Aug 16, 2026",
    hours: 3,
    location: "Main Street Kitchen",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function VolunteerDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, Volunteer 👋</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your volunteer journey.
        </p>
      </div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total Hours"
          value="127.5"
          icon={Clock}
          trend={{ value: 12, label: "from last month" }}
          description="from last month"
        />
        <StatCard
          title="Applications"
          value="8"
          icon={FileText}
          description="3 pending"
        />
        <StatCard
          title="Saved"
          value="12"
          icon={Heart}
          description="opportunities"
        />
        <StatCard
          title="Achievements"
          value="5"
          icon={Award}
          description="badges earned"
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card"
        >
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h2 className="text-base font-semibold">Upcoming Events</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your next volunteer commitments
              </p>
            </div>
            <Link href="/volunteer/calendar">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="px-6 pb-6 space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.org}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.hours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card"
        >
          <div className="flex items-center justify-between p-6 pb-4">
            <div>
              <h2 className="text-base font-semibold">Recent Activity</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your latest updates
              </p>
            </div>
            <Link href="/volunteer/notifications">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="px-6 pb-6 space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-muted shrink-0 ${activity.color}`}
                >
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-3"
      >
        <Link href="/opportunities">
          <Button className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Browse Opportunities
          </Button>
        </Link>
        <Link href="/volunteer/hours">
          <Button variant="outline" className="gap-2">
            <Clock className="h-4 w-4" />
            Log Hours
          </Button>
        </Link>
        <Link href="/volunteer/achievements">
          <Button variant="outline" className="gap-2">
            <Award className="h-4 w-4" />
            View Certificates
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
