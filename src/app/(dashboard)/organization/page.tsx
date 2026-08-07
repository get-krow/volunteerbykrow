"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, Briefcase, Clock, Plus, CheckCircle2, XCircle, Calendar, MapPin, Edit
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VolunteerParticipant {
  id: string;
  name: string;
  age: number;
  hours: number;
  status: "registered" | "present" | "absent";
}

interface OpportunityItem {
  id: string;
  title: string;
  date: string;
  location: string;
  hours: number;
  volunteers: VolunteerParticipant[];
}

import { createClient } from "@/lib/supabase/client";
import { getOpportunitiesAction } from "@/actions/opportunities";

export default function OrganizationDashboard() {
  const [opportunities, setOpportunities] = React.useState<OpportunityItem[]>([]);
  const [selectedOppId, setSelectedOppId] = React.useState<string>("");

  React.useEffect(() => {
    async function loadOrgData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const res = await getOpportunitiesAction({ orgUserId: user?.id });
      const data = res?.opportunities || [];

      if (data && data.length > 0) {
        const items: OpportunityItem[] = data.map((d) => ({
          id: d.id,
          title: d.title,
          date: new Date(d.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          location: d.is_remote ? "Remote" : d.address || "Local",
          hours: d.volunteer_hours || 1,
          volunteers: [],
        }));
        setOpportunities(items);
        setSelectedOppId(items[0].id);
      }
    }
    loadOrgData();
  }, []);

  const selectedOpp = opportunities.find(o => o.id === selectedOppId);

  const handleMarkAttendance = (oppId: string, volunteerId: string, status: "present" | "absent", name: string) => {
    setOpportunities(opportunities.map(opp => {
      if (opp.id !== oppId) return opp;
      return {
        ...opp,
        volunteers: opp.volunteers.map(v => v.id === volunteerId ? { ...v, status } : v),
      };
    }));

    if (status === "present") {
      toast.success(`Attendance Verified`, {
        description: `Marked ${name} as Present. Awarded ${selectedOpp?.hours || 0} volunteer hours!`,
      });
    } else {
      toast.error(`Marked Absent`, {
        description: `${name} marked absent. 0 hours awarded.`,
      });
    }
  };

  const totalVolunteersCount = opportunities.reduce((acc, o) => acc + o.volunteers.length, 0);
  const totalVerifiedHours = opportunities.reduce((acc, o) => {
    const presentVolunteers = o.volunteers.filter(v => v.status === "present").length;
    return acc + (presentVolunteers * o.hours);
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Organizer Overview</h1>
          <p className="text-muted-foreground mt-1">
            Manage volunteer events, review rosters, and verify attendance hours.
          </p>
        </div>
        <Link href="/organization/opportunities/new">
          <Button className="gap-2 font-semibold">
            <Plus className="h-4 w-4" /> Add Opportunity
          </Button>
        </Link>
      </div>

      {/* Top Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Active Opportunities"
          value={opportunities.length.toString()}
          icon={Briefcase}
          description="published roles"
        />
        <StatCard
          title="Registered Volunteers"
          value={totalVolunteersCount.toString()}
          icon={Users}
          description="participants joined"
        />
        <StatCard
          title="Verified Hours Awarded"
          value={totalVerifiedHours.toString()}
          icon={Clock}
          description="approved hours"
        />
      </div>

      {/* Main Content: Created Opportunities & Attendance Management */}
      {opportunities.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-4">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold">No Active Opportunities</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Publish volunteer opportunities to start attracting volunteers, tracking attendance, and verifying hours.
            </p>
          </div>
          <Link href="/organization/opportunities/new" className="inline-block pt-2">
            <Button className="gap-2 font-semibold">
              <Plus className="h-4 w-4" /> Create First Opportunity
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Opportunities List */}
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-base font-semibold">Your Opportunities</h2>
            <div className="space-y-3">
              {opportunities.map((opp) => {
                const isSelected = opp.id === selectedOppId;
                return (
                  <div
                    key={opp.id}
                    onClick={() => setSelectedOppId(opp.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <h3 className="text-sm font-bold truncate">{opp.title}</h3>
                    <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {opp.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {opp.location}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-foreground mt-1">
                        <Users className="w-3 h-3 text-primary" /> {opp.volunteers.length} Volunteers Registered
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Event Details & Attendance Approval */}
          <div className="lg:col-span-2 space-y-6 bg-card border border-border rounded-xl p-6">
            {selectedOpp ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-xl font-bold">{selectedOpp.title}</h2>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                      <span>📅 {selectedOpp.date}</span>
                      <span>📍 {selectedOpp.location}</span>
                      <span>⏱ {selectedOpp.hours} Hours</span>
                    </p>
                  </div>
                  <Link href="/organization/opportunities/new">
                    <Button variant="outline" size="sm" className="gap-1 text-xs shrink-0">
                      <Edit className="w-3.5 h-3.5" /> Edit Event
                    </Button>
                  </Link>
                </div>

                {/* Attendance Roster */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Registered Volunteers ({selectedOpp.volunteers.length})</h3>
                    <span className="text-xs text-muted-foreground">Mark attendance to award hours</span>
                  </div>

                  {selectedOpp.volunteers.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">
                      No volunteers registered for this event yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedOpp.volunteers.map((vol) => (
                        <div
                          key={vol.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border bg-muted/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                              {vol.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{vol.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Age: {vol.age} · Opportunity Value: {vol.hours} hrs
                              </p>
                            </div>
                          </div>

                          {/* Attendance Approval Buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {vol.status === "present" ? (
                              <Badge className="bg-green-600 hover:bg-green-700 text-white gap-1 py-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Present ({vol.hours} hrs Verified)
                              </Badge>
                            ) : vol.status === "absent" ? (
                              <Badge variant="destructive" className="gap-1 py-1">
                                <XCircle className="w-3.5 h-3.5" /> Marked Absent (0 hrs)
                              </Badge>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleMarkAttendance(selectedOpp.id, vol.id, "present", vol.name)}
                                  className="gap-1 bg-green-600 hover:bg-green-700 text-white h-8 text-xs font-semibold"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMarkAttendance(selectedOpp.id, vol.id, "absent", vol.name)}
                                  className="gap-1 border-destructive/30 text-destructive hover:bg-destructive/10 h-8 text-xs font-semibold"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Absent
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
