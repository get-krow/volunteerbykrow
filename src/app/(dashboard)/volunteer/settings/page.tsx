"use client";

import * as React from "react";
import { User, Mail, Phone, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { signOut, deleteAccount } from "@/actions/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export default function VolunteerSettingsPage() {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile Updated Successfully!");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await deleteAccount();
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your profile details, contact preferences, and account controls.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Volunteer Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar Placeholder */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl border border-primary/20">
                AR
              </div>
              <div>
                <Button type="button" variant="outline" size="sm" onClick={() => toast("Profile picture upload feature active")}>
                  Change Profile Picture
                </Button>
                <p className="text-xs text-muted-foreground mt-1">JPG or PNG. Max 5MB.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" defaultValue="Alex Rivera" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address (Read-Only)</Label>
                <Input id="email" type="email" defaultValue="alex@example.com" disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" defaultValue="(555) 234-5678" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Biography</Label>
              <Textarea id="bio" rows={3} defaultValue="Passionate student interested in environmental conservation, tutoring, and community relief." />
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
                  <DialogTitle className="text-xl font-bold text-destructive">Delete Account Permanently?</DialogTitle>
                  <DialogDescription className="pt-2 text-sm">
                    This action is permanent and cannot be undone. All associated data, including verified hours, saved opportunities, and event registrations will be permanently deleted from the database.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" disabled={deleting} onClick={handleDeleteAccount} className="font-semibold">
                    {deleting ? "Deleting..." : "Yes, Delete My Account"}
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
