"use client";

import { motion } from "framer-motion";
import {
  Search,
  CalendarCheck,
  Award,
  Shield,
  BarChart3,
  MessageSquare,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Discover Opportunities",
    description:
      "Find volunteer positions that match your skills, interests, and schedule with powerful search and filters.",
  },
  {
    icon: CalendarCheck,
    title: "Track Your Hours",
    description:
      "Log volunteer hours, get them verified by organizations, and maintain a complete record of your service.",
  },
  {
    icon: Award,
    title: "Earn Certificates",
    description:
      "Receive official certificates for your volunteer work, perfect for college applications and resumes.",
  },
  {
    icon: Shield,
    title: "Verified Organizations",
    description:
      "Every organization on our platform is verified, so you can volunteer with confidence and trust.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Organizations get powerful analytics to track volunteer impact, manage events, and generate reports.",
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging",
    description:
      "Communicate directly with organizations and coordinators through our built-in messaging system.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Features() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold text-primary">Features</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to volunteer
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            A complete platform for volunteers and organizations to connect,
            coordinate, and create lasting impact.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
