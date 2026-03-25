import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header";

const clauses = [
  {
    number: 1,
    title: "FOCLIY BOX PURCHASE",
    items: [
      "The Focliy Box is priced at ₹799/- (Rupees Seven Hundred Ninety-Nine Only).",
      "This amount includes packaging and handling.",
      "Shipping/Delivery charges, if applicable, are non-refundable under any circumstances.",
      "Once purchased, the Focliy Box cannot be returned or exchanged.",
    ],
  },
  {
    number: 2,
    title: "ELIGIBILITY OF HAIR SUBMISSION",
    items: [
      "Only naturally fallen hair (from comb, floor, or natural shedding) is accepted.",
      "Hair obtained through cutting, shaving, or salon collection is strictly prohibited.",
      "Colored, bleached, chemically treated, or dyed hair will not be accepted.",
    ],
  },
  {
    number: 3,
    title: "HAIR QUALITY REQUIREMENTS",
    items: [
      "Hair must be clean, dry, and stored properly in the Focliy Box.",
      "Hair that is wet, dirty, oily, or contaminated will be rejected.",
    ],
  },
  {
    number: 4,
    title: "SERVICE ELIGIBILITY",
    items: [
      "Users must meet the minimum required quantity of hair to avail free services.",
      "Focliy reserves full rights to inspect and approve/reject submissions.",
    ],
  },
  {
    number: 5,
    title: "OWNERSHIP POLICY",
    items: [
      "Once submitted, hair becomes the sole property of Focliy.",
      "No claims, returns, or exchanges will be entertained.",
    ],
  },
  {
    number: 6,
    title: "FREE SERVICE TERMS",
    intro: "Free beauty services are:",
    items: [
      "Non-transferable",
      "Non-exchangeable for cash",
      "Appointment booking is mandatory.",
      "Services depend on availability of beauticians and slots.",
    ],
  },
  {
    number: 7,
    title: "CANCELLATION POLICY",
    items: [
      "Missed or delayed appointments may lead to cancellation without rescheduling.",
      "Focliy reserves the right to deny service in case of repeated no-shows.",
    ],
  },
  {
    number: 8,
    title: "FRAUD & MISUSE",
    intro: "Any misuse, fake submission, or violation will result in:",
    items: ["Immediate rejection", "Permanent ban from Focliy services"],
  },
  {
    number: 9,
    title: "SERVICE MODIFICATION RIGHTS",
    items: [
      "Focliy may change pricing, services, policies, or offers anytime without prior notice.",
    ],
  },
  {
    number: 10,
    title: "CUSTOMER RESPONSIBILITY",
    intro: "Customers must carry:",
    items: [
      "Focliy Box OR",
      "Valid submission proof",
      "Users must follow all hygiene & safety guidelines.",
    ],
  },
  {
    number: 11,
    title: "ADD-ON CHARGES",
    items: [
      "Free services cover only basic packages.",
      "Any premium upgrades or add-ons will be chargeable.",
    ],
  },
  {
    number: 12,
    title: "HEALTH DISCLAIMER",
    intro: "Focliy is not responsible for:",
    items: [
      "Allergic reactions",
      "Skin sensitivities",
      "Customers must inform staff of any medical conditions beforehand.",
    ],
  },
  {
    number: 13,
    title: "MARKETING CONSENT",
    intro: "By using Focliy services, you agree that:",
    items: [
      "Your before/after photos/videos may be used for marketing",
      "No compensation will be provided for such usage",
    ],
  },
  {
    number: 14,
    title: "FINAL DECISION",
    items: [
      "All decisions taken by Focliy management shall be final and binding.",
    ],
  },
  {
    number: 15,
    title: "GOVERNING LAW",
    items: [
      "These terms are governed by the laws of India.",
      "Any disputes will fall under the jurisdiction of local courts of operation.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container max-w-3xl py-10 px-4">
          {/* Back link */}
          <Link
            to="/"
            data-ocid="terms.link"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Terms &amp; Conditions
            </h1>
            <p className="text-muted-foreground text-sm">
              Welcome to Focliy. By accessing our website, purchasing the Focliy
              Box, or availing our services, you agree to the following legally
              binding terms.
            </p>
          </div>

          {/* Clauses */}
          <div className="space-y-6">
            {clauses.map((clause) => (
              <div
                key={clause.number}
                className="rounded-lg border border-border bg-card p-5"
                data-ocid="terms.panel"
              >
                <h2 className="font-semibold text-base text-foreground mb-2 flex items-center gap-2">
                  <span>🟣</span>
                  <span>
                    {clause.number}. {clause.title}
                  </span>
                </h2>
                {clause.intro && (
                  <p className="text-sm text-muted-foreground mb-1">
                    {clause.intro}
                  </p>
                )}
                <ul className="list-disc list-inside space-y-1">
                  {clause.items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Refund Policy */}
          <div
            className="mt-8 rounded-lg border border-border bg-card p-5"
            data-ocid="terms.panel"
          >
            <h2 className="font-semibold text-base text-foreground mb-2">
              📋 Refund Policy
            </h2>
            <p className="text-sm text-muted-foreground">
              Upon successful delivery of the Focliy Box, the total amount of
              ₹799/-, inclusive of shipping and handling charges, shall not be
              eligible for refund, return, or cancellation.
            </p>
          </div>

          {/* Membership Policy */}
          <div
            className="mt-4 rounded-lg border border-border bg-card p-5"
            data-ocid="terms.panel"
          >
            <h2 className="font-semibold text-base text-foreground mb-2">
              📋 Membership Policy
            </h2>
            <p className="text-sm text-muted-foreground">
              <strong>Membership Fee:</strong> The membership fee is collected
              solely for the provision of the hair storage box and associated
              handling services. Payment of the membership fee does not entitle
              the member to any beauty services or products. Upon successful
              enrollment, members shall receive beauty coupons of a value equal
              to the membership fee. These coupons may be redeemed for beauty
              services and products, subject to the submission of naturally
              fallen hair. The Company shall have no liability or obligation to
              refund the membership fee under any circumstances, including but
              not limited to non-utilization of services or products. All beauty
              services and products are provided strictly upon receipt of
              naturally fallen hair as per program guidelines. The Company
              reserves the right to withhold services or products if such
              conditions are not met. The member acknowledges and agrees that
              enrollment in the membership program constitutes acceptance of
              these terms, and the Company shall not be held liable for any
              expectation, claim, or loss arising from the use, non-use, or
              delay of beauty services or products.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
