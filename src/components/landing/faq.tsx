"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is Volunteer by KROW free to use?",
    answer:
      "Yes! KROW is completely free for volunteers. Organizations can use the platform at no cost for basic features, with premium plans available for larger organizations that need advanced analytics and management tools.",
  },
  {
    question: "How do I track my volunteer hours?",
    answer:
      "After volunteering at an event, you can log your hours directly through the platform. The organization you volunteered with will then verify and approve your hours. Once approved, the hours are added to your profile and can be exported as a certificate or report.",
  },
  {
    question: "How are organizations verified?",
    answer:
      "Organizations go through a verification process when they register. We review their documentation, mission, and legitimacy before granting verified status. This ensures volunteers can trust every organization on the platform.",
  },
  {
    question: "Can I use KROW for college applications?",
    answer:
      "Absolutely! KROW generates official certificates with verified hours that are accepted by colleges and universities. You can also export detailed reports of your volunteer history, including descriptions of your work and the organizations you helped.",
  },
  {
    question: "How does the messaging system work?",
    answer:
      "Once you apply to an opportunity or are accepted as a volunteer, you can message the organization directly through the platform. Messages are delivered in real-time with read receipts and typing indicators.",
  },
  {
    question: "Can I volunteer remotely?",
    answer:
      "Yes! Many organizations offer remote volunteer opportunities. You can filter search results to show only remote positions, making it easy to volunteer from anywhere.",
  },
  {
    question: "How do I register my organization?",
    answer:
      "Click 'Register Organization' and fill out the registration form with your organization's details. You'll need to provide documentation for verification. Once approved, you can start posting volunteer opportunities immediately.",
  },
  {
    question: "What types of organizations can use KROW?",
    answer:
      "KROW supports nonprofits, schools, clubs, charities, community groups, government agencies, and any organization that coordinates volunteer activities. Whether you're a small local group or a large nonprofit, KROW scales to your needs.",
  },
];

export function FAQ() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold text-primary">FAQ</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Can&apos;t find what you&apos;re looking for? Reach out to our
            support team.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-12 max-w-3xl"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-lg border border-border bg-card px-6 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
