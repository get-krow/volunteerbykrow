"use client";

import { motion } from "framer-motion";
import { Search, FileText, Heart } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: Search,
    title: "Find Opportunities",
    description:
      "Browse hundreds of volunteer opportunities near you or search by category, date, and availability.",
  },
  {
    step: 2,
    icon: FileText,
    title: "Apply & Connect",
    description:
      "Submit your application directly through the platform. Organizations review and approve volunteers quickly.",
  },
  {
    step: 3,
    icon: Heart,
    title: "Volunteer & Grow",
    description:
      "Show up, make an impact, log your hours, and earn certificates. Track your progress over time.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold text-primary">How It Works</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Start volunteering in minutes
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Getting started is simple. Three easy steps and you&apos;re making a
            difference.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Connector line (desktop) */}
              {index < steps.length - 1 && (
                <div className="absolute top-10 left-[60%] hidden md:block w-[80%] border-t-2 border-dashed border-border" />
              )}

              {/* Step number circle */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary relative">
                <step.icon className="h-8 w-8" />
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md">
                  {step.step}
                </span>
              </div>

              <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
