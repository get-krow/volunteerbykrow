"use client";

import * as React from "react";
import { Building2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { signOut, deleteAccount } from "@/actions/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export default function OrganizationProfilePage() {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Organization Profile Saved!");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await deleteAccount();
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Organization Profile</h1>
        <p className="text-muted-foreground text-sm">Manage public organization details, team members, and account controls.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="text-xl font-bold">Organization Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Org Logo Placeholder */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xl border border-primary/20">
                GE
              </div>
              <div>
                <Button type="button" variant="outline" size="sm" onClick={() => toast("Organization logo upload feature active")}>
                  Upload Organization Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">PNG or JPG. Max 5MB.</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="org_name">Organization Name</Label>
              <Input id="org_name" defaultValue="Green Earth Foundation" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Organization Description</Label>
              <Textarea id="description" rows={4} defaultValue="Dedicated to protecting local ecosystems, coastal cleanup, and youth environmental stewardship through active community events." />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue="(555) 890-1234" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input id="contact_email" type="email" defaultValue="contact@greenearth.org" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="members">Organization Members (optional)</Label>
              <Input id="members" placeholder="e.g. coordinator@greenearth.org, admin@greenearth.org" defaultValue="coordinator@greenearth.org" />
              <p className="text-xs text-muted-foreground">Comma-separated email addresses of team members with management access.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <Button type="submit" className="gap-2 font-semibold">
            <Save className="w-4 h-4" /> Save Changes
          </Button>

          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => signOut()} className="gap-1.5 font-medium">
              Log Out
            </Button>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="destructive" className="gap-1.5 font-semibold">
                  Permanently Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-destructive">Delete Organization Account?</DialogTitle>
                  <DialogDescription className="pt-2 text-sm">
                    This action is permanent and cannot be undone. All published opportunities, volunteer attendance records, and organization details will be permanently removed.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" disabled={deleting} onClick={handleDeleteAccount} className="font-semibold">
                    {deleting ? "Deleting..." : "Yes, Delete Organization"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </form>
    </div>
  );
}
