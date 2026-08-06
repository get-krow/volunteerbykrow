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

const sampleOpportunities = [
  {
    id: "1",
    title: "Coastal Beach Cleanup & Ecosystem Restoration",
    organization: "Green Earth Foundation",
    location: "Santa Monica, CA",
    is_remote: false,
    date: "Aug 15, 2026",
    hours: 4,
    category: "Environment",
    spots_left: 8,
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80",
    tags: ["Outdoors", "Conservation", "Ocean"],
  },
  {
    id: "2",
    title: "After-School STEM & Coding Tutor for Youth",
    organization: "Bright Futures Academy",
    location: "Remote / Online",
    is_remote: true,
    date: "Aug 18, 2026",
    hours: 2,
    category: "Education",
    spots_left: 4,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    tags: ["Mentorship", "STEM", "Youth"],
  },
  {
    id: "3",
    title: "Community Food Pantry Packing & Distribution",
    organization: "Community Aid Network",
    location: "Los Angeles, CA",
    is_remote: false,
    date: "Aug 20, 2026",
    hours: 3,
    category: "Hunger",
    spots_left: 12,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80",
    tags: ["Food Relief", "Community", "Volunteering"],
  },
  {
    id: "4",
    title: "Animal Shelter Care & Socialization Assistant",
    organization: "Paws & Claws Rescue",
    location: "Pasadena, CA",
    is_remote: false,
    date: "Aug 22, 2026",
    hours: 5,
    category: "Animals",
    spots_left: 3,
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80",
    tags: ["Animal Care", "Shelter", "Weekend"],
  },
];

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [remoteOnly, setRemoteOnly] = React.useState(false);

  const filteredOpportunities = sampleOpportunities.filter((opp) => {
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
      {/* Back to Dashboard Button */}
      <div>
        <Link href="/volunteer">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="px-3 py-1 text-xs border-primary/20 bg-primary/10 text-primary">
          <Sparkles className="w-3 h-3 mr-1" /> Discover Opportunities
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Find your next <span className="text-gradient">impactful role</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Browse verified volunteer events, filter by cause or location, and start giving back today.
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

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredOpportunities.map((opp) => (
          <motion.div
            key={opp.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 group border-border">
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                <img
                  src={opp.image}
                  alt={opp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-3 right-3 bg-background/90 text-foreground backdrop-blur-md">
                  {opp.category}
                </Badge>
                {opp.is_remote && (
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                    Remote
                  </Badge>
                )}
              </div>
              <CardHeader className="p-5 pb-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{opp.organization}</span>
                </div>
                <CardTitle className="text-lg font-bold leading-snug line-clamp-2">
                  {opp.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-2 flex-1 space-y-3">
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
                  {opp.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0 flex items-center justify-between border-t border-border mt-auto pt-4">
                <span className="text-xs text-muted-foreground font-medium">
                  {opp.spots_left} spots left
                </span>
                <Link href={`/opportunities/${opp.id}`}>
                  <Button size="sm" className="gap-1.5 font-semibold">
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pagination / Next Page Controls */}
      <div className="pt-8 border-t border-border flex items-center justify-between">
        <Button variant="outline" size="sm" disabled className="gap-1 font-semibold">
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        <div className="text-xs text-muted-foreground font-medium">
          Showing 1 - {filteredOpportunities.length} of {filteredOpportunities.length} opportunities
        </div>
        <Link href="/opportunities">
          <Button variant="default" size="sm" className="gap-1.5 font-semibold">
            Next Page <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
