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

const initialHours = [
  { id: 1, org: "Green Earth Foundation", event: "Coastal Beach Cleanup", date: "Aug 2, 2026", hours: 4, status: "approved" },
  { id: 2, org: "Bright Futures Academy", event: "STEM Coding Tutor", date: "Jul 28, 2026", hours: 2, status: "approved" },
  { id: 3, org: "Community Aid Network", event: "Food Pantry Packing", date: "Jul 20, 2026", hours: 3, status: "pending" },
];

export default function VolunteerHoursPage() {
  const [hoursList, setHoursList] = React.useState(initialHours);
  const [open, setOpen] = React.useState(false);

  const [org, setOrg] = React.useState("");
  const [event, setEvent] = React.useState("");
  const [hours, setHours] = React.useState("");
  const [date, setDate] = React.useState("");

  const handleLogHours = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      org: org || "Community Partner",
      event: event || "Volunteer Service Shift",
      date: date || "Today",
      hours: parseFloat(hours) || 2,
      status: "pending",
    };
    setHoursList([newEntry, ...hoursList]);
    setOpen(false);
    toast.success("Hours Submitted for Verification!", {
      description: "Your organization coordinator will review and approve your logged service hours.",
    });
  };

  const totalApproved = hoursList.filter(h => h.status === "approved").reduce((acc, curr) => acc + curr.hours, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Volunteer Hours</h1>
          <p className="text-muted-foreground text-sm">Log your service hours and download official verification certificates.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast("Exporting Certificate PDF...")}>
            <Download className="w-4 h-4" /> Export Certificate
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" /> Log Hours
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleLogHours}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Log Volunteer Hours</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="org">Organization Name</Label>
                    <Input id="org" placeholder="e.g. Green Earth Foundation" value={org} onChange={(e) => setOrg(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="event">Event / Task</Label>
                    <Input id="event" placeholder="e.g. Beach Cleanup Shift" value={event} onChange={(e) => setEvent(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="date">Service Date</Label>
                      <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="hours">Hours Served</Label>
                      <Input id="hours" type="number" step="0.5" placeholder="3.5" value={hours} onChange={(e) => setHours(e.target.value)} required />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">Submit for Verification</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Total Verified Hours</p>
            <p className="text-3xl font-extrabold text-primary">{totalApproved} hrs</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Pending Approvals</p>
            <p className="text-3xl font-extrabold text-amber-500">{hoursList.filter(h => h.status === "pending").length} logs</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Verified Shifts</p>
            <p className="text-3xl font-extrabold text-green-500">{hoursList.filter(h => h.status === "approved").length} shifts</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-lg font-bold">Hours History</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 divide-y divide-border">
          {hoursList.map((entry) => (
            <div key={entry.id} className="py-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-semibold text-sm">{entry.event}</p>
                <p className="text-xs text-muted-foreground">{entry.org} • {entry.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm">{entry.hours} hrs</span>
                {entry.status === "approved" ? (
                  <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600 gap-1 text-xs">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 gap-1 text-xs">
                    <AlertCircle className="w-3 h-3" /> Pending
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
