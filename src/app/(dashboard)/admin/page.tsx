"use client";

import { motion } from "framer-motion";
import {
  Users, Building2, Briefcase, Clock,
  TrendingUp, Shield, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";

const pendingOrgs = [
  { id: 1, name: "New Hope Charity", type: "Charity", submitted: "2 days ago" },
  { id: 2, name: "Tech for Good", type: "Nonprofit", submitted: "3 days ago" },
  { id: 3, name: "Youth Sports League", type: "Club", submitted: "5 days ago" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform overview and management tools.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total Users"
          value="0"
          icon={Users}
          description="0 registered users"
        />
        <StatCard
          title="Organizations"
          value="0"
          icon={Building2}
          description="0 verified non-profits"
        />
        <StatCard
          title="Active Opportunities"
          value="0"
          icon={Briefcase}
          description="0 published listings"
        />
        <StatCard
          title="Hours This Month"
          value="0"
          icon={Clock}
          description="0 verified service hours"
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Verifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card"
        >
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">Pending Verifications</h2>
              <Badge variant="secondary" className="text-xs">
                {pendingOrgs.length}
              </Badge>
            </div>
          </div>
          <div className="px-6 pb-6 space-y-2">
            {pendingOrgs.map((org) => (
              <div
                key={org.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {org.type} · Submitted {org.submitted}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex h-8 items-center gap-1 rounded-md bg-green-100 dark:bg-green-900/30 px-3 text-xs font-medium text-green-700 dark:text-green-400 hover:bg-green-200 transition-colors">
                    <CheckCircle2 className="h-3 w-3" />
                    Approve
                  </button>
                  <button className="flex h-8 items-center gap-1 rounded-md bg-red-100 dark:bg-red-900/30 px-3 text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-200 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Platform Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h2 className="text-base font-semibold">Platform Health</h2>
          <p className="text-xs text-muted-foreground mt-0.5">System status overview</p>
          <div className="mt-6 space-y-4">
            {[
              { label: "API Response Time", value: "42ms", status: "healthy" },
              { label: "Database Connections", value: "18/100", status: "healthy" },
              { label: "Storage Usage", value: "2.4 GB", status: "healthy" },
              { label: "Active Sessions", value: "1,247", status: "healthy" },
              { label: "Error Rate", value: "0.02%", status: "healthy" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
