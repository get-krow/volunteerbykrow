import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 36 }: LogoProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-primary/20 shadow-sm shrink-0 transition-transform group-hover:scale-105",
        className
      )}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo.png"
        alt="KROW Logo"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
