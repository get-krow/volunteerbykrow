"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Building2, MapPin, ShieldCheck, ExternalLink, Sparkles, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const sampleOrganizations = [
  {
    id: "org-1",
    name: "Green Earth Foundation",
    initials: "GE",
    type: "nonprofit",
    location: "Santa Monica, CA",
    verified: true,
    website: "https://greenearth.org",
    description: "Dedicated to protecting marine wildlife, coastal cleanup, and restoring natural dune environments through active community participation.",
    opportunities_count: 5,
    logo: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80",
    category: "Environment",
  },
  {
    id: "org-2",
    name: "Bright Futures Academy",
    initials: "BF",
    type: "school",
    location: "Los Angeles, CA",
    verified: true,
    website: "https://brightfutures.edu",
    description: "Empowering underserved K-12 students through after-school STEM tutoring, coding bootcamps, and one-on-one literacy mentorship.",
    opportunities_count: 8,
    logo: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=200&q=80",
    category: "Education",
  },
  {
    id: "org-3",
    name: "Community Aid Network",
    initials: "CA",
    type: "charity",
    location: "Pasadena, CA",
    verified: true,
    website: "https://communityaid.org",
    description: "Operating local food banks, emergency relief distribution, and hot meal kitchens to eliminate food insecurity across Southern California.",
    opportunities_count: 12,
    logo: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=200&q=80",
    category: "Hunger & Relief",
  },
  {
    id: "org-4",
    name: "Paws & Claws Pet Rescue",
    initials: "PC",
    type: "nonprofit",
    location: "Glendale, CA",
    verified: true,
    website: "https://pawsandclaws.org",
    description: "Rescuing abandoned animals, providing medical rehabilitation, and organizing foster and adoption events for pets in need.",
    opportunities_count: 4,
    logo: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=200&q=80",
    category: "Animals",
  },
];

export default function OrganizationsDirectoryPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredOrgs = sampleOrganizations.filter((org) => {
    const query = searchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(query) ||
      org.location.toLowerCase().includes(query) ||
      org.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="px-3.5 py-1 text-xs border-primary/30 bg-primary/10 text-primary">
          <Building2 className="w-3.5 h-3.5 mr-1.5" /> Verified Non-Profits & Partners
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Discover <span className="text-gradient">trusted organizations</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Connect directly with verified non-profits, schools, charities, and grassroots organizations making a real impact.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by organization name, category, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 text-base rounded-xl border-border shadow-sm"
          />
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {filteredOrgs.map((org) => (
          <motion.div
            key={org.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full flex flex-col justify-between border-border hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarImage src={org.logo} alt={org.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{org.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl font-bold flex items-center gap-1.5">
                        {org.name}
                        {org.verified && (
                          <ShieldCheck className="w-4 h-4 text-green-500 inline-block shrink-0" />
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{org.location}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs uppercase tracking-wider font-semibold">
                    {org.type}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {org.description}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-muted/50">
                    {org.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    {org.opportunities_count} active opportunities
                  </span>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 border-t border-border mt-auto pt-4 flex items-center justify-between">
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
                <Link href="/opportunities">
                  <Button size="sm" variant="outline" className="gap-1 font-semibold">
                    View Opportunities
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
