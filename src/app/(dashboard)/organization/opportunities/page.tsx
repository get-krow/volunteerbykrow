"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, MapPin, Calendar, Clock, Edit, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { getOpportunitiesAction } from "@/actions/opportunities";
import { toast } from "sonner";

export default function OrganizationOpportunitiesPage() {
  const [orgOpps, setOrgOpps] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchOrgOpps = React.useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const res = await getOpportunitiesAction({ orgUserId: user?.id });

    if (res?.opportunities) {
      setOrgOpps(res.opportunities.map(item => ({
        id: item.id,
        title: item.title,
        status: item.status,
        hours: item.volunteer_hours,
        date: new Date(item.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        spots: `${item.spots_filled || 0} / ${item.capacity || 20} filled`,
        image: item.images?.[0] || "",
      })));
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchOrgOpps();
  }, [fetchOrgOpps]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this opportunity from Supabase?")) return;

    const res = await deleteOpportunityAction(id);
    if (res?.error) {
      toast.error("Failed to delete opportunity: " + res.error);
    } else {
      toast.success("Opportunity permanently deleted from Supabase.");
      fetchOrgOpps();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Our Opportunities</h1>
          <p className="text-muted-foreground text-sm">Manage, edit, or publish new volunteer opportunities for your organization.</p>
        </div>

        <Link href="/organization/opportunities/new">
          <Button className="gap-1.5 font-semibold">
            <Plus className="w-4 h-4" /> Create Opportunity
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" /> Loading opportunities...
        </div>
      ) : orgOpps.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Opportunities Published</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Create your first opportunity to start recruiting local volunteers!
            </p>
            <Link href="/organization/opportunities/new">
              <Button className="gap-1.5 font-semibold mt-2">
                <Plus className="w-4 h-4" /> Post Opportunity
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orgOpps.map((opp) => (
            <Card key={opp.id} className="border-border bg-card flex flex-col overflow-hidden">
              {opp.image && (
                <div className="h-40 w-full overflow-hidden bg-muted">
                  <img src={opp.image} alt={opp.title} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader className="p-6 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30 uppercase text-[10px]">{opp.status}</Badge>
                  <span className="text-xs text-muted-foreground">{opp.spots}</span>
                </div>
                <CardTitle className="text-lg font-bold">{opp.title}</CardTitle>
              </CardHeader>

              <CardContent className="p-6 pt-0 text-xs text-muted-foreground space-y-1">
                <p>Date: {opp.date}</p>
                <p>Hours: {opp.hours} hrs</p>
              </CardContent>

              <CardFooter className="p-6 pt-0 border-t border-border mt-auto pt-4 flex gap-2">
                <Link href={`/opportunities/${opp.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-1">
                    View
                  </Button>
                </Link>
                <Link href={`/organization/opportunities/${opp.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(opp.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
