"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const savedOpps = [
  {
    id: "1",
    title: "Coastal Beach Cleanup & Ecosystem Restoration",
    organization: "Green Earth Foundation",
    location: "Santa Monica, CA",
    hours: 4,
    category: "Environment",
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "3",
    title: "Community Food Pantry Packing & Distribution",
    organization: "Community Aid Network",
    location: "Los Angeles, CA",
    hours: 3,
    category: "Hunger",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80",
  },
];

export default function VolunteerSavedPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          Saved Opportunities <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        </h1>
        <p className="text-muted-foreground text-sm">Opportunities you have bookmarked for later application.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {savedOpps.map((opp) => (
          <Card key={opp.id} className="border-border bg-card overflow-hidden flex flex-col justify-between">
            <div>
              <div className="relative h-40 w-full bg-muted overflow-hidden">
                <img src={opp.image} alt={opp.title} className="w-full h-full object-cover" />
                <Badge className="absolute top-3 right-3 bg-background/90 text-foreground backdrop-blur-md">{opp.category}</Badge>
              </div>
              <CardHeader className="p-5 pb-2">
                <p className="text-xs text-muted-foreground">{opp.organization}</p>
                <CardTitle className="text-lg font-bold line-clamp-1">{opp.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-2">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" />{opp.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" />{opp.hours} hrs</span>
                </div>
              </CardContent>
            </div>
            <CardFooter className="p-5 pt-0 border-t border-border mt-auto pt-4 flex items-center justify-between">
              <span className="text-xs text-red-500 font-medium">Saved</span>
              <Link href={`/opportunities/${opp.id}`}>
                <Button size="sm" className="gap-1">
                  Apply Now <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
