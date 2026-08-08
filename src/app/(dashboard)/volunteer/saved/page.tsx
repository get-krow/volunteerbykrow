"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { getOpportunitiesAction } from "@/actions/opportunities";
import { Loader2 } from "lucide-react";

export default function VolunteerSavedPage() {
  const [savedOpps, setSavedOpps] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadSaved() {
      const res = await getOpportunitiesAction();
      if (res?.opportunities) {
        // Read saved IDs from localStorage
        const savedIds: string[] = JSON.parse(localStorage.getItem("krow_saved_opp_ids") || "[]");

        const items = res.opportunities
          .filter((o: any) => savedIds.includes(o.id))
          .map((item: any) => {
            let shiftTime = "9:00 AM to 1:00 PM";
            if (item.description && item.description.includes("Shift Time:")) {
              const match = item.description.match(/Shift Time:\s*([^\n]+)/);
              if (match?.[1]) shiftTime = match[1].trim();
            }

            const rawDate = item.start_date ? item.start_date.split("T")[0] : "";
            const parts = rawDate.split("-");
            let formattedDate = new Date(item.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            if (parts.length === 3) {
              const [y, m, d] = parts.map(Number);
              formattedDate = new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            }

            return {
              id: item.id,
              title: item.title,
              organization: item.organizations?.name || "Verified Organization",
              location: item.is_remote ? "Remote / Online" : item.address || "Local Community",
              date: formattedDate,
              hours: item.volunteer_hours,
              shift_time: shiftTime,
              spots_left: Math.max(0, (item.capacity || 20) - (item.spots_filled || 0)),
              category: item.category_id || "General",
              image: item.images?.[0] || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80",
            };
          });

        setSavedOpps(items);
      }
      setLoading(false);
    }
    loadSaved();
  }, []);

  const handleUnsave = (id: string) => {
    const savedIds: string[] = JSON.parse(localStorage.getItem("krow_saved_opp_ids") || "[]");
    const updated = savedIds.filter(i => i !== id);
    localStorage.setItem("krow_saved_opp_ids", JSON.stringify(updated));
    setSavedOpps(prev => prev.filter(o => o.id !== id));
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading saved opportunities...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Saved Opportunities <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        </h1>
        <p className="text-muted-foreground text-sm">Opportunities you have bookmarked for quick access and application.</p>
      </div>

      {savedOpps.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Saved Opportunities Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Click the &quot;Save&quot; heart button on any opportunity detail page to keep track of events you want to join.
            </p>
            <Link href="/opportunities" className="inline-block pt-2">
              <Button size="sm" className="gap-1.5 font-semibold">
                Explore Opportunities <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {savedOpps.map((opp) => (
            <Card key={opp.id} className="border-border bg-card overflow-hidden flex flex-col justify-between shadow-sm hover:border-primary/50 transition-all">
              <div>
                <div className="relative h-44 w-full bg-muted overflow-hidden">
                  <img src={opp.image} alt={opp.title} className="w-full h-full object-cover" />
                  <Badge className="absolute top-3 right-3 bg-background/90 text-foreground backdrop-blur-md">{opp.category}</Badge>
                </div>
                <CardHeader className="p-5 pb-2">
                  <p className="text-xs text-muted-foreground font-medium">{opp.organization}</p>
                  <CardTitle className="text-lg font-bold line-clamp-1">{opp.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary shrink-0" />{opp.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary shrink-0" />{opp.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary shrink-0" />{opp.hours} hrs</span>
                  </div>
                  <p className="text-xs text-primary font-semibold pt-1">{opp.spots_left} spots remaining • Shift: {opp.shift_time}</p>
                </CardContent>
              </div>
              <CardFooter className="p-5 pt-0 border-t border-border mt-auto pt-4 flex items-center justify-between gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleUnsave(opp.id)} className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10">
                  Remove
                </Button>
                <Link href={`/opportunities/${opp.id}`}>
                  <Button size="sm" className="gap-1 font-semibold">
                    View & Apply <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
