"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent px-6 py-16 sm:px-12 sm:py-20 text-center"
        >
          {/* Background decorations */}
          <div className="absolute inset-0 -z-0">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to make a difference?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
              Join thousands of volunteers and organizations already using KROW
              to create positive change in their communities.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/opportunities/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary shadow-md hover:bg-white/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                Sign Up for Opportunities
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/register?role=organization"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Register Organization
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
