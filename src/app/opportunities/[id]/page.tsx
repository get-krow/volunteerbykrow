"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Clock, Building2, Share2, Heart, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const [applied, setApplied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const opp = {
    id: params.id,
    title: "Coastal Beach Cleanup & Ecosystem Restoration",
    organization: {
      name: "Green Earth Foundation",
      initials: "GE",
      verified: true,
      description: "Dedicated to protecting marine wildlife and restoring natural coastal environments through community action.",
    },
    location: "Santa Monica State Beach, Pier 2, CA",
    is_remote: false,
    date: "Saturday, Aug 15, 2026",
    time: "9:00 AM - 1:00 PM PST",
    hours: 4,
    capacity: 20,
    spots_filled: 12,
    category: "Environment",
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80",
    description: `Join us for our monthly Coastal Beach Cleanup and Ecosystem Restoration event! We will be collecting microplastics, clearing marine debris, and planting native dune vegetation to prevent erosion.

All supplies including gloves, bags, and tools will be provided. Please wear comfortable shoes, sun protection, and bring a reusable water bottle.

This event is eligible for official community service hour verification certificates via KROW.`,
    skills: ["Teamwork", "Physical Activity", "Environmental Awareness"],
    requirements: [
      "Must be at least 14 years old (under 18 requires guardian waiver)",
      "Able to walk on uneven sandy terrain for up to 3 hours",
      "Bring reusable water bottle and sunscreen",
    ],
  };

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
              {opp.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="px-3 py-1 text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-semibold">Requirements</h3>
            <ul className="space-y-2">
              {opp.requirements.map((req, idx) => (
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
                  {opp.capacity - opp.spots_filled} spots remaining ({opp.capacity} total)
                </span>
              </div>
            </div>

            <hr className="border-border" />

            <div className="space-y-3">
              <Button
                className="w-full h-11 text-base font-semibold"
                disabled={applied}
                onClick={() => setApplied(true)}
              >
                {applied ? "Application Submitted ✓" : "Apply for Opportunity"}
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => setSaved(!saved)}
                >
                  <Heart className={`w-4 h-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
