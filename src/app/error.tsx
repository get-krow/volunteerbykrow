"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled runtime error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md space-y-6"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          An unexpected error occurred. Our team has been notified.
        </p>
        <div className="flex justify-center pt-2">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
