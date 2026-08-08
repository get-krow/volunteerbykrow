"use client";

import * as React from "react";
import { motion } from "framer-motion";

const defaultOrgs = [
  "Vancouver Food Bank",
  "BC Children's Hospital Support",
  "Coquitlam Habitat Humanity",
  "Burnaby Green Society",
];

export function FeaturedOrgs() {
  const [partnerNames, setPartnerNames] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("krow_custom_partners");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setPartnerNames(parsed);
          }
        } catch (e) {}
      }
    }
  }, []);

  if (partnerNames.length === 0) return null;

  const items = partnerNames.map(name => ({
    name,
    initials: name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
  }));

  return (
    <section className="py-16 border-y border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-8"
        >
          Trusted by Community Organizations & Nonprofits
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
        >
          {items.map((org) => (
            <div
              key={org.name}
              className="flex items-center gap-2.5 text-muted-foreground/80 hover:text-foreground transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                {org.initials}
              </div>
              <span className="text-sm font-semibold whitespace-nowrap">
                {org.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
