"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const defaultTestimonials = [
  {
    name: "Samantha Chen",
    role: "High School Volunteer",
    avatar: "SC",
    content: "Volunteer by Krow made it so easy to find real local opportunities and automatically track my high school graduation service hours!",
    rating: 5,
  },
  {
    name: "Marcus Vance",
    role: "Community Event Coordinator",
    avatar: "MV",
    content: "As an event organizer, verifying attendance and awarding volunteer hours takes just one click. It eliminated all manual paperwork for us.",
    rating: 5,
  },
  {
    name: "Emily Foster",
    role: "Local Volunteer",
    avatar: "EF",
    content: "The search and filter system is incredible. I found community events near me that fit my schedule perfectly.",
    rating: 5,
  },
];

export function Testimonials() {
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("krow_custom_reviews");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setItems(parsed.map(r => ({
              name: r.author,
              role: r.role || "Volunteer",
              avatar: r.author ? r.author.slice(0, 2).toUpperCase() : "VK",
              content: r.text,
              rating: r.stars || 5,
            })));
          }
        } catch (e) {}
      }
    }
  }, []);

  if (items.length === 0) return null;

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
            Authentic Feedback from Our Community
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            See what real volunteers and verified event organizers have to say.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((testimonial, index) => (
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
