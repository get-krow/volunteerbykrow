"use client";

import * as React from "react";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function OrganizationSettingsPage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings Saved!");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground text-sm">Manage notification alerts and team access.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-xl font-bold">Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="contact_email">Notification Email</Label>
              <Input id="contact_email" defaultValue="contact@greenearth.org" />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="gap-2 font-semibold">
          <Save className="w-4 h-4" /> Save Settings
        </Button>
      </form>
    </div>
  );
}
