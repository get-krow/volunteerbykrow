"use client";

import * as React from "react";
import { Bell, CheckCircle2, MessageSquare, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const notifications = [
  { id: 1, title: "Hours Approved!", desc: "Green Earth Foundation verified your 4.0 hours for Coastal Beach Cleanup.", time: "2 hours ago", icon: CheckCircle2, color: "text-green-500" },
  { id: 2, title: "Application Accepted", desc: "Bright Futures Academy approved your STEM Tutor application.", time: "1 day ago", icon: Award, color: "text-primary" },
  { id: 3, title: "New Message", desc: "You received a new message from Green Earth Coordinator.", time: "2 days ago", icon: MessageSquare, color: "text-blue-500" },
];

export default function VolunteerNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground text-sm">Stay updated on your application status, verified hours, and message alerts.</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className="border-border bg-card">
            <CardContent className="p-5 flex items-start gap-4">
              <div className={`p-2.5 rounded-xl bg-muted shrink-0 ${n.color}`}>
                <n.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-bold text-sm">{n.title}</h3>
                  <span className="text-[10px] text-muted-foreground">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
