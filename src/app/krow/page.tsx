"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Building2, CheckCircle2, XCircle, Clock, Star, Plus, Trash2, Edit, Save, ArrowRight, RefreshCw, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { verifyAdminPasswordAction, getAllOrganizationsAdminAction, toggleOrganizationVerificationAction } from "@/actions/admin";

export default function SecretKrowAdminPage() {
  const [password, setPassword] = React.useState("");
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [authenticating, setAuthenticating] = React.useState(false);

  // Organizations data
  const [organizations, setOrganizations] = React.useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = React.useState(false);
  const [updatingOrgId, setUpdatingOrgId] = React.useState<string | null>(null);

  // Landing Page Reviews State
  const [reviews, setReviews] = React.useState<any[]>([]);

  // Landing Page Partners State
  const [partners, setPartners] = React.useState<string[]>([]);

  const [newPartnerName, setNewPartnerName] = React.useState("");

  // Check auth session on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const authState = localStorage.getItem("krow_admin_auth");
      if (authState === "authenticated") {
        setIsAuthenticated(true);
      }

      // Load saved custom reviews
      const savedReviews = localStorage.getItem("krow_custom_reviews");
      if (savedReviews) {
        try { setReviews(JSON.parse(savedReviews)); } catch (e) {}
      }

      // Load saved custom partners
      const savedPartners = localStorage.getItem("krow_custom_partners");
      if (savedPartners) {
        try { setPartners(JSON.parse(savedPartners)); } catch (e) {}
      }
    }
  }, []);

  // Load organizations when authenticated
  const fetchOrganizations = React.useCallback(async () => {
    setLoadingOrgs(true);
    const res = await getAllOrganizationsAdminAction();
    if (res?.organizations) {
      setOrganizations(res.organizations);
    }
    setLoadingOrgs(false);
  }, []);

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchOrganizations();
    }
  }, [isAuthenticated, fetchOrganizations]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticating(true);
    const res = await verifyAdminPasswordAction(password);

    if (res?.success) {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("krow_admin_auth", "authenticated");
      }
      toast.success("Secret Admin Access Granted 🔓");
    } else {
      toast.error(res?.error || "Incorrect Password");
    }
    setAuthenticating(false);
  };

  const handleToggleVerification = async (orgId: string, currentStatus: string) => {
    setUpdatingOrgId(orgId);
    const nextStatus = currentStatus === "verified" ? "pending" : "verified";
    const res = await toggleOrganizationVerificationAction(orgId, nextStatus);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
      setOrganizations(organizations.map(o => o.id === orgId ? { ...o, verification_status: nextStatus } : o));
    }
    setUpdatingOrgId(null);
  };

  // Add / Remove Reviews
  const handleAddReview = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const author = formData.get("author") as string;
    const role = formData.get("role") as string;
    const text = formData.get("text") as string;

    if (!author || !text) return;

    const newRev = {
      id: Date.now().toString(),
      author,
      role: role || "Volunteer",
      text,
      stars: 5,
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("krow_custom_reviews", JSON.stringify(updated));
    }
    toast.success("Authentic Review Added to Landing Page!");
    e.currentTarget.reset();
  };

  const handleDeleteReview = (id: string) => {
    const updated = reviews.filter(r => r.id !== id);
    setReviews(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("krow_custom_reviews", JSON.stringify(updated));
    }
    toast.success("Review deleted!");
  };

  // Add / Remove Partners
  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim()) return;

    const updated = [...partners, newPartnerName.trim()];
    setPartners(updated);
    setNewPartnerName("");
    if (typeof window !== "undefined") {
      localStorage.setItem("krow_custom_partners", JSON.stringify(updated));
    }
    toast.success("Partner Organization Added!");
  };

  const handleDeletePartner = (name: string) => {
    const updated = partners.filter(p => p !== name);
    setPartners(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("krow_custom_partners", JSON.stringify(updated));
    }
    toast.success("Partner Organization removed!");
  };

  // Secret Password Gate Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border shadow-2xl bg-card">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold">Krow Admin Portal</CardTitle>
            <CardDescription className="text-xs">
              Secret administrative gateway for platform control & verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pass" className="text-xs font-semibold">Admin Passcode</Label>
                <div className="relative">
                  <Key className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="pass"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Secret Passcode"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={authenticating} className="w-full font-bold gap-2">
                {authenticating ? "Authenticating..." : "Unlock Krow Control Panel"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-card shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-extrabold">Krow Master Admin Portal</h1>
            <Badge className="bg-primary text-primary-foreground text-xs font-bold">Authorized Admin</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage organization verifications, authentic reviews, and trusted partner rosters.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIsAuthenticated(false);
            if (typeof window !== "undefined") {
              localStorage.removeItem("krow_admin_auth");
            }
            toast.info("Logged out of Admin Portal");
          }}
          className="text-xs font-semibold shrink-0"
        >
          Lock Admin Portal
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orgs" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md bg-muted">
          <TabsTrigger value="orgs" className="text-xs font-semibold">Organizations</TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs font-semibold">Landing Reviews</TabsTrigger>
          <TabsTrigger value="partners" className="text-xs font-semibold">Trusted Partners</TabsTrigger>
        </TabsList>

        {/* Tab 1: Organization Verification */}
        <TabsContent value="orgs" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Organization Verification Roster</CardTitle>
                <CardDescription className="text-xs">
                  Organizations MUST be verified before they can approve volunteer hours and award attendance.
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={fetchOrganizations} disabled={loadingOrgs} className="gap-1.5 text-xs">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrgs ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {loadingOrgs ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading organizations...</div>
              ) : organizations.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No organizations registered yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-semibold">
                        <th className="p-3">Organization</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {organizations.map((org) => {
                        const isVerified = org.verification_status === "verified";
                        return (
                          <tr key={org.id} className="hover:bg-muted/50 transition-colors">
                            <td className="p-3 font-semibold text-foreground">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-primary shrink-0" />
                                <div>
                                  <div>{org.name}</div>
                                  <div className="text-[10px] text-muted-foreground font-normal">{org.contact_email || "No email listed"}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {[org.city, org.province_state, org.country].filter(Boolean).join(", ") || "Local Community"}
                            </td>
                            <td className="p-3">
                              {isVerified ? (
                                <Badge variant="outline" className="border-green-600 bg-green-50 text-green-700 font-bold gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-green-600" /> Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-amber-600 bg-amber-50 text-amber-700 font-bold gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" /> Unverified / Pending
                                </Badge>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                size="sm"
                                variant={isVerified ? "outline" : "default"}
                                disabled={updatingOrgId === org.id}
                                onClick={() => handleToggleVerification(org.id, org.verification_status)}
                                className={`text-xs font-bold gap-1.5 ${isVerified ? "text-amber-600 border-amber-500 hover:bg-amber-50" : "bg-green-600 hover:bg-green-700 text-white"}`}
                              >
                                {updatingOrgId === org.id ? (
                                  "Updating..."
                                ) : isVerified ? (
                                  <>Revoke Verification</>
                                ) : (
                                  <>Verify Organization ✓</>
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Landing Page Reviews */}
        <TabsContent value="reviews" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Add Authentic Testimonial / Review</CardTitle>
              <CardDescription className="text-xs">Add genuine feedback from real volunteers and organizers to display on the landing page.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddReview} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="author" className="text-xs">Author Name</Label>
                    <Input id="author" name="author" placeholder="e.g. Alex Johnson" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="role" className="text-xs">Role / Title</Label>
                    <Input id="role" name="role" placeholder="e.g. Volunteer / Event Lead" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="text" className="text-xs">Testimonial Quote</Label>
                  <Textarea id="text" name="text" placeholder="Enter genuine review text..." rows={3} required />
                </div>
                <Button type="submit" size="sm" className="font-bold gap-1.5">
                  <Plus className="w-4 h-4" /> Add Review to Landing Page
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <Card key={rev.id} className="border-border bg-card relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold">{rev.author}</CardTitle>
                      <CardDescription className="text-xs">{rev.role}</CardDescription>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteReview(rev.id)} className="h-8 w-8 text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-0.5 text-amber-500">
                    {[...Array(rev.stars || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">"{rev.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Trusted Partners */}
        <TabsContent value="partners" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Manage Trusted Partner Organizations</CardTitle>
              <CardDescription className="text-xs">Update the list of real partner organizations showcased on the home page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddPartner} className="flex gap-2">
                <Input
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="Enter organization name (e.g. Metro Vancouver Parks)"
                  className="flex-1"
                  required
                />
                <Button type="submit" size="sm" className="font-bold gap-1.5 shrink-0">
                  <Plus className="w-4 h-4" /> Add Partner
                </Button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {partners.map((partner) => (
                  <Badge key={partner} variant="secondary" className="px-3 py-1.5 text-xs font-semibold gap-2 border border-border">
                    {partner}
                    <button type="button" onClick={() => handleDeletePartner(partner)} className="text-muted-foreground hover:text-red-500">
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
