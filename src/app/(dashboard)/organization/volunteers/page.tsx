"use client";

import * as React from "react";
import { Users, Mail, Phone, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function OrganizationVolunteersPage() {
  const [volunteers, setVolunteers] = React.useState<any[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Volunteer Roster</h1>
        <p className="text-muted-foreground text-sm">View active volunteers registered with your organization.</p>
      </div>

      {volunteers.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Active Volunteers Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Volunteers will appear in your roster once they register for your published opportunities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-3 gap-6">
          {volunteers.map((v) => (
            <Card key={v.id} className="border-border bg-card">
              <CardContent className="p-6 text-center space-y-3">
                <Avatar className="h-16 w-16 mx-auto border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {v.name ? v.name.slice(0, 2).toUpperCase() : "V"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-base">{v.name}</h3>
                  <p className="text-xs text-muted-foreground">{v.email}</p>
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">{v.totalHours || 0} hrs served</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
