"use client";

import * as React from "react";
import { Loader2, User, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, PROVINCES_CANADA, STATES_US, CITIES_BY_REGION } from "@/lib/location-data";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface OnboardingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: { birthdate: string; age: number; country: string; provinceState: string; city: string; location: string }) => void;
}

export function OnboardingModal({ open, onOpenChange, onComplete }: OnboardingModalProps) {
  const [birthdate, setBirthdate] = React.useState("");
  const [country, setCountry] = React.useState("CA");
  const [provinceState, setProvinceState] = React.useState("BC");
  const [city, setCity] = React.useState("Coquitlam");
  const [saving, setSaving] = React.useState(false);

  // Calculate Age automatically
  const calculatedAge = React.useMemo(() => {
    if (!birthdate) return null;
    const diff = Date.now() - new Date(birthdate).getTime();
    const ageYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return ageYears > 0 ? ageYears : 0;
  }, [birthdate]);

  const regionOptions = country === "CA" ? PROVINCES_CANADA : STATES_US;
  const cityOptions = CITIES_BY_REGION[provinceState] || CITIES_BY_REGION["BC"] || ["Vancouver", "Coquitlam"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!birthdate) {
      toast.error("Please enter your date of birth.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const countryName = country === "CA" ? "Canada" : "United States";
    const locationStr = [city, provinceState, countryName].filter(Boolean).join(", ");
    const ageVal = calculatedAge || 18;

    if (user) {
      // 1. Update profiles table
      await supabase.from("profiles").upsert({
        id: user.id,
        birthdate,
        country: countryName,
        province_state: provinceState,
        city,
        age: ageVal,
        location: locationStr,
        updated_at: new Date().toISOString(),
      });

      // 2. Update user metadata
      await supabase.auth.updateUser({
        data: {
          birthdate,
          country: countryName,
          province_state: provinceState,
          city,
          age: ageVal,
          location: locationStr,
        },
      });
    }

    setSaving(false);
    toast.success("Profile Setup Complete! 🎉", {
      description: `Your age (${ageVal}) and location (${locationStr}) have been saved to your profile.`,
    });

    onComplete({
      birthdate,
      age: ageVal,
      country: countryName,
      provinceState,
      city,
      location: locationStr,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold">Welcome to Volunteer by KROW 👋</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Please enter your date of birth and location so we can match you with local volunteer opportunities and verify age requirements.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Birthdate & Live Calculated Age */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="dob">Date of Birth *</Label>
              {calculatedAge !== null && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  Age: {calculatedAge} years old
                </span>
              )}
            </div>
            <Input
              id="dob"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              required
              className="h-11"
            />
          </div>

          {/* Country Dropdown */}
          <div className="space-y-2">
            <Label>Country *</Label>
            <Select value={country} onValueChange={(val) => {
              setCountry(val);
              const defaultRegion = val === "CA" ? "BC" : "CA";
              setProvinceState(defaultRegion);
              setCity(CITIES_BY_REGION[defaultRegion]?.[0] || "");
            }}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Province / State Dropdown */}
          <div className="space-y-2">
            <Label>{country === "CA" ? "Province *" : "State *"}</Label>
            <Select value={provinceState} onValueChange={(val) => {
              setProvinceState(val);
              setCity(CITIES_BY_REGION[val]?.[0] || "");
            }}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder={`Select ${country === "CA" ? "province" : "state"}`} />
              </SelectTrigger>
              <SelectContent>
                {regionOptions.map(r => (
                  <SelectItem key={r.code} value={r.code}>{r.name} ({r.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Dropdown */}
          <div className="space-y-2">
            <Label>City *</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full h-11 font-semibold gap-2 mt-2" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Save Profile & Complete Setup
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
