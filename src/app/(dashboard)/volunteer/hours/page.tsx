"use client";

import * as React from "react";
import { Clock, Plus, Download, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

export default function VolunteerHoursPage() {
  const [historyList, setHistoryList] = React.useState<any[]>([]);
  const [totalVerifiedHours, setTotalVerifiedHours] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadHours() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Load volunteer_hours list
        const { data: vh } = await supabase
          .from("volunteer_hours")
          .select("*, opportunities(title), organizations(name)")
          .eq("volunteer_id", user.id)
          .order("created_at", { ascending: false });

        if (vh) {
          const approved = vh.filter((h: any) => h.status === "approved" || h.status === "verified");
          const totalSum = approved.reduce((acc: number, curr: any) => acc + (parseFloat(curr.hours) || 0), 0);
          setTotalVerifiedHours(totalSum);

          setHistoryList(vh.map((h: any) => ({
            id: h.id,
            event: h.opportunities?.title || "Volunteer Opportunity",
            org: h.organizations?.name || "Verified Organization",
            date: h.date || new Date(h.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            hours: h.hours,
            status: h.status || "approved",
          })));
        } else {
          setTotalVerifiedHours(0);
        }
      }
      setLoading(false);
    }
    loadHours();
  }, []);

  const completedOpportunitiesCount = historyList.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Hours</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View your verified volunteer hours and completed opportunity history. Hours are automatically added once verified by organizers.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Verified Volunteer Hours</p>
            <p className="text-4xl font-extrabold text-primary">{totalVerifiedHours} hrs</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Completed Opportunities</p>
            <p className="text-4xl font-extrabold text-foreground">{completedOpportunitiesCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Volunteer History */}
      <Card className="border-border bg-card">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-lg font-bold">Volunteer History</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 divide-y divide-border">
          {historyList.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No completed volunteer history yet. Sign up for opportunities to earn verified hours!
            </div>
          ) : (
            historyList.map((entry) => (
              <div key={entry.id} className="py-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-bold text-sm">{entry.event}</p>
                  <p className="text-xs text-muted-foreground">{entry.org} • {entry.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-primary">+{entry.hours} hrs</span>
                  <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600 gap-1 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
