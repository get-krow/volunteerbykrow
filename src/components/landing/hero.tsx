"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Clock } from "lucide-react";

const floatingCards = [
  {
    title: "Beach Cleanup",
    org: "Green Earth",
    hours: "4 hrs",
    className: "top-[18%] left-[5%] rotate-[-6deg]",
    delay: 0.8,
  },
  {
    title: "Food Drive",
    org: "Community Aid",
    hours: "3 hrs",
    className: "top-[12%] right-[6%] rotate-[4deg]",
    delay: 1.0,
  },
  {
    title: "Tutoring",
    org: "Bright Futures",
    hours: "2 hrs",
    className: "bottom-[22%] right-[8%] rotate-[-3deg]",
    delay: 1.2,
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      {/* Floating Cards (Desktop only) */}
      {floatingCards.map((card) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: card.delay, duration: 0.6, ease: "easeOut" }}
          className={`absolute hidden xl:block ${card.className} z-10`}
        >
          <div className="glass rounded-xl border border-border p-4 shadow-lg w-48">
            <p className="text-sm font-semibold">{card.title}</p>
            <p className="text-xs text-muted-foreground">{card.org}</p>
            <div className="mt-2 flex items-center gap-1 text-xs text-primary font-medium">
              <Clock className="h-3 w-3" />
              {card.hours}
            </div>
          </div>
        </motion.div>
      ))}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              The modern volunteer platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Make a difference in
            <br />
            <span className="text-gradient">your community</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            Connect with organizations, discover meaningful volunteer
            opportunities, track your hours, and earn certificates — all in one
            beautiful platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register?role=volunteer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Sign Up for Opportunities
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold hover:bg-accent transition-colors"
            >
              Browse All Opportunities
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
