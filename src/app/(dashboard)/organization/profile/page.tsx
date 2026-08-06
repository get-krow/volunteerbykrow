"use client";

import * as React from "react";
import { Building2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function OrganizationProfilePage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Organization Profile Saved!");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Organization Profile</h1>
        <p className="text-muted-foreground text-sm">Edit public details shown on your organization directory page.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-xl font-bold">Public Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="org_name">Organization Name</Label>
              <Input id="org_name" defaultValue="Green Earth Foundation" required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input id="website" defaultValue="https://greenearth.org" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue="Santa Monica, CA" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mission">Mission Statement</Label>
              <Textarea id="mission" rows={4} defaultValue="Dedicated to protecting marine wildlife, coastal cleanup, and restoring natural dune environments through active community participation." />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="gap-2 font-semibold">
          <Save className="w-4 h-4" /> Save Profile
        </Button>
      </form>
    </div>
  );
}
