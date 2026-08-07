"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function NewOpportunityPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("environment");
  const [location, setLocation] = React.useState("");
  const [eventDate, setEventDate] = React.useState("");
  const [eventTime, setEventTime] = React.useState("");
  const [hours, setHours] = React.useState("4");
  const [capacity, setCapacity] = React.useState("20");
  const [description, setDescription] = React.useState("");

  // Image Upload State
  const [imageUrl, setImageUrl] = React.useState("");
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size exceeds 5MB limit.");
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageUrl(dataUrl);
      setUploadingImage(false);
      toast.success("Opportunity image attached!");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error("You must be logged in as an organization to create an opportunity.");
        setLoading(false);
        return;
      }

      // 1. Get or create Organization for user
      let orgId: string | null = null;

      const { data: existingOrg } = await supabase
        .from("organizations")
        .select("id")
        .eq("created_by", user.id)
        .limit(1)
        .maybeSingle();

      if (existingOrg?.id) {
        orgId = existingOrg.id;
      } else {
        const orgName = user.user_metadata?.full_name || "My Organization";
        const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
        const { data: newOrg, error: orgError } = await supabase
          .from("organizations")
          .insert({
            name: orgName,
            slug,
            email: user.email || "org@krow.app",
            created_by: user.id,
          })
          .select("id")
          .single();

        if (orgError) {
          console.error("Org creation error:", orgError);
        } else if (newOrg?.id) {
          orgId = newOrg.id;
          // Also add org_member row so RLS policies pass cleanly
          await supabase.from("org_members").insert({
            organization_id: orgId,
            user_id: user.id,
            role: "owner",
          });
        }
      }

      const isRemote = location.toLowerCase().includes("remote") || location.toLowerCase().includes("online");
      const defaultImage = imageUrl || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80";

      // 2. Insert opportunity into Supabase
      const { data: createdOpp, error: oppError } = await supabase
        .from("opportunities")
        .insert({
          organization_id: orgId,
          created_by: user.id,
          title: title || "New Volunteer Opportunity",
          description: (description || "Join us and make a positive impact in the community!") + (eventTime ? `\n\nShift Time: ${eventTime}` : ""),
          address: location || "Local Community",
          is_remote: isRemote,
          start_date: eventDate ? new Date(eventDate).toISOString() : new Date().toISOString(),
          capacity: parseInt(capacity) || 20,
          spots_filled: 0,
          volunteer_hours: parseFloat(hours) || 4,
          status: "published",
          images: [defaultImage],
          skills_required: ["Community Service", "Teamwork"],
        })
        .select("id")
        .single();

      if (oppError) {
        console.error("Supabase opportunity insert error:", oppError);
        toast.error("Failed to publish opportunity: " + oppError.message);
        setLoading(false);
        return;
      }

      toast.success("Opportunity Published Successfully!");
      router.push("/organization/opportunities");
    } catch (err: any) {
      console.error("Unhandled error publishing opportunity:", err);
      toast.error("Error creating opportunity: " + (err?.message || "Unknown error"));
      setLoading(false);
    }
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
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Community Garden Maintenance & Planting"
                required
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2 pt-1">
              <Label>Opportunity Image (Optional)</Label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {imageUrl ? (
                <div className="relative h-48 w-full rounded-xl overflow-hidden border border-border group">
                  <img src={imageUrl} alt="Opportunity Banner Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 text-center cursor-pointer transition-colors space-y-2 bg-muted/20"
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <div className="text-sm font-semibold">Click to upload banner image</div>
                  <div className="text-xs text-muted-foreground">PNG, JPG or WebP up to 5MB</div>
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
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
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Santa Monica, CA or Remote"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date">Event Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time">Event Start & End Time *</Label>
                <Input
                  id="time"
                  type="text"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="e.g. 9:00 AM - 1:00 PM"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="hours">Volunteer Hours *</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="4"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="capacity">Volunteer Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="20"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe responsibilities, location instructions, equipment needed, and expected impact..."
                required
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" disabled={loading || uploadingImage} className="gap-2 font-semibold">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? "Publishing Opportunity..." : "Publish Opportunity"}
        </Button>
      </form>
    </div>
  );
}
