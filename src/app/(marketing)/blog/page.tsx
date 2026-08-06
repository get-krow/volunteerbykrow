import Link from "next/link";
import { Metadata } from "next";
import { Calendar, Clock, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Blog & Insights | Volunteer by KROW",
  description: "Articles, volunteer tips, organization spotlights, and community impact stories.",
};

const blogPosts = [
  {
    id: "post-1",
    title: "5 Tips for High School Students Building a Service Portfolio",
    category: "Guides",
    date: "Aug 4, 2026",
    readTime: "4 min read",
    snippet: "How to select meaningful community roles, track your service hours digitally, and highlight your social impact for college applications.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "post-2",
    title: "How Non-Profits Can Streamline Volunteer Onboarding with KROW",
    category: "Organization",
    date: "Jul 28, 2026",
    readTime: "6 min read",
    snippet: "Best practices for writing engaging opportunity descriptions, conducting quick background verifications, and automating hour approvals.",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "post-3",
    title: "The Rise of Virtual Volunteering: Making an Impact from Home",
    category: "Trends",
    date: "Jul 15, 2026",
    readTime: "5 min read",
    snippet: "Explore online roles ranging from remote coding mentorship to digital translation and virtual hotline support.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="px-3.5 py-1 text-xs border-primary/30 bg-primary/10 text-primary">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Latest Articles & News
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          KROW <span className="text-gradient">Blog & Insights</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Stories, guides, and tips for volunteers, educators, and community leaders.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden border-border bg-card hover:border-primary/40 transition-all flex flex-col justify-between shadow-sm">
            <div>
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                <Badge className="absolute top-3 right-3 bg-background/90 text-foreground backdrop-blur-md">
                  {post.category}
                </Badge>
              </div>
              <CardHeader className="p-6 pb-2">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{post.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
                </div>
                <CardTitle className="text-lg font-bold leading-snug line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {post.snippet}
                </p>
              </CardContent>
            </div>
            <div className="p-6 pt-0 border-t border-border mt-4 pt-4">
              <Link href="/help" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                Read Full Story <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
