import Link from "next/link";
import { Metadata } from "next";
import { Search, HelpCircle, Mail, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FAQ } from "@/components/landing/faq";

export const metadata: Metadata = {
  title: "Help Center | Volunteer by KROW",
  description: "Find answers, guides, and support for Volunteer by KROW.",
};

const helpCategories = [
  {
    title: "For Volunteers",
    description: "Learn how to find events, apply, track your hours, and download verified certificates.",
    icon: FileText,
    href: "/#how-it-works",
  },
  {
    title: "For Organizations",
    description: "Guides on registering your non-profit, posting roles, and approving volunteer hours.",
    icon: CheckCircle2,
    href: "/contact",
  },
  {
    title: "Account & Security",
    description: "Manage your password, email settings, role preferences, and profile details.",
    icon: HelpCircle,
    href: "/contact",
  },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          How can we <span className="text-gradient">help you today?</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Search our knowledge base or explore guides for volunteers, organizations, and school admins.
        </p>

        {/* Search */}
        <div className="max-w-xl mx-auto pt-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search help articles, guides, or FAQs..."
              className="pl-11 h-12 text-base rounded-xl border-border shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {helpCategories.map((cat) => (
          <Card key={cat.title} className="border-border bg-card hover:border-primary/40 transition-colors shadow-sm">
            <CardHeader className="p-6 pb-2">
              <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-3">
                <cat.icon className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl font-bold">{cat.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{cat.description}</p>
              <Link href={cat.href}>
                <Button variant="ghost" size="sm" className="gap-1 p-0 text-primary hover:text-primary hover:bg-transparent font-semibold">
                  Read Guides <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <FAQ />

      {/* Still need help */}
      <div className="border border-border bg-card rounded-2xl p-8 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
        <h2 className="text-2xl font-bold">Still have questions?</h2>
        <p className="text-sm text-muted-foreground">
          Can&apos;t find what you are looking for? Contact our dedicated support team.
        </p>
        <Link href="/contact">
          <Button size="lg" className="gap-2 font-semibold">
            <Mail className="w-4 h-4" /> Contact Support
          </Button>
        </Link>
      </div>
    </div>
  );
}
