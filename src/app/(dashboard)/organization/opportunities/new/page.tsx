"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function NewOpportunityPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success("Opportunity Published Successfully!");
      router.push("/organization/opportunities");
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <Link href="/organization/opportunities">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to opportunities
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Create Opportunity</h1>
        <p className="text-muted-foreground text-sm">Publish a new volunteer role to recruit passionate volunteers.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Role & Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Opportunity Title *</Label>
              <Input id="title" placeholder="e.g. Community Garden Maintenance & Planting" required />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category *</Label>
                <Select defaultValue="environment">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="hunger">Hunger & Relief</SelectItem>
                    <SelectItem value="animals">Animals</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" placeholder="e.g. Santa Monica, CA or Remote" required />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Event Date *</Label>
                <Input id="date" type="date" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time">Event Start & End Time *</Label>
                <Input id="time" type="text" placeholder="e.g. 9:00 AM - 1:00 PM" required />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="hours">Volunteer Hours *</Label>
                <Input id="hours" type="number" step="0.5" placeholder="4" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="age_eligibility">Age Eligibility *</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="age_eligibility">
                    <SelectValue placeholder="Age Requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages Welcome</SelectItem>
                    <SelectItem value="13">13+ Years Old</SelectItem>
                    <SelectItem value="16">16+ Years Old</SelectItem>
                    <SelectItem value="18">18+ Years Old</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_email">Organizer Contact Email *</Label>
                <Input id="contact_email" type="email" placeholder="event@org.org" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea id="description" rows={5} placeholder="Describe responsibilities, location instructions, equipment needed, and expected impact..." required />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" disabled={loading} className="gap-2 font-semibold">
          <Save className="w-4 h-4" /> {loading ? "Publishing..." : "Publish Opportunity"}
        </Button>
      </form>
    </div>
  );
}
