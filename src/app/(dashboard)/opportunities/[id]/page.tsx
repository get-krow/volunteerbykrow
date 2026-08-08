"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Clock, Building2, Share2, Heart, CheckCircle2, ShieldCheck, LogIn, UserPlus, Send, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { getOpportunityByIdAction } from "@/actions/opportunities";
import { applyForOpportunityAction, cancelApplicationAction, getUserApplicationsAction } from "@/actions/applications";
import { toast } from "sonner";

function OpportunityDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoApply = searchParams.get("apply") === "true";

  const [opp, setOpp] = React.useState<any>(null);
  const [loadingOpp, setLoadingOpp] = React.useState(true);
  const [applied, setApplied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = React.useState(true);

  // Modals
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showApplyModal, setShowApplyModal] = React.useState(false);

  // Application Form
  const [notes, setNotes] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const supabase = createClient();

  React.useEffect(() => {
    async function loadData() {
      // Unwrap Next.js 15/16 params Promise
      const resolvedParams = typeof (params as any)?.then === "function" ? await (params as any) : params;
      const oppId = resolvedParams?.id;

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setCheckingAuth(false);

      if (user) {
        let r = user.user_metadata?.role;
        if (!r) {
          const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
          r = prof?.role;
        }
        if (!r) {
          const { data: org } = await supabase.from("organizations").select("id").eq("created_by", user.id).limit(1).maybeSingle();
          if (org) r = "organization";
        }
        setUserRole(r || "volunteer");
      }

      if (!oppId) {
        setLoadingOpp(false);
        return;
      }

      if (user && autoApply) {
        setShowApplyModal(true);
      }

      // Check if volunteer is already registered
      if (user) {
        const appsRes = await getUserApplicationsAction(user.id);
        if (appsRes?.applications) {
          const isApplied = appsRes.applications.some((a: any) => a.opportunity_id === oppId);
          setApplied(isApplied);
        }
      }

      // Fetch real opportunity using Server Action
      const res = await getOpportunityByIdAction(oppId);
      const data = res?.opportunity;

      if (data) {
        setOpp({
          id: data.id,
          title: data.title,
          organization: {
            name: data.organizations?.name || "Verified Organization",
            initials: data.organizations?.name ? data.organizations.name.slice(0, 2).toUpperCase() : "VO",
            verified: true,
            description: data.organizations?.description || "Verified Organization on Volunteer by KROW.",
          },
          location: data.is_remote ? "Remote / Online" : data.address || "Local Community",
          is_remote: data.is_remote,
          date: new Date(data.start_date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" }),
          time: `${new Date(data.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          hours: data.volunteer_hours,
          capacity: data.capacity || 20,
          spots_filled: data.spots_filled || 0,
          category: data.category_id || "General",
          image: data.images?.[0] || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80",
          description: data.description,
          skills: data.skills_required?.length ? data.skills_required : ["Community Service", "Teamwork"],
          requirements: [
            "Must register and confirm attendance prior to start date",
            "Be prepared to follow community event guidelines",
          ],
        });
      }
      setLoadingOpp(false);
    }
    loadData();
  }, [params, autoApply]);

  const handleApplyClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else if (applied) {
      handleCancelRegistration();
    } else {
      setShowApplyModal(true);
    }
  };

  const handleCancelRegistration = async () => {
    if (!opp?.id) return;
    setSubmitting(true);
    const res = await cancelApplicationAction(opp.id);
    setSubmitting(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      setApplied(false);
      toast.info("Registration Cancelled", {
        description: `You have unregistered from "${opp?.title}". You can sign up again anytime.`,
      });
    }
  };

  const handleConfirmApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opp?.id) return;

    setSubmitting(true);
    const res = await applyForOpportunityAction(opp.id);
    setSubmitting(false);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    setShowApplyModal(false);
    setApplied(true);
    toast.success("Application Submitted Successfully! 🎉", {
      description: `Your registration for "${opp?.title}" has been saved. The organizer will see your application on their roster.`,
    });
  };

  if (loadingOpp) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading opportunity details...
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="min-h-screen py-20 px-4 max-w-lg mx-auto text-center space-y-4">
        <h2 className="text-2xl font-bold">Opportunity Not Found</h2>
        <p className="text-sm text-muted-foreground">
          This opportunity may have ended, been archived by the organization, or does not exist.
        </p>
        <Link href="/opportunities">
          <Button className="gap-2 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Browse Active Opportunities
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <Link href="/opportunities">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to opportunities
        </Button>
      </Link>

      {/* Hero Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-primary text-primary-foreground">{opp.category}</Badge>
          {opp.organization.verified && (
            <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600 gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified Org
            </Badge>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{opp.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {opp.organization.initials}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground">{opp.organization.name}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{opp.location}</span>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-muted border border-border shadow-md">
        <img src={opp.image} alt={opp.title} className="w-full h-full object-cover" />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Overview & Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">About this opportunity</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{opp.description}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-semibold">Skills & Tags</h3>
            <div className="flex flex-wrap gap-2">
              {opp.skills.map((skill: string) => (
                <Badge key={skill} variant="secondary" className="px-3 py-1 text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-semibold">Requirements</h3>
            <ul className="space-y-2">
              {opp.requirements.map((req: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right 1 Col: Sidebar Card */}
        <div className="space-y-6">
          <div className="border border-border bg-card rounded-xl p-6 shadow-sm space-y-6 sticky top-24">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Volunteer Hours</span>
                <span className="font-bold text-base text-primary">{opp.hours} Hours</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{opp.date}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">{opp.time}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-medium text-foreground">
                  {opp.capacity - opp.spots_filled} spots remaining
                </span>
              </div>
            </div>

            <hr className="border-border" />

            {userRole === "organization" ? (
              <div className="space-y-3">
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-center text-xs text-primary font-bold">
                  Organizer Preview — You manage this event
                </div>
                <Link href={`/organization/opportunities/${opp.id}/edit`} className="block">
                  <Button className="w-full h-11 text-base font-semibold gap-2">
                    <Edit className="w-4 h-4" /> Edit Opportunity
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  className="w-full h-11 text-base font-semibold"
                  disabled={applied || checkingAuth}
                  onClick={handleApplyClick}
                >
                  {applied ? "Application Submitted ✓" : "Apply for Opportunity"}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => {
                      if (!user) {
                        setShowAuthModal(true);
                      } else {
                        setSaved(!saved);
                        toast(saved ? "Removed from Saved" : "Saved to your list");
                      }
                    }}
                  >
                    <Heart className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                    {saved ? "Saved" : "Save"}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => toast("Share link copied to clipboard")}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <LogIn className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-bold">Sign in required to apply</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              You must be logged in with a Volunteer account to apply for <strong>{opp.title}</strong> and track your verified hours.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Button
              className="w-full h-11 gap-2 font-semibold"
              onClick={() => router.push(`/login?redirectTo=/opportunities/${opp.id}?apply=true`)}
            >
              <LogIn className="w-4 h-4" /> Log In
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 gap-2 font-semibold"
              onClick={() => router.push(`/register?redirectTo=/opportunities/${opp.id}?apply=true`)}
            >
              <UserPlus className="w-4 h-4" /> Create an Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Application Modal */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleConfirmApplication}>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-xl font-bold">Apply for Opportunity</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Submitting your application for <strong>{opp.title}</strong> with {opp.organization.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="applicant_email">Your Email</Label>
                <Input
                  id="applicant_email"
                  value={user?.email || "volunteer@krow.app"}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Why are you interested in this role? (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Share a brief note with the organization..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2 font-semibold">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  return (
    <React.Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground">Loading opportunity...</div>}>
      <OpportunityDetailContent params={params} />
    </React.Suspense>
  );
}
