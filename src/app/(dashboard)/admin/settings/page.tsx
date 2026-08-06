"use client";

import * as React from "react";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("System Settings Updated!");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground text-sm">Configure global platform rules and maintenance toggles.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-xl font-bold">Platform Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="app_name">System Name</Label>
              <Input id="app_name" defaultValue="Volunteer by KROW" />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="gap-2 font-semibold">
          <Save className="w-4 h-4" /> Save System Settings
        </Button>
      </form>
    </div>
  );
}
