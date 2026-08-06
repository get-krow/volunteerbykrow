import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck, Heart, Users, Award, Sparkles, CheckCircle2, ArrowRight, Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "About Us | Volunteer by KROW",
  description: "Learn about KROW's mission to connect volunteers, schools, and organizations through verified community impact.",
};

const coreValues = [
  {
    icon: ShieldCheck,
    title: "Verified Authenticity",
    description: "Every organization and hour logged is verified through robust double-check workflows, giving schools and charities trust in every certificate.",
  },
  {
    icon: Heart,
    title: "Community First",
    description: "We build tools that prioritize the real-world human impact of local initiatives, non-profits, and grassroots community projects.",
  },
  {
    icon: Users,
    title: "Inclusive Access",
    description: "Whether you are a student fulfilling service requirements or a non-profit managing hundreds of volunteers, KROW is built for everyone.",
  },
  {
    icon: Award,
    title: "Recognized Service",
    description: "Export official, downloadable volunteer hour certificates accepted by educational institutions and employers worldwide.",
  },
];

const pillars = [
  {
    title: "For Volunteers & Students",
    description: "Discover local and remote service opportunities matched to your passion, track your hours effortlessly, and build a verified portfolio of community work.",
    badge: "Volunteers",
  },
  {
    title: "For Non-Profits & Organizations",
    description: "Post opportunities, review applications, coordinate volunteer rosters, and verify hours logged with a single click.",
    badge: "Organizations",
  },
  {
    title: "For Schools & Admins",
    description: "Monitor student service compliance, audit organization legitimacy, and generate official institutional reports.",
    badge: "Institutions",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-20">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <Badge variant="outline" className="px-3.5 py-1 text-xs border-primary/30 bg-primary/10 text-primary">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Our Mission & Vision
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Empowering communities through <span className="text-gradient">verified action</span>
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed">
          Volunteer by KROW was built to eliminate barriers between passionate individuals and organizations doing critical work in our communities.
        </p>
      </div>

      {/* Story Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-12 shadow-md">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">The KROW Difference</h2>
            <p className="text-muted-foreground leading-relaxed">
              Traditional volunteer coordination relies on paper forms, scattered emails, and unverified hour logging. We built KROW to unify the entire service ecosystem into a modern, real-time platform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              From local beach cleanups to online youth STEM tutoring, KROW empowers non-profits to recruit dedicated volunteers while providing volunteers with digital proof of their impact.
            </p>
            <div className="pt-2 flex items-center gap-3 text-sm font-medium text-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Real-time hour verification & certificate generation</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Row-level security database protection</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-muted/60 border border-border space-y-2">
              <Building2 className="w-8 h-8 text-primary" />
              <h3 className="font-bold text-lg">Verified Orgs</h3>
              <p className="text-xs text-muted-foreground">Vetted charities, schools, and grassroots initiatives.</p>
            </div>
            <div className="p-6 rounded-2xl bg-muted/60 border border-border space-y-2">
              <Globe className="w-8 h-8 text-primary" />
              <h3 className="font-bold text-lg">Global & Local</h3>
              <p className="text-xs text-muted-foreground">In-person local events alongside remote online roles.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">Built on Core Values</h2>
          <p className="text-muted-foreground text-sm">Guided by trust, accountability, and seamless technology.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((val) => (
            <Card key={val.title} className="border-border bg-card hover:border-primary/40 transition-colors">
              <CardContent className="p-6 space-y-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
                  <val.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg">{val.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{val.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Ecosystem Pillars */}
      <div className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">Who KROW Serves</h2>
          <p className="text-muted-foreground text-sm">Tailored workflows designed for every stakeholder in community service.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="p-8 rounded-2xl border border-border bg-card space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <Badge variant="secondary" className="text-xs font-semibold">{pillar.badge}</Badge>
                <h3 className="text-xl font-bold">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-accent/15 border border-primary/20 p-8 md:p-14 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to start making an impact?</h2>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          Join thousands of volunteers and organizations creating real change through KROW today.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/register">
            <Button size="lg" className="gap-2 font-semibold shadow-md">
              Join KROW Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline" className="font-semibold">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
