"use client";

import * as React from "react";
import { Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FAQ } from "@/components/landing/faq";

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("volunteer");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const emailSubject = subject || `KROW Inquiry from ${fullName}`;
    const emailBody = `Name: ${fullName}\nEmail: ${email}\nRole: ${role}\n\nMessage:\n${message}`;

    const mailtoUrl = `mailto:getkrow@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="px-3.5 py-1 text-xs border-primary/30 bg-primary/10 text-primary">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Get in Touch
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          We&apos;re here to <span className="text-gradient">help you make an impact</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Have questions about KROW, need assistance with organization verification, or want to partner with us? Send us a message!
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left Column: Contact Cards & Info */}
        <div className="space-y-6">
          <div className="border border-border bg-card rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-xl font-bold">Contact Information</h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Support & Inquiries</p>
                  <p className="text-muted-foreground text-xs">getkrow@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Response Time</p>
                  <p className="text-muted-foreground text-xs">Mon - Fri within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Headquarters</p>
                  <p className="text-muted-foreground text-xs">Coquitlam, BC, Canada</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-border bg-card/60 rounded-2xl p-6 space-y-3">
            <h3 className="font-bold text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> Organization Partnerships
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Represent a school district, university, or large non-profit network? Select &quot;Organization / Partner&quot; in the form to speak directly with our team.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-2 border border-border bg-card rounded-2xl p-6 sm:p-10 shadow-sm">
          {submitted ? (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold">Message Sent Successfully!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Thank you for reaching out to KROW. A member of our support team will get back to you shortly.
              </p>
              <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-4">
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-2xl font-bold">Send Us a Message</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required className="h-11" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">I am a...</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="volunteer">Volunteer / Student</SelectItem>
                      <SelectItem value="organization">Non-Profit / Organization</SelectItem>
                      <SelectItem value="school">School / Educator</SelectItem>
                      <SelectItem value="other">Other Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Org Verification Request" required className="h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Message *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you today?"
                  rows={5}
                  required
                  className="resize-none"
                />
              </div>

              <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto min-w-[180px] gap-2 font-semibold">
                {loading ? "Sending..." : "Send Message"}
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
}
