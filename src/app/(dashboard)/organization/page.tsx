"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Briefcase, Clock, FileText, ArrowRight,
  TrendingUp, Plus, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const recentApplications = [
  { id: 1, name: "Sarah Chen", opportunity: "Beach Cleanup", status: "pending", time: "1h ago" },
  { id: 2, name: "Marcus Rodriguez", opportunity: "Food Drive", status: "approved", time: "3h ago" },
  { id: 3, name: "Emily Foster", opportunity: "Tutoring Session", status: "pending", time: "5h ago" },
  { id: 4, name: "David Park", opportunity: "Park Restoration", status: "rejected", time: "1d ago" },
];

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const, icon: AlertCircle },
  approved: { label: "Approved", variant: "default" as const, icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive" as const, icon: XCircle },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function OrganizationDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organization Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your volunteer programs and track impact.
          </p>
        </div>
        <Link href="/organization/opportunities/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Opportunity
          </Button>
        </Link>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Active Volunteers"
          value="0"
          icon={Users}
          description="0 active this month"
        />
        <StatCard
          title="Open Opportunities"
          value="0"
          icon={Briefcase}
          description="0 published"
        />
        <StatCard
          title="Total Hours"
          value="0"
          icon={Clock}
          description="0 verified hours"
        />
        <StatCard
          title="Applications"
          value="0"
          icon={FileText}
          description="0 pending review"
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card"
        >
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-base font-semibold">Recent Applications</h2>
            <Link href="/organization/applications">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="px-6 pb-6 space-y-2">
            {recentApplications.map((app) => {
              const config = statusConfig[app.status as keyof typeof statusConfig];
              return (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {app.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.opportunity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={config.variant} className="text-xs">
                      {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{app.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Stats Chart placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-base font-semibold">Volunteer Growth</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Monthly active volunteers</p>
          <div className="mt-8 flex items-center justify-center h-48 rounded-lg bg-muted/50">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="mt-2 text-sm text-muted-foreground">
                Charts will appear when data is available
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
