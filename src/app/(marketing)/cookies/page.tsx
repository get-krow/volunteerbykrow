import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Volunteer by KROW",
  description: "Cookie policy and session storage explanation for Volunteer by KROW.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Cookie Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: August 6, 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>
          This Cookie Policy explains how <strong>Volunteer by KROW</strong> uses cookies and similar technologies to recognize you when you visit our website.
        </p>

        <h2 className="text-lg font-bold text-foreground pt-4">1. What Are Cookies?</h2>
        <p>
          Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work securely and efficiently.
        </p>

        <h2 className="text-lg font-bold text-foreground pt-4">2. Essential Cookies We Use</h2>
        <p>
          We use essential HTTP cookies and local storage tokens strictly for authenticating user sessions via Supabase SSR, maintaining dark/light theme preferences, and safeguarding CSRF tokens.
        </p>

        <h2 className="text-lg font-bold text-foreground pt-4">3. Managing Cookies</h2>
        <p>
          You have the right to accept or decline cookies through your browser settings. However, disabling essential authentication cookies will prevent you from signing in to your account.
        </p>
      </div>
    </div>
  );
}
