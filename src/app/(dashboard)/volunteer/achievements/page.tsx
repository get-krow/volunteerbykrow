"use client";

import * as React from "react";
import { Award, ShieldCheck, Download, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const badges = [
  { name: "First Step", desc: "Logged first verified service shift", icon: Star, color: "text-amber-500 bg-amber-500/10" },
  { name: "Eco Guardian", desc: "Completed 5+ environmental restoration events", icon: ShieldCheck, color: "text-green-500 bg-green-500/10" },
  { name: "Community Pillar", desc: "Logged 25+ total verified hours", icon: Award, color: "text-primary bg-primary/10" },
];

export default function VolunteerAchievementsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Achievements & Certificates</h1>
        <p className="text-muted-foreground text-sm">Earn verified milestone badges and export official service hour transcripts.</p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-background to-accent/10">
        <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <Badge className="bg-primary text-primary-foreground">Official Certificate Available</Badge>
            <h2 className="text-2xl font-bold">2026 Community Service Certificate</h2>
            <p className="text-xs text-muted-foreground max-w-lg">
              Official PDF document signed with cryptographically verifiable KROW signatures for high school, university, and employment submissions.
            </p>
          </div>
          <Button size="lg" className="gap-2 shrink-0 font-semibold" onClick={() => toast("Downloading Official Service Certificate PDF...")}>
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Earned Badges</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {badges.map((b) => (
            <Card key={b.name} className="border-border bg-card">
              <CardContent className="p-6 text-center space-y-3">
                <div className={`p-4 rounded-full w-14 h-14 mx-auto flex items-center justify-center ${b.color}`}>
                  <b.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base">{b.name}</h3>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
