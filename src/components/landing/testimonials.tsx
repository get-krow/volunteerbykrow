"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "High School Senior",
    avatar: "SC",
    content:
      "KROW made tracking my volunteer hours so easy. I used it for my college applications and earned over 200 hours of verified community service!",
    rating: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Nonprofit Director",
    avatar: "MR",
    content:
      "Managing volunteers used to be chaos. With KROW, we can post opportunities, track attendance, and communicate with volunteers all in one place.",
    rating: 5,
  },
  {
    name: "Emily Foster",
    role: "Community Organizer",
    avatar: "EF",
    content:
      "The search and filter system is incredible. I found local opportunities that perfectly matched my skills and schedule within minutes.",
    rating: 5,
  },
  {
    name: "David Park",
    role: "Club President",
    avatar: "DP",
    content:
      "Our school club uses KROW to organize all our community service events. The analytics dashboard helps us report our impact to the school board.",
    rating: 5,
  },
  {
    name: "Aisha Williams",
    role: "Volunteer Coordinator",
    avatar: "AW",
    content:
      "The certificate generation feature is a game-changer. Volunteers love getting official recognition for their contributions immediately.",
    rating: 5,
  },
  {
    name: "James Thompson",
    role: "College Freshman",
    avatar: "JT",
    content:
      "I started volunteering through KROW in high school and it changed my life. The platform connected me with amazing organizations in my area.",
    rating: 5,
  },
];

export function Testimonials() {
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
          <p className="text-sm font-semibold text-primary">Testimonials</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by volunteers everywhere
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            See what our community members have to say about their experience.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md"
            >
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-primary/20" />

              {/* Content */}
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Rating */}
              <div className="mt-4 flex gap-0.5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Author */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
