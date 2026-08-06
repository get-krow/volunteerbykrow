import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Volunteer by KROW",
  description: "Terms of service and platform usage rules for Volunteer by KROW.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-border pb-6 space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Terms of Service</h1>
        <p className="text-xs text-muted-foreground">Last updated: August 6, 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>
          Welcome to <strong>Volunteer by KROW</strong>. By accessing or using our platform, website, and services, you agree to be bound by these Terms of Service.
        </p>

        <h2 className="text-lg font-bold text-foreground pt-4">1. User Accounts & Responsibilities</h2>
        <p>
          Volunteers agree to log accurate service hours and provide truthful information when applying to opportunities. Organizations agree to accurately represent volunteer roles and promptly review logged hours.
        </p>

        <h2 className="text-lg font-bold text-foreground pt-4">2. Code of Conduct</h2>
        <p>
          All users must interact respectfully. Discrimination, harassment, or fraudulent hour logging will result in immediate account suspension.
        </p>

        <h2 className="text-lg font-bold text-foreground pt-4">3. Verification & Certificates</h2>
        <p>
          Service hour certificates issued by KROW rely on confirmation by verified organizations. KROW reserves the right to audit and revoke fraudulent hour certificates.
        </p>

        <h2 className="text-lg font-bold text-foreground pt-4">4. Limitation of Liability</h2>
        <p>
          KROW connects volunteers with independent third-party organizations. KROW is not liable for accidents, injuries, or disputes occurring during third-party volunteer events.
        </p>
      </div>
    </div>
  );
}
