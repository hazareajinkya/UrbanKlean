import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { coreConf } from "@/lib/utils/conf";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | MagicalCX",
  description:
    "Learn about MagicalCX's refund and cancellation policy. Understand our transparent billing terms and cancellation process.",
  openGraph: {
    title: "Refund & Cancellation Policy | MagicalCX",
    description:
      "Learn about MagicalCX's refund and cancellation policy. Understand our transparent billing terms and cancellation process.",
    url: `${coreConf.baseUrl}/legal/refund`,
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/legal/refund`,
  },
};

export default function RefundPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 border-x section-container section-content-padding w-full">
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
            MagicalCX Refund & Cancellation Policy
          </h1>

          <p className="text-muted-foreground mb-8">
            We've designed our policy to be simple, fair, and transparent so you
            can choose the plan and duration that work best for you, with full
            clarity from day one.
          </p>

          {/* Section 1 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">
              1. No Refunds – Why We Work This Way
            </h2>
            <p className="mb-4">
              When you subscribe to MagicalCX, we immediately:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Allocate infrastructure and resources for your account</li>
              <li>Onboard you and your team</li>
              <li>
                Make the full set of features available for the entire period
                you've paid for
              </li>
            </ul>
            <p className="mb-4">
              Because these costs are committed upfront,{" "}
              <strong>
                we do not offer refunds, partial refunds, or credits
              </strong>{" "}
              for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Unused days in a billing period</li>
              <li>Downgrades or cancellations made during a billing period</li>
              <li>One-time fees, add-ons, or implementation services</li>
            </ul>
            <p>
              This helps us keep our pricing as competitive and predictable as
              possible for all customers.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">
              2. You Can Cancel Any Time
            </h2>
            <p className="mb-4">
              You are never locked in beyond the period you've already paid for.
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                You can <strong>cancel your subscription at any time</strong>{" "}
                from within your account or by contacting our support team (as
                described in your agreement).
              </li>
              <li>
                Your cancellation will always take effect{" "}
                <strong>at the end of your current billing period</strong>.
              </li>
              <li>
                You will <strong>continue to have full access</strong> to
                MagicalCX and all paid features until that billing period ends.
              </li>
            </ul>
            <p className="mb-4">There are:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>No cancellation penalties</strong>
              </li>
              <li>
                <strong>No hidden fees</strong>
              </li>
              <li>
                <strong>No minimum-usage commitments</strong> beyond the period
                you have already paid for
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">
              3. How Billing Cycles & Cancellations Work
            </h2>

            <h3 className="text-xl font-medium mt-6 mb-3">
              3.1 Monthly subscriptions
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                You are billed <strong>once per month</strong> on your billing
                date.
              </li>
              <li>
                If you cancel in the middle of a month:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    Your subscription stays active until the{" "}
                    <strong>end of that current month's billing cycle</strong>.
                  </li>
                  <li>
                    Your{" "}
                    <strong>
                      cancellation will apply to the immediate upcoming billing
                      cycle
                    </strong>
                    , so:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>
                        You will <strong>not</strong> be charged again after the
                        end of the current cycle.
                      </li>
                      <li>
                        You will not receive a refund for the remaining days in
                        the current cycle, but you can continue using the
                        service until it ends.
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
            <div className="bg-muted/30 p-4 rounded-lg border border-border mb-6">
              <p className="font-medium mb-2">Example:</p>
              <p className="text-sm">
                Your billing date is the 10th of each month.
              </p>
              <ul className="list-disc pl-6 text-sm mt-2 space-y-1">
                <li>You cancel on 20 March.</li>
                <li>You keep full access until 9 April.</li>
                <li>
                  You are <strong>not</strong> billed on 10 April or thereafter.
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-medium mt-6 mb-3">
              3.2 Longer-term subscriptions (quarterly, annual, etc.)
            </h3>
            <p className="mb-4">
              If you choose a longer billing cycle (e.g.,{" "}
              <strong>quarterly or annual</strong>), you benefit from:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                <strong>Preferential pricing</strong> compared to monthly
              </li>
              <li>
                <strong>Locked-in rates</strong> for that period
              </li>
            </ul>
            <p className="mb-4">For these plans:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                You pay the full amount at the <strong>start</strong> of the
                billing period.
              </li>
              <li>
                You can cancel <strong>at any time</strong>, and the
                cancellation will take effect from the{" "}
                <strong>start of the next billing period</strong> (quarter,
                year, etc.).
              </li>
              <li>
                You will <strong>not</strong> be charged for the next period,
                but:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    You remain on the plan and retain full access until the{" "}
                    <strong>end of the period already paid for</strong>.
                  </li>
                  <li>
                    There are <strong>no refunds or partial refunds</strong> for
                    the unused portion of the current billing period.
                  </li>
                </ul>
              </li>
            </ul>
            <div className="bg-muted/30 p-4 rounded-lg border border-border">
              <p className="font-medium mb-2">Example:</p>
              <p className="text-sm">
                You are on an annual plan that runs from 1 January to 31
                December.
              </p>
              <ul className="list-disc pl-6 text-sm mt-2 space-y-1">
                <li>You cancel on 15 July.</li>
                <li>You continue to have full access until 31 December.</li>
                <li>
                  Your subscription does <strong>not</strong> renew on 1 January
                  of the following year.
                </li>
                <li>
                  No refund is issued for the remaining months of the current
                  year.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">
              4. Plan Changes (Upgrades & Downgrades)
            </h2>

            <h3 className="text-xl font-medium mt-6 mb-3">4.1 Upgrades</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                If you upgrade your plan (e.g., more seats, higher tier, or
                additional features), any related fees will be:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    <strong>Prorated</strong> for the remainder of your current
                    billing period, or
                  </li>
                  <li>Billed as described in your order form or agreement.</li>
                </ul>
              </li>
              <li>
                Upgrades are effective <strong>immediately</strong>, so you can
                start using the new features right away.
              </li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-3">4.2 Downgrades</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                If you downgrade your plan, the downgrade will take effect from
                the <strong>start of your next billing cycle</strong>.
              </li>
              <li>
                You will continue to enjoy the higher-tier features until the
                end of the current cycle.
              </li>
              <li>
                As with cancellations, <strong>no refunds or credits</strong>{" "}
                are issued for downgrades within an active billing period.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">
              5. Trial Periods & Promotions (If Offered)
            </h2>
            <p className="mb-4">From time to time, MagicalCX may offer:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                <strong>Free trials</strong>
              </li>
              <li>
                <strong>Pilot programs</strong>
              </li>
              <li>
                <strong>Promotional discounts</strong>
              </li>
            </ul>
            <p className="mb-4">
              Any special terms (including eligibility, duration, and billing
              after the trial) will be clearly stated in the applicable offer or
              order form.
            </p>
            <p className="mb-4">Unless explicitly stated otherwise:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Regular billing will start <strong>automatically</strong> at the
                end of any free or discounted period,
              </li>
              <li>
                Our standard <strong>no-refund</strong> and{" "}
                <strong>cancel-anytime</strong> rules will apply once the paid
                subscription begins.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">
              6. Transparency & Support
            </h2>
            <p className="mb-4">
              Our goal is to give you the confidence to choose the subscription
              length that best matches your needs—whether monthly, annual, or
              longer—knowing that:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                You <strong>always know in advance</strong> when your next
                payment is due
              </li>
              <li>
                You can <strong>cancel at any time</strong>, with no penalties
                or surprise charges
              </li>
              <li>
                Your pricing remains <strong>stable and predictable</strong> for
                the period you've selected
              </li>
            </ul>
            <p className="mb-4">
              If you're unsure which plan or duration to choose, our team is
              happy to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Walk you through usage scenarios and pricing,</li>
              <li>Help you right-size your subscription, and</li>
              <li>
                Adjust your plan as your needs evolve (for future billing
                cycles).
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">
              7. How to Cancel or Get Help
            </h2>
            <p className="mb-4">
              To cancel your subscription or ask any questions about billing:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                Use the <strong>cancellation option</strong> available in your
                MagicalCX account settings or
              </li>
              <li>
                Contact us at <strong>billing@magicalcx.com</strong> with your
                account details.
              </li>
            </ul>
            <p className="mb-4">We'll confirm:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                The <strong>effective end date</strong> of your current billing
                period, and
              </li>
              <li>
                That <strong>no further renewals</strong> will be charged after
                that date.
              </li>
            </ul>
          </section>
        </div>
      </main>

      <div className="bg-background dark">
        <Footer />
      </div>
    </div>
  );
}
