"use client";

import * as React from "react";
import { User, Mail, Phone, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function VolunteerSettingsPage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile Updated Successfully!");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your public volunteer profile and notification preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" defaultValue="Alex Rivera" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="alex@example.com" disabled className="bg-muted text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" defaultValue="(555) 234-5678" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Volunteer Bio</Label>
              <Textarea id="bio" rows={3} defaultValue="Passionate high school senior interested in environmental conservation and STEM education." />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="gap-2 font-semibold">
          <Save className="w-4 h-4" /> Save Profile Changes
        </Button>
      </form>
    </div>
  );
}
