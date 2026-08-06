import { Hero } from "@/components/landing/hero";
import { FeaturedOrgs } from "@/components/landing/featured-orgs";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { CTA } from "@/components/landing/cta";
import { FAQ } from "@/components/landing/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedOrgs />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <FAQ />
    </>
  );
}
