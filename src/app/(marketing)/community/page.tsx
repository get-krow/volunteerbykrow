import { Metadata } from "next";
import { ShieldCheck, Heart, Users, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Community Guidelines | Volunteer by KROW",
  description: "Standards and expectations for volunteers, organizations, and partners on KROW.",
};

const guidelines = [
  {
    icon: Heart,
    title: "Respect & Inclusivity",
    description: "Treat fellow volunteers, event coordinators, and community members with dignity regardless of background, identity, or experience.",
  },
  {
    icon: ShieldCheck,
    title: "Accountability & Honesty",
    description: "Accurately record hours, fulfill shift commitments, and provide timely notice if you are unable to attend an event.",
  },
  {
    icon: Users,
    title: "Safe Environment",
    description: "Organizations must provide safe physical or digital environments, clear safety guidelines, and adequate supervision for all roles.",
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="px-3.5 py-1 text-xs border-primary/30 bg-primary/10 text-primary">
          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Our Standards
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          KROW <span className="text-gradient">Community Guidelines</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          These guidelines ensure that KROW remains a safe, respectful, and impactful platform for every volunteer and organization.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {guidelines.map((g) => (
          <Card key={g.title} className="border-border bg-card">
            <CardContent className="p-6 space-y-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit">
                <g.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">{g.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{g.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="border border-border bg-card rounded-2xl p-8 space-y-4">
        <h2 className="text-xl font-bold">Reporting Violations</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If you encounter any behavior, unsafe event conditions, or unverified hour logging that violates these guidelines, please contact our trust & safety team immediately at <strong>getkrow@gmail.com</strong>.
        </p>
      </div>
    </div>
  );
}
