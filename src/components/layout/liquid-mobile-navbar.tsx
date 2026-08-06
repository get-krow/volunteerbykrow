"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, LayoutDashboard, Calendar, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: string;
}

interface LiquidMobileNavbarProps {
  nav: readonly NavItem[];
  SidebarContentComponent: React.ComponentType<{
    nav: readonly NavItem[];
    collapsed: boolean;
    pathname: string;
  }>;
}

export function LiquidMobileNavbar({
  nav,
  SidebarContentComponent,
}: LiquidMobileNavbarProps) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  // Determine current active section for Overview, Calendar & Profile
  const isOrg = pathname.startsWith("/organization");
  const isAdmin = pathname.startsWith("/admin");

  const overviewHref = isOrg ? "/organization" : isAdmin ? "/admin" : "/volunteer";
  const calendarHref = isOrg ? "/organization/hours" : "/volunteer/calendar";
  const profileHref = isOrg ? "/organization/profile" : "/volunteer/settings";

  const tabs = [
    { id: "discover", label: "Discover", href: "/opportunities", icon: Sparkles },
    { id: "overview", label: "Overview", href: overviewHref, icon: LayoutDashboard },
    { id: "calendar", label: "Calendar", href: calendarHref, icon: Calendar },
    { id: "profile", label: "Profile", href: profileHref, icon: User },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden flex justify-center pointer-events-none">
      <nav className="pointer-events-auto glass border border-white/20 dark:border-white/10 shadow-2xl rounded-full p-1.5 flex items-center justify-between gap-1 w-full max-w-md backdrop-blur-xl bg-background/85 relative overflow-hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname === tab.href ||
            (tab.href !== "/volunteer" &&
              tab.href !== "/organization" &&
              tab.href !== "/admin" &&
              pathname.startsWith(tab.href));

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-2 px-2.5 rounded-full flex-1 transition-colors z-10 text-xs font-medium",
                isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="liquid-pill"
                  className="absolute inset-0 rounded-full bg-primary/15 dark:bg-primary/25 border border-primary/30 shadow-[0_0_12px_rgba(124,58,237,0.2)] -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn("w-4 h-4 mb-0.5 transition-transform", isActive && "scale-110 text-primary")} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </Link>
          );
        })}

        {/* More Button (Opens Mobile Sidebar Drawer) */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center py-2 px-2.5 rounded-full flex-1 transition-colors text-muted-foreground hover:text-foreground text-xs font-medium relative z-10">
              <Menu className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] tracking-tight">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContentComponent nav={nav} collapsed={false} pathname={pathname} />
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}
