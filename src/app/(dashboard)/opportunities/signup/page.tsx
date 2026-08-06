"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Heart, CheckCircle2, ArrowRight, User, Mail, Lock, Phone, MapPin, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { categories } from "@/config/site";
import { register } from "@/actions/auth";
import { Logo } from "@/components/shared/logo";
import { toast } from "sonner";

export default function OpportunitySignupPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);

  // Selected Preferences
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(["Environment", "Education"]);
  const [isRemote, setIsRemote] = React.useState(false);

  // Form State
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const toggleCategory = (name: string) => {
    if (selectedCategories.includes(name)) {
      setSelectedCategories(selectedCategories.filter(c => c !== name));
    } else {
      setSelectedCategories([...selectedCategories, name]);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("role", "volunteer");

    const result = await register(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      toast.success("Account Created!", {
        description: "Welcome to KROW! You can now apply for opportunities immediately.",
      });
      router.push("/opportunities");
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      {/* Back to Dashboard Button */}
      <div>
        <Link href="/volunteer">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="flex justify-center mb-2">
          <Logo size={52} />
        </div>
        <Badge variant="outline" className="px-3.5 py-1 text-xs border-primary/30 bg-primary/10 text-primary">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Volunteer Registration
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Sign up to <span className="text-gradient">apply for opportunities</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Create your free volunteer account in 60 seconds, track your verified hours, and start making an impact.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
        <div className={`flex-1 h-2 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
      </div>

      {/* Main Card */}
      <Card className="border-border bg-card p-6 sm:p-10 shadow-lg">
        {step === 1 ? (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl font-bold">Step 1: What causes do you care about?</h2>
              <p className="text-xs text-muted-foreground">Select one or more topics to personalize your opportunity feed.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat.name);
                return (
                  <div
                    key={cat.slug}
                    onClick={() => toggleCategory(cat.name)}
                    className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                        : "border-border bg-muted/30 hover:border-primary/40 text-muted-foreground"
                    }`}
                  >
                    <p className="text-xs sm:text-sm">{cat.name}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <Button size="lg" className="gap-2 font-semibold" onClick={() => setStep(2)}>
                Next: Create Account <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Step 2: Create your Volunteer Account</h2>
              <p className="text-xs text-muted-foreground">Enter your details to finalize registration and start applying.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input id="full_name" name="full_name" placeholder="John Doe" required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" name="email" type="email" placeholder="john@example.com" required className="h-11" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password *</Label>
                  <Input id="password" name="password" type="password" placeholder="••••••••" required className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm_password">Confirm Password *</Label>
                  <Input id="confirm_password" name="confirm_password" type="password" placeholder="••••••••" required className="h-11" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" size="lg" disabled={loading} className="gap-2 font-semibold">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Complete Registration & Apply
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
