import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Volunteer by KROW",
  description: "Volunteer by KROW privacy policy and data protection disclosures.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: August 6, 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>
          At <strong>Volunteer by KROW</strong>, accessible from volunteerybykrow.vercel.app, one of our main priorities is the privacy of our visitors and users. This Privacy Policy document contains types of information that is collected and recorded by KROW and how we use it.
        </p>

        <h2 className="text-lg font-bold text-foreground pt-4">1. Information We Collect</h2>
        <p>
          When you register for an Account as a Volunteer, Organization, or School Representative, we may collect personal information including your full name, email address, phone number, location, and uploaded service verification documents.
        </p>

        <h2 className="text-lg font-bold text-foreground pt-4">2. How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Facilitate volunteer opportunity matching and application submissions.</li>
          <li>Verify and audit volunteer hours logged by organizations.</li>
          <li>Generate official service hour verification certificates.</li>
          <li>Provide customer support and maintain platform row-level security.</li>
        </ul>

        <h2 className="text-lg font-bold text-foreground pt-4">3. Data Security & Storage</h2>
        <p>
          We employ industry-standard encryption protocols and Row Level Security (RLS) policies within Supabase PostgreSQL to ensure your data is accessible only by authorized users and organizations.
        </p>

        <h2 className="text-lg font-bold text-foreground pt-4">4. Contact Us</h2>
        <p>
          If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <strong>getkrow@gmail.com</strong>.
        </p>
      </div>
    </div>
  );
}
