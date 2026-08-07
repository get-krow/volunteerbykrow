"use client";

import * as React from "react";
import { Bell, CheckCircle2, MessageSquare, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function VolunteerNotificationsPage() {
  const [notifications, setNotifications] = React.useState<any[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground text-sm">Stay updated on your application status, verified hours, and message alerts.</p>
      </div>

      {notifications.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Notifications Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You&apos;re all caught up! System notifications, application updates, and verified hour alerts will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
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
      )}
    </div>
  );
}
