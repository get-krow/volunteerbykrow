export const siteConfig = {
  name: "Volunteer by KROW",
  description:
    "Connect with meaningful volunteer opportunities in your community. Track hours, earn certificates, and make a difference.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  links: {
    twitter: "https://twitter.com/krow",
    github: "https://github.com/krow",
  },
  creator: "KROW",
  keywords: [
    "volunteer",
    "community",
    "nonprofit",
    "volunteer hours",
    "community service",
    "KROW",
    "volunteer management",
    "charity",
    "events",
  ],
} as const;

export const navLinks = [
  { label: "Opportunities", href: "/opportunities" },
  { label: "Organizations", href: "/organizations" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const dashboardNavVolunteer = [
  { label: "Overview", href: "/volunteer", icon: "LayoutDashboard" },
  { label: "Discover Opportunities", href: "/opportunities", icon: "Sparkles" },
  { label: "My Hours", href: "/volunteer/hours", icon: "Clock" },
  { label: "Applications", href: "/volunteer/applications", icon: "FileText" },
  { label: "Saved", href: "/volunteer/saved", icon: "Heart" },
  { label: "Achievements", href: "/volunteer/achievements", icon: "Award" },
  { label: "Messages", href: "/volunteer/messages", icon: "MessageSquare" },
  { label: "Calendar", href: "/volunteer/calendar", icon: "Calendar" },
  { label: "Notifications", href: "/volunteer/notifications", icon: "Bell" },
  { label: "Settings", href: "/volunteer/settings", icon: "Settings" },
] as const;

export const dashboardNavOrganization = [
  { label: "Overview", href: "/organization", icon: "LayoutDashboard" },
  { label: "Discover Opportunities", href: "/opportunities", icon: "Sparkles" },
  { label: "Opportunities", href: "/organization/opportunities", icon: "Briefcase" },
  { label: "Applications", href: "/organization/applications", icon: "FileText" },
  { label: "Volunteers", href: "/organization/volunteers", icon: "Users" },
  { label: "Hours", href: "/organization/hours", icon: "Clock" },
  { label: "Messages", href: "/organization/messages", icon: "MessageSquare" },
  { label: "Analytics", href: "/organization/analytics", icon: "BarChart3" },
  { label: "Documents", href: "/organization/documents", icon: "FolderOpen" },
  { label: "Profile", href: "/organization/profile", icon: "Building2" },
  { label: "Settings", href: "/organization/settings", icon: "Settings" },
] as const;

export const dashboardNavAdmin = [
  { label: "Overview", href: "/admin", icon: "LayoutDashboard" },
  { label: "Discover Opportunities", href: "/opportunities", icon: "Sparkles" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "Organizations", href: "/admin/organizations", icon: "Building2" },
  { label: "Opportunities", href: "/admin/opportunities", icon: "Briefcase" },
  { label: "Reports", href: "/admin/reports", icon: "FileBarChart" },
  { label: "Analytics", href: "/admin/analytics", icon: "TrendingUp" },
  { label: "Support", href: "/admin/support", icon: "LifeBuoy" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
] as const;

export const categories = [
  { name: "Education", slug: "education", icon: "GraduationCap" },
  { name: "Environment", slug: "environment", icon: "Leaf" },
  { name: "Health", slug: "health", icon: "Heart" },
  { name: "Animals", slug: "animals", icon: "PawPrint" },
  { name: "Community", slug: "community", icon: "Users" },
  { name: "Arts & Culture", slug: "arts-culture", icon: "Palette" },
  { name: "Sports", slug: "sports", icon: "Trophy" },
  { name: "Technology", slug: "technology", icon: "Laptop" },
  { name: "Disaster Relief", slug: "disaster-relief", icon: "ShieldAlert" },
  { name: "Hunger", slug: "hunger", icon: "UtensilsCrossed" },
  { name: "Elderly Care", slug: "elderly-care", icon: "HeartHandshake" },
  { name: "Youth", slug: "youth", icon: "Baby" },
] as const;
