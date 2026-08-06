"use client";

import * as React from "react";
import { Users, Mail, Phone, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const volunteers = [
  { id: 1, name: "Alex Rivera", email: "alex@example.com", totalHours: 12, status: "Active" },
  { id: 2, name: "Jordan Smith", email: "jordan@example.com", totalHours: 8, status: "Active" },
  { id: 3, name: "Maria Garcia", email: "maria@example.com", totalHours: 24, status: "Active" },
];

export default function OrganizationVolunteersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Volunteer Roster</h1>
        <p className="text-muted-foreground text-sm">View active volunteers registered with your organization.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {volunteers.map((v) => (
          <Card key={v.id} className="border-border bg-card">
            <CardContent className="p-6 text-center space-y-3">
              <Avatar className="h-16 w-16 mx-auto border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">{v.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-base">{v.name}</h3>
                <p className="text-xs text-muted-foreground">{v.email}</p>
              </div>
              <Badge variant="secondary" className="text-xs font-semibold">{v.totalHours} hrs served</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
