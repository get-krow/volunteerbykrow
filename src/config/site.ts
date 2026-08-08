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
  { label: "Discover", href: "/opportunities", icon: "Sparkles" },
  { label: "My Hours", href: "/volunteer/hours", icon: "Clock" },
  { label: "Calendar", href: "/volunteer/calendar", icon: "Calendar" },
  { label: "Profile", href: "/volunteer/settings", icon: "User" },
] as const;

export const dashboardNavOrganization = [
  { label: "Overview", href: "/organization", icon: "LayoutDashboard" },
  { label: "Our Opportunities", href: "/organization/opportunities", icon: "Briefcase" },
  { label: "Add Opportunity", href: "/organization/opportunities/new", icon: "Plus" },
  { label: "Volunteer Applications", href: "/organization/applications", icon: "FileText" },
  { label: "Volunteer Roster", href: "/organization/volunteers", icon: "Users" },
  { label: "Calendar", href: "/organization/calendar", icon: "Calendar" },
  { label: "Profile", href: "/organization/profile", icon: "Building2" },
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
