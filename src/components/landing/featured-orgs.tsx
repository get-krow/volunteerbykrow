"use client";

import { motion } from "framer-motion";

const orgs = [
  { name: "Green Earth Foundation", initials: "GE" },
  { name: "Bright Futures Academy", initials: "BF" },
  { name: "Community Aid Network", initials: "CA" },
  { name: "Helping Hands Society", initials: "HH" },
  { name: "Youth Empowerment League", initials: "YE" },
  { name: "Coastal Conservation", initials: "CC" },
];

export function FeaturedOrgs() {
  return (
    <section className="py-16 border-y border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mb-8"
        >
          Trusted by leading organizations
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
        >
          {orgs.map((org) => (
            <div
              key={org.name}
              className="flex items-center gap-2.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-bold">
                {org.initials}
              </div>
              <span className="text-sm font-medium whitespace-nowrap">
                {org.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
