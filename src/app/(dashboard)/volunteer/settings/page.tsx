"use client";

import * as React from "react";
import { User, Mail, Phone, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { signOut, deleteAccount } from "@/actions/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export default function VolunteerSettingsPage() {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");

  const [birthdate, setBirthdate] = React.useState("");
  const [location, setLocation] = React.useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const calculatedAge = React.useMemo(() => {
    if (!birthdate) return null;
    const diff = Date.now() - new Date(birthdate).getTime();
    const ageYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return ageYears > 0 ? ageYears : 0;
  }, [birthdate]);

  React.useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        setFullName(user.user_metadata?.full_name || "");
        setPhone(user.user_metadata?.phone || "");
        setBio(user.user_metadata?.bio || "");
        setAvatarUrl(user.user_metadata?.avatar_url || "");
        setBirthdate(user.user_metadata?.birthdate || "");
        setLocation(user.user_metadata?.location || "");

        // Fetch from profiles table
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (prof) {
          if (prof.birthdate) setBirthdate(prof.birthdate);
          if (prof.location) setLocation(prof.location);
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarUrl(dataUrl);

      // Save to Supabase Auth metadata
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: dataUrl }
      });

      if (error) {
        toast.error("Failed to save profile picture: " + error.message);
      } else {
        toast.success("Profile picture updated!");
      }
      setUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        phone,
        bio,
        avatar_url: avatarUrl,
        birthdate,
        age: calculatedAge,
        location,
      }
    });

    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        bio,
        birthdate: birthdate || null,
        age: calculatedAge,
        location: location || null,
        updated_at: new Date().toISOString(),
      });
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile & Location Settings Saved! 🎉");
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await deleteAccount();
  };

  const initials = fullName ? fullName.slice(0, 2).toUpperCase() : "U";

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Loading settings...
      </div>
    );
  }

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
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="h-16 w-16 rounded-full object-cover border border-primary/20 shadow-sm shrink-0"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl border border-primary/20 shrink-0">
                  {initials}
                </div>
              )}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingAvatar ? "Uploading..." : "Change Profile Picture"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 5MB.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address (Read-Only)</Label>
                <Input id="email" type="email" value={email} disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
              </div>
            </div>

            {/* Birthdate & Age */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="birthdate">Date of Birth</Label>
                  {calculatedAge !== null && (
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Age: {calculatedAge} yrs
                    </span>
                  )}
                </div>
                <Input
                  id="birthdate"
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>

            {/* Where You Live (Location) */}
            <div className="space-y-1.5">
              <Label htmlFor="location">Where You Live (Location)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Coquitlam, BC, Canada"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Biography & Bio Details</Label>
              <Textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your volunteer interests and background..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <Button type="submit" disabled={saving} className="gap-2 font-semibold">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
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
