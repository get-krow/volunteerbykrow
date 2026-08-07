"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, MapPin, Calendar, Clock, Edit, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function OrganizationOpportunitiesPage() {
  const [orgOpps, setOrgOpps] = React.useState<any[]>([]);

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

      {orgOpps.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-12 text-center space-y-3">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="text-lg font-bold">No Opportunities Published Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You haven&apos;t created any volunteer opportunities yet. Click below to publish your first opportunity.
            </p>
            <Link href="/organization/opportunities/new" className="inline-block pt-2">
              <Button className="gap-1.5 font-semibold">
                <Plus className="w-4 h-4" /> Create First Opportunity
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {orgOpps.map((opp) => (
            <Card key={opp.id} className="border-border bg-card flex flex-col justify-between">
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
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => toast("Edit modal loaded")}>
                  <Edit className="w-3.5 h-3.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => toast("Listing archived")}>
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
