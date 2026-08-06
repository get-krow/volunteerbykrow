"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md space-y-6"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <Search className="h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Go to Home
            </Button>
          </Link>
          <Link href="/opportunities">
            <Button variant="outline">Browse Opportunities</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
