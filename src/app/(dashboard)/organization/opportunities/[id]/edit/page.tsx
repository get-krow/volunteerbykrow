"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOpportunityByIdAction } from "@/actions/opportunities";
import { updateOpportunityAction } from "@/actions/applications";
import { toast } from "sonner";

export default function EditOpportunityPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [eventDate, setEventDate] = React.useState("");

  // Dropdown Time Selectors
  const [startHour, setStartHour] = React.useState("9");
  const [startMinute, setStartMinute] = React.useState("00");
  const [startPeriod, setStartPeriod] = React.useState("AM");
  const [endHour, setEndHour] = React.useState("1");
  const [endMinute, setEndMinute] = React.useState("00");
  const [endPeriod, setEndPeriod] = React.useState("PM");
  const [hours, setHours] = React.useState("4");
  const [capacity, setCapacity] = React.useState("20");
  const [description, setDescription] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function loadOpp() {
      const resolvedParams = typeof (params as any)?.then === "function" ? await (params as any) : params;
      const oppId = resolvedParams?.id;

      if (!oppId) {
        setLoading(false);
        return;
      }

      const res = await getOpportunityByIdAction(oppId);
      if (res?.opportunity) {
        const o = res.opportunity;
        setTitle(o.title || "");
        setLocation(o.address || "");
        setEventDate(o.start_date ? new Date(o.start_date).toISOString().split("T")[0] : "");
        setHours(o.volunteer_hours?.toString() || "4");
        setCapacity(o.capacity?.toString() || "20");
        setDescription(o.description || "");
        setImageUrl(o.images?.[0] || "");
      } else {
        toast.error("Opportunity not found.");
      }
      setLoading(false);
    }
    loadOpp();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const formattedTime = `${startHour}:${startMinute} ${startPeriod} to ${endHour}:${endMinute} ${endPeriod}`;

    try {
      const resolvedParams = typeof (params as any)?.then === "function" ? await (params as any) : params;
      const oppId = resolvedParams?.id;

      const res = await updateOpportunityAction(oppId, {
        title,
        location,
        eventDate,
        eventTime: formattedTime,
        hours,
        capacity,
        description,
        imageUrl,
      });

      if (res?.error) {
        setErrorMsg(res.error);
        toast.error(res.error);
        setSaving(false);
        return;
      }

      toast.success("Opportunity updated in Supabase successfully!");
      router.push("/organization/opportunities");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update opportunity");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading opportunity details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <Link href="/organization/opportunities">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to opportunities
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Edit Opportunity</h1>
        <p className="text-muted-foreground text-sm">Update event details, hours, capacity, or location.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Role & Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Opportunity Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Community Park Cleanup"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Coquitlam, BC or Remote"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Event Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Event Start & End Time (Dropdown)</Label>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {/* Start Time Selectors */}
                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border">
                  <Select value={startHour} onValueChange={setStartHour}>
                    <SelectTrigger className="h-8 w-14 text-xs font-semibold px-2">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1","2","3","4","5","6","7","8","9","10","11","12"].map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs font-bold">:</span>
                  <Select value={startMinute} onValueChange={setStartMinute}>
                    <SelectTrigger className="h-8 w-14 text-xs font-semibold px-2">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {["00","15","30","45"].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={startPeriod} onValueChange={setStartPeriod}>
                    <SelectTrigger className="h-8 w-16 text-xs font-semibold px-2">
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <span className="text-xs text-muted-foreground font-bold px-1">to</span>

                {/* End Time Selectors */}
                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border">
                  <Select value={endHour} onValueChange={setEndHour}>
                    <SelectTrigger className="h-8 w-14 text-xs font-semibold px-2">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1","2","3","4","5","6","7","8","9","10","11","12"].map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs font-bold">:</span>
                  <Select value={endMinute} onValueChange={setEndMinute}>
                    <SelectTrigger className="h-8 w-14 text-xs font-semibold px-2">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {["00","15","30","45"].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={endPeriod} onValueChange={setEndPeriod}>
                    <SelectTrigger className="h-8 w-16 text-xs font-semibold px-2">
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="hours">Volunteer Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-600 rounded-xl text-sm font-medium">
            {errorMsg}
          </div>
        )}

        <Button type="submit" size="lg" disabled={saving} className="gap-2 font-semibold min-w-[200px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving Changes..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
