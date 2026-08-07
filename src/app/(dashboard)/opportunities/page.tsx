"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Clock, Filter, Sparkles, Building2, ArrowRight, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { categories } from "@/config/site";
import { getOpportunitiesAction } from "@/actions/opportunities";
import { applyForOpportunityAction, getUserApplicationsAction } from "@/actions/applications";
import { toast } from "sonner";
import { CheckCircle2, UserCheck, Loader2 } from "lucide-react";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [remoteOnly, setRemoteOnly] = React.useState(false);
  const [signedUpIds, setSignedUpIds] = React.useState<string[]>([]);
  const [signingUpId, setSigningUpId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadOpportunities() {
      const res = await getOpportunitiesAction();
      if (res?.opportunities) {
        setOpportunities(res.opportunities.map(item => ({
          id: item.id,
          title: item.title,
          organization: item.organizations?.name || "Verified Organization",
          location: item.is_remote ? "Remote / Online" : item.address || "Local Community",
          is_remote: item.is_remote,
          date: new Date(item.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          hours: item.volunteer_hours,
          age_eligibility: item.age_eligibility ? `${item.age_eligibility}+ Years` : "All Ages",
          category: item.category_id || "General",
          spots_left: item.capacity ? item.capacity - item.spots_filled : 10,
          image: item.images?.[0] || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80",
          tags: item.tags || ["Volunteering", "Community"]
        })));
      }

      // Fetch user's registered applications
      const appsRes = await getUserApplicationsAction();
      if (appsRes?.applications) {
        const ids = appsRes.applications.map((a: any) => a.opportunity_id);
        setSignedUpIds(ids);
      }

      setLoading(false);
    }
    loadOpportunities();
  }, []);

  const handleInstantSignup = async (oppId: string, title: string) => {
    if (signedUpIds.includes(oppId)) return;

    setSigningUpId(oppId);
    const res = await applyForOpportunityAction(oppId);
    setSigningUpId(null);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    setSignedUpIds([...signedUpIds, oppId]);
    toast.success("1-Click Sign-up Successful! 🎉", {
      description: `You are registered for "${title}". Event added to your Volunteer Calendar.`,
    });
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? opp.category === selectedCategory : true;
    const matchesRemote = remoteOnly ? opp.is_remote : true;
    return matchesSearch && matchesCategory && matchesRemote;
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="px-3 py-1 text-xs border-primary/20 bg-primary/10 text-primary">
          <Sparkles className="w-3 h-3 mr-1" /> Discover Opportunities
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Find your next <span className="text-primary">impactful role</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Browse verified volunteer events and join instantly with 1-click registration.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, organization, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button
            variant={remoteOnly ? "default" : "outline"}
            onClick={() => setRemoteOnly(!remoteOnly)}
            className="h-11 gap-2"
          >
            <Filter className="h-4 w-4" />
            {remoteOnly ? "Remote Only Enabled" : "Remote Only"}
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

            {/* Opportunities Grid */}
      {filteredOpportunities.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Opportunities Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              There are currently no published opportunities matching your filter criteria. Check back soon for new organization listings!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => {
            const isSignedUp = signedUpIds.includes(opp.id);
            return (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-border bg-card overflow-hidden h-full flex flex-col hover:border-primary/50 transition-all hover:shadow-md group">
                  <Link href={`/opportunities/${opp.id}`} className="block flex-1">
                    <div className="relative h-44 w-full bg-muted overflow-hidden">
                      <img
                        src={opp.image}
                        alt={opp.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge className="bg-background/90 text-foreground backdrop-blur-md shadow-sm">
                          {opp.category}
                        </Badge>
                        <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-md shadow-sm">
                          {opp.age_eligibility}
                        </Badge>
                      </div>
                      {isSignedUp && (
                        <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Registered
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-5 pb-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-1">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        <span>{opp.organization}</span>
                      </div>
                      <CardTitle className="text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {opp.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-2 space-y-3">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          <span>{opp.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>{opp.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{opp.hours}h</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {opp.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Link>
                  <CardFooter className="p-5 pt-0 flex items-center justify-between border-t border-border mt-auto pt-4">
                    <span className="text-xs text-muted-foreground font-medium">
                      {isSignedUp ? "Registration Confirmed" : "Instant Sign-Up"}
                    </span>
                    <Button
                      size="sm"
                      disabled={isSignedUp || signingUpId === opp.id}
                      onClick={() => handleInstantSignup(opp.id, opp.title)}
                      className={`gap-1.5 font-semibold ${isSignedUp ? "bg-green-600/90 text-white opacity-100 cursor-default" : ""}`}
                    >
                      {signingUpId === opp.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isSignedUp ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" /> Registered ✓
                        </>
                      ) : (
                        <>Sign Up</>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredOpportunities.length > 0 && (
        <div className="pt-8 border-t border-border flex items-center justify-between">
          <Button variant="outline" size="sm" disabled className="gap-1 font-semibold">
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <div className="text-xs text-muted-foreground font-medium">
            Showing 1 - {filteredOpportunities.length} of {filteredOpportunities.length} opportunities
          </div>
          <Button variant="default" size="sm" className="gap-1.5 font-semibold">
            Next Page <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
