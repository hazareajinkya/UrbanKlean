"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { useScroll } from "framer-motion";
import { useRef } from "react";

export default function TermsPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 border-x section-container section-content-padding w-full ">
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
            Terms of Service
          </h1>

          <h2>1. The Service</h2>

          <h3>1.1 Service Description</h3>
          <p>
            MagicalCX (a product by Pure Intelligence AI Technologies LLP)
            provides a cloud‑based artificial intelligence platform that enables
            Customers to build and deploy conversational agents for customer
            support, sales, and user engagement (the <strong>“Service”</strong>
            ).
          </p>
          <p>
            Anything the Customer (including its Users) configures, customizes,
            uploads, connects, or otherwise utilizes through the Service is
            considered a <strong>“User Submission.”</strong> Customer is solely
            responsible for all User Submissions it contributes to or processes
            through the Service. Additional terms regarding User Submissions,
            including ownership and usage, are in Section 9.2 below.
          </p>
          <p>
            The Service may include templates, scripts, documentation, sample
            prompts, and other materials that assist Customer in using the
            Service (“<strong>MagicalCX Content</strong>”). Customers do not
            receive and will not be given access to the underlying code or
            software of the Service (collectively, the “
            <strong>Software</strong>”) nor receive any copy of the Software
            itself, except for any SDKs or client libraries that MagicalCX may
            expressly provide.
          </p>

          <h3>1.2 Customer’s Subscription</h3>
          <p>
            Subject to this Agreement, Customer may purchase a subscription to,
            and has the right to access and use, the Service as specified in one
            or more ordering screens, online checkouts, or other order forms
            agreed upon by the parties through MagicalCX’s website, platform, or
            authorized reseller that reference this Agreement and describe the
            commercial terms related to Customer’s subscription (each an “
            <strong>Order</strong>” and collectively, “<strong>Orders</strong>
            ”).
          </p>
          <p>
            Each subscription is for the term described in the applicable Order
            (the <strong>“Subscription Period”</strong>).
          </p>
          <p>
            Use of and access to the Service is permitted only for individuals
            authorized by the Customer and solely for Customer’s own internal
            business purposes, not for the benefit of any unrelated third party
            (each an “<strong>User</strong>”).
          </p>

          <h3>1.3 MagicalCX’s Ownership</h3>
          <p>MagicalCX (and/or its licensors) owns:</p>
          <ul>
            <li>the Service,</li>
            <li>the Software,</li>
            <li>MagicalCX Content,</li>
            <li>all documentation relating to the Service, and</li>
            <li>
              anything else provided by or on behalf of MagicalCX to the
              Customer
            </li>
          </ul>
          <p>
            (collectively, the “<strong>MagicalCX Materials</strong>”).
          </p>
          <p>
            MagicalCX retains all rights, title, and interest (including all
            intellectual property rights) in and to the MagicalCX Materials, all
            related and underlying technology, and any updates, enhancements,
            modifications, or fixes thereto, as well as all derivative works of
            or modifications to any of the foregoing.
          </p>
          <p>
            Except for the limited rights expressly granted in this Agreement,{" "}
            <strong>no other rights or licenses are granted</strong> to Customer
            (including any implied licenses), and all such rights are expressly
            reserved by MagicalCX and Pure Intelligence AI Technologies LLP.
          </p>

          <h3>1.4 Permissions and Affiliates</h3>
          <p>
            The Service may include customizable settings allowing Users to
            grant permissions to other Users to perform various tasks within the
            Service (collectively, “<strong>Permissions</strong>”). It is solely
            the Customer’s responsibility to set, review, and manage all
            Permissions, including determining which Users may create or adjust
            such Permissions.
          </p>
          <p>
            MagicalCX is not responsible for managing Permissions on Customer’s
            behalf and will not be liable for any issues, losses, or disputes
            arising from Permissions set by the Customer or its Users.
          </p>
          <p>
            Customer may provide access to the Service to its Affiliates, in
            which case all rights granted and obligations incurred under this
            Agreement shall extend to such Affiliates. As between the parties:
          </p>
          <ul>
            <li>
              Customer remains fully responsible for any act or omission of its
              Affiliates and Users that would constitute a breach of this
              Agreement;
            </li>
            <li>
              Customer represents and warrants it has the authority to agree to
              this Agreement on behalf of its Affiliates; and
            </li>
            <li>
              Customer is responsible for all payment obligations under this
              Agreement, regardless of whether the use of the Service is by
              Customer or its Affiliates.
            </li>
          </ul>
          <p>
            Any claim by an Affiliate against MagicalCX must be brought by
            Customer (not directly by such Affiliate).
          </p>
          <p>
            An “<strong>Affiliate</strong>” of a party means any entity directly
            or indirectly controlling, controlled by, or under common control
            with that party, where “control” means the ownership of more than
            fifty percent (50%) of the voting shares or other equity interests
            or the power to direct the management and policies of that entity.
          </p>

          <hr className="my-8 border-border" />

          <h2>2. Restrictions</h2>

          <h3>2.1 Customer’s Responsibilities</h3>
          <p>Customer is responsible for:</p>
          <ul>
            <li>
              all activity occurring under its accounts and those of its Users,
              except where such activity results solely from unauthorized access
              caused by a proven security vulnerability in the Service;
            </li>
            <li>
              ensuring its Users understand and comply with this Agreement; and
            </li>
            <li>
              promptly notifying MagicalCX if it becomes aware of any
              unauthorized use of accounts or credentials, or any breach of
              security.
            </li>
          </ul>
          <p>
            Customer will be liable for any breach of this Agreement by its
            Users or Affiliates.
          </p>

          <h3>2.2 Use Restrictions</h3>
          <p>
            Customer agrees that it will not, and will not permit any User or
            third party to, directly or indirectly:
          </p>
          <ul className="list-[lower-alpha]">
            <li>
              modify, translate, copy (except for reasonable internal copies of
              documentation), or create derivative works based on the Service or
              MagicalCX Materials;
            </li>
            <li>
              reverse engineer, decompile, disassemble, or attempt to discover
              the source code or underlying ideas or algorithms of any part of
              the Service, except to the limited extent that applicable law
              specifically prohibits such a restriction;
            </li>
            <li>
              sublicense, sell, resell, rent, lease, lend, distribute, or
              otherwise commercially exploit the Service or MagicalCX Materials,
              except as expressly agreed in writing by MagicalCX;
            </li>
            <li>
              remove, alter, or obscure any proprietary or confidentiality
              notices or labels on the Service or MagicalCX Materials;
            </li>
            <li>
              use the Service in violation of any applicable laws or regulations
              (including data protection laws and export control laws);
            </li>
            <li>
              attempt to gain unauthorized access to, interfere with, or disrupt
              the integrity or performance of the Service or related systems;
            </li>
            <li>
              use the Service to build, train, or improve products or services
              that directly compete with MagicalCX, except as explicitly
              permitted by a separate written agreement;
            </li>
            <li>
              conduct penetration testing, vulnerability scanning, or security
              assessments of the Service without MagicalCX’s prior written
              authorization;
            </li>
            <li>
              use the Service to transmit or store malicious code, spam, or
              content that is illegal, defamatory, or infringes any third‑party
              rights; or
            </li>
            <li>
              misrepresent its identity or affiliation when using the Service.
            </li>
          </ul>
          <p>If Customer’s use of the Service:</p>
          <ul>
            <li>
              (i) poses a security risk to the Service or to other customers,
            </li>
            <li>
              (ii) could adversely impact MagicalCX’s infrastructure or
              operations, or
            </li>
            <li>(iii) violates applicable law or this Agreement,</li>
          </ul>
          <p>
            MagicalCX may temporarily suspend or limit access to the Service.
            MagicalCX will, where reasonable and lawful, notify Customer and
            work with Customer in good faith to resolve the issue promptly.
          </p>

          <h3>2.3 API Access Restrictions</h3>
          <p>
            MagicalCX may provide application programming interfaces or webhooks
            as part of the Service (collectively, the “<strong>APIs</strong>”).
            MagicalCX may set and enforce{" "}
            <strong>technical or contractual usage limits</strong> on the APIs
            (for example, rate limits, maximum number of requests, or data
            transfer limits), and Customer agrees to comply with such limits.
          </p>
          <p>
            MagicalCX may modify, suspend, or terminate access to the APIs at
            any time:
          </p>
          <ul>
            <li>for legal, safety, or security reasons;</li>
            <li>to maintain or improve the Service; or</li>
            <li>where Customer is in breach of this Agreement.</li>
          </ul>
          <p>
            MagicalCX will, where commercially reasonable, provide advance
            notice of any change that materially reduces available API
            functionality.
          </p>

          <hr className="my-8 border-border" />

          <h2>3. Third‑Party Services</h2>
          <p>
            The Service may interface, integrate, or interoperate with
            third‑party products, services, or applications that are not owned
            or controlled by MagicalCX (collectively, “
            <strong>Third‑Party Services</strong>”).
          </p>
          <p>
            Customer may choose to enable or use such Third‑Party Services
            together with the Service. Where this integration requires it,
            Customer may be asked to provide or authorize the sharing of its
            credentials, tokens, or other information for the sole purpose of
            enabling the integration and allowing MagicalCX to provide the
            Service.
          </p>
          <p>Customer represents and warrants that:</p>
          <ul>
            <li>
              it has all necessary rights and authority to provide such
              information and to enable integration with the Third‑Party
              Services; and
            </li>
            <li>
              such integration does not violate any terms governing Customer’s
              use of the Third‑Party Services.
            </li>
          </ul>
          <p>
            MagicalCX does <strong>not</strong> endorse, control, or operate any
            Third‑Party Services. This Agreement does not govern Customer’s use
            of Third‑Party Services; such use is subject to the separate terms
            and privacy policies of the relevant third‑party providers.
            MagicalCX expressly disclaims all representations and warranties
            concerning Third‑Party Services, and any support, disputes, or
            warranty claims relating to Third‑Party Services must be directed to
            the applicable third‑party provider.
          </p>
          <p>
            Use of Third‑Party Services is at Customer’s own risk, and MagicalCX
            will not be liable for any issues, losses, or damage arising from or
            relating to the use or inability to use any Third‑Party Services.
          </p>

          <hr className="my-8 border-border" />

          <h2>4. Financial Terms</h2>

          <h3>4.1 Fees</h3>
          <p>
            Customer shall pay the fees for access to and use of the Service as
            specified in the applicable Order (“<strong>Fees</strong>”).
          </p>
          <p>Unless otherwise specified in the Order:</p>
          <ul>
            <li>
              Fees are quoted and payable in Indian Rupees (INR) for India‑based
              Customers and in U.S. Dollars (USD) or another currency specified
              by MagicalCX for Customers outside India;
            </li>
            <li>payment obligations are non‑cancellable; and</li>
            <li>
              except as explicitly stated in this Agreement,{" "}
              <strong>Fees are non‑refundable</strong>.
            </li>
          </ul>
          <p>
            MagicalCX may modify its generally applicable Fees or introduce new
            fees at its discretion, effective as of the start of the next
            renewal Subscription Period. If Customer does not agree to revised
            Fees, Customer may choose not to renew its subscription in
            accordance with Section 5.
          </p>

          <h3>4.2 Payment</h3>
          <p>
            MagicalCX, either directly or through one or more third‑party
            payment processors or gateways (each a “
            <strong>Payment Processor</strong>”), will charge or invoice
            Customer for the Fees using the payment method specified in the
            applicable Order or provided through the Service.
          </p>
          <p>Customer authorizes MagicalCX and/or the Payment Processor to:</p>
          <ul>
            <li>
              charge the Customer’s credit card, debit card, bank account
              (including via UPI, net‑banking, ACH, or similar mechanisms), or
              other approved payment method for all Fees due under each Order;
              and
            </li>
            <li>
              process recurring payments for subscription renewals, where
              applicable, without requiring further authorization from Customer,
              until Customer properly cancels or terminates the applicable
              subscription.
            </li>
          </ul>
          <p>
            Customer is responsible for ensuring that MagicalCX (or its Payment
            Processor) has current, complete, and accurate payment information.
            Failure to maintain accurate payment details or to pay Fees when due
            may result in suspension of access to the Service.
          </p>
          <p>
            Where payment is processed by a Payment Processor, such transactions
            are subject to the Payment Processor’s separate terms, conditions,
            and privacy policies, in addition to this Agreement. MagicalCX is
            not responsible for any errors or omissions of the Payment Processor
            but reserves the right to correct any billing or processing errors
            (including after payment has been requested or received).
          </p>

          <h3>4.3 Taxes</h3>
          <p>
            Fees are <strong>exclusive</strong> of all taxes, levies, duties,
            and similar governmental assessments of any nature, including but
            not limited to value‑added tax (VAT), goods and services tax (GST),
            service tax, sales tax, use tax, withholding tax, or other
            applicable indirect taxes (collectively, “<strong>Taxes</strong>
            ”).
          </p>
          <p>Customer is responsible for:</p>
          <ul>
            <li>
              paying all Taxes associated with its purchases under this
              Agreement (other than taxes based on MagicalCX’s income, property,
              or employees); and
            </li>
            <li>
              providing any valid tax exemption documentation, if applicable.
            </li>
          </ul>
          <p>
            If MagicalCX is required to collect or pay Taxes for which Customer
            is responsible, MagicalCX may add such amounts to the Fees and
            invoice or charge Customer accordingly, unless Customer provides a
            valid exemption certificate accepted by the relevant taxing
            authority.
          </p>
          <p>
            If any Taxes are required to be withheld from payments made by
            Customer, then:
          </p>
          <ul>
            <li>
              the amount payable by Customer will be increased so that MagicalCX
              receives the amount it would have received if no withholding were
              required, and
            </li>
            <li>
              Customer will promptly provide proof of such withholding and
              remittance as required by law.
            </li>
          </ul>

          <h3>4.4 Failure to Pay</h3>
          <p>If Customer fails to pay any Fees when due:</p>
          <ul>
            <li>
              MagicalCX may, after giving reasonable notice where practicable,
              suspend or limit Customer’s access to the Service until all
              overdue amounts are paid in full;
            </li>
            <li>
              MagicalCX may attempt to charge Customer’s payment method multiple
              times; and
            </li>
            <li>
              MagicalCX may apply late charges or interest at the maximum rate
              permitted by applicable law.
            </li>
          </ul>
          <p>
            If Customer believes it has been incorrectly billed, Customer must
            notify MagicalCX in writing (for example, by email to MagicalCX
            billing support) <strong>within sixty (60) days</strong> from the
            date of the first billing statement on which the error appeared.
            Customer waives the right to dispute any charges that were not
            disputed within such 60‑day period.
          </p>
          <p>
            Upon receiving a timely dispute notice, MagicalCX will promptly
            review the disputed amount and provide Customer with a written
            decision (which may be by email), including any supporting evidence.
            If MagicalCX determines that the billed amounts were incorrect,
            MagicalCX will issue a credit or refund, or adjust future invoices.
            If MagicalCX determines the billed amounts were correct, Customer
            will pay any outstanding amounts within ten (10) days of receiving
            MagicalCX’s written decision.
          </p>

          <hr className="my-8 border-border" />

          <h2>5. Term and Termination</h2>

          <h3>5.1 Agreement Term and Renewals</h3>
          <p>
            Each subscription to access and use the Service commences on the
            subscription start date specified in the applicable Order (the “
            <strong>Subscription Start Date</strong>”) and continues for the
            Subscription Period defined therein.
          </p>
          <p>Unless otherwise stated in the Order:</p>
          <ul>
            <li>
              subscriptions will <strong>automatically renew</strong> for
              successive Subscription Periods on the same terms and conditions
              (including pricing, subject to any update under Section 4.1)
              unless either party gives the other written notice of non‑renewal
              before the end of the then‑current Subscription Period; and
            </li>
            <li>
              Customer may elect not to renew by following the cancellation
              instructions within the Service or by sending a non‑renewal notice
              to MagicalCX at the designated billing or support email address,
              subject to confirmation of receipt.
            </li>
          </ul>
          <p>This Agreement becomes effective on the earlier of:</p>
          <ul>
            <li>the Subscription Start Date of Customer’s first Order, or</li>
            <li>
              the date on which Customer first accesses or uses the Service,
            </li>
          </ul>
          <p>
            and remains in effect for the duration of all active Subscription
            Periods and any period during which Customer is using the Service,
            even if such use is on a free or trial basis (the “
            <strong>Term</strong>”).
          </p>
          <p>
            If this Agreement is terminated by either party, all active Orders
            will automatically terminate as of the effective date of
            termination, unless otherwise agreed in writing.
          </p>
          <p>
            MagicalCX may, at its sole discretion, offer a <strong>free</strong>
            , <strong>trial</strong>, or <strong>limited‑feature</strong>{" "}
            version of the Service (collectively, the “
            <strong>Free Version</strong>”). If a paid subscription expires or
            is not renewed, MagicalCX may, but is not obliged to, automatically
            downgrade Customer’s access to a Free Version with reduced features
            and functionality. MagicalCX may discontinue or modify the Free
            Version at any time.
          </p>

          <h3>5.2 Termination</h3>
          <p>
            Either party may terminate this Agreement (including all Orders)
            upon written notice to the other party if:
          </p>
          <ul>
            <li>
              the other party materially breaches this Agreement and fails to
              cure such breach within thirty (30) days after receiving written
              notice describing the breach in reasonable detail; or
            </li>
            <li>
              the other party becomes the subject of insolvency, bankruptcy,
              liquidation, or similar proceedings that are not dismissed within
              a reasonable time as permitted by applicable law.
            </li>
          </ul>
          <p>
            MagicalCX may terminate or suspend Customer’s access to any Free
            Version at any time, for any or no reason, upon notice (which may be
            by email or via the Service).
          </p>

          <h3>5.3 Effect of Termination</h3>
          <p>
            If Customer terminates this Agreement due to MagicalCX’s uncured
            material breach, MagicalCX will refund any unused, prepaid Fees
            covering the remainder of the then‑current Subscription Period after
            the effective date of termination.
          </p>
          <p>
            If MagicalCX terminates this Agreement due to Customer’s uncured
            material breach, Customer will remain liable for all unpaid Fees due
            for the remainder of the then‑current Subscription Period.
          </p>
          <p>
            In all cases, termination will not relieve Customer of the
            obligation to pay any Fees accrued or payable prior to the effective
            date of termination.
          </p>
          <p>Upon termination or expiration of this Agreement:</p>
          <ul>
            <li>
              all rights and licenses granted to Customer under this Agreement
              will cease immediately;
            </li>
            <li>
              Customer’s access to the Service (including any Free Version) will
              be disabled; and
            </li>
            <li>
              MagicalCX will, within thirty (30) days of termination or
              following Customer’s specific written request, delete or anonymize
              Customer’s User Information and User Submissions from live
              systems, except to the extent retention is required by applicable
              law, regulation, or legal process, or is necessary for legitimate
              business purposes such as fraud prevention, accounting, or dispute
              resolution.
            </li>
          </ul>
          <p>
            For Customers using a Free Version only, MagicalCX may retain
            certain User Submissions and User Information for a reasonable
            period to allow continued use. MagicalCX may delete all User
            Submissions and User Information if an account remains inactive for
            more than one (1) year.
          </p>

          <h3>5.4 Survival</h3>
          <p>
            The following sections will survive any termination or expiration of
            this Agreement: <strong>MagicalCX’s Ownership</strong>,{" "}
            <strong>Restrictions</strong>, <strong>Third‑Party Services</strong>
            , <strong>Financial Terms</strong>,{" "}
            <strong>Term and Termination</strong>,{" "}
            <strong>Warranties and Disclaimers</strong>,{" "}
            <strong>Limitation of Liability</strong>,{" "}
            <strong>Confidentiality</strong>, <strong>Data</strong>, and{" "}
            <strong>General Terms</strong>, together with any other provisions
            that by their nature are intended to survive.
          </p>

          <hr className="my-8 border-border" />

          <h2>6. Warranties and Disclaimers</h2>

          <h3>6.1 Customer Warranties</h3>
          <p>Customer represents and warrants that:</p>
          <ul>
            <li>
              it has full power and authority to enter into this Agreement and
              perform its obligations;
            </li>
            <li>
              all User Submissions and use of the Service by Customer and its
              Users comply with all applicable laws, rules, and regulations; and
            </li>
            <li>
              it has obtained and will maintain all necessary consents,
              permissions, and notices required to allow MagicalCX to process
              User Information and User Submissions as contemplated by this
              Agreement.
            </li>
          </ul>

          <h3>6.2 Service Disclaimer</h3>
          <p>
            EXCEPT AS EXPRESSLY STATED IN THIS AGREEMENT, THE SERVICE AND ALL
            RELATED MAGICALCX MATERIALS, COMPONENTS, AND INFORMATION ARE
            PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS.
          </p>
          <p>
            MAGICALCX, PURE INTELLIGENCE AI TECHNOLOGIES LLP, AND THEIR
            AFFILIATES AND SUPPLIERS EXPRESSLY DISCLAIM, TO THE MAXIMUM EXTENT
            PERMITTED BY APPLICABLE LAW, <strong>ALL WARRANTIES</strong>,
            WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT
            LIMITED TO ANY IMPLIED WARRANTIES OF:
          </p>
          <ul>
            <li>MERCHANTABILITY,</li>
            <li>FITNESS FOR A PARTICULAR PURPOSE,</li>
            <li>NON‑INFRINGEMENT,</li>
            <li>TITLE, AND</li>
            <li>
              ANY WARRANTIES ARISING OUT OF COURSE OF DEALING OR USAGE OF TRADE.
            </li>
          </ul>
          <p>CUSTOMER ACKNOWLEDGES THAT:</p>
          <ul>
            <li>
              MAGICALCX DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              TIMELY, SECURE, OR ERROR‑FREE;
            </li>
            <li>
              NO INFORMATION OR ADVICE OBTAINED FROM MAGICALCX OR THROUGH THE
              SERVICE WILL CREATE ANY WARRANTY NOT EXPRESSLY STATED IN THIS
              AGREEMENT; AND
            </li>
            <li>
              THE SERVICE RELIES IN PART ON MACHINE LEARNING AND OTHER
              PROBABILISTIC METHODS, AND RESPONSES OR OUTPUTS MAY BE INACCURATE
              OR INCOMPLETE; CUSTOMER IS RESPONSIBLE FOR REVIEWING SUCH OUTPUTS
              BEFORE USING THEM IN CRITICAL CONTEXTS.
            </li>
          </ul>
          <p>
            Some jurisdictions do not allow the exclusion of certain warranties.
            To the extent such laws apply, some of the above disclaimers may not
            fully apply to Customer, and the scope and duration of any required
            warranty shall be limited to the minimum extent permitted under such
            law.
          </p>

          <hr className="my-8 border-border" />

          <h2>7. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL
            MAGICALCX, PURE INTELLIGENCE AI TECHNOLOGIES LLP, OR THEIR
            AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, OR SUPPLIERS BE LIABLE
            FOR ANY:
          </p>
          <ul>
            <li>INDIRECT,</li>
            <li>SPECIAL,</li>
            <li>INCIDENTAL,</li>
            <li>CONSEQUENTIAL, OR</li>
            <li>PUNITIVE DAMAGES,</li>
          </ul>
          <p>
            OR FOR ANY LOSS OF USE, DATA, BUSINESS, REVENUE, PROFITS, GOODWILL,
            OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH
            THIS AGREEMENT OR THE USE OF OR INABILITY TO USE THE SERVICE,
            REGARDLESS OF THE THEORY OF LIABILITY (CONTRACT, TORT, OR
            OTHERWISE), EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>
          <p>
            IN ADDITION, TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW,
            MAGICALCX’S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO
            THIS AGREEMENT WILL NOT EXCEED THE TOTAL FEES PAID OR PAYABLE BY
            CUSTOMER TO MAGICALCX FOR THE SERVICE DURING THE TWELVE (12) MONTHS
            IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
          </p>
          <p>
            These limitations shall apply even if any limited remedy fails of
            its essential purpose. Some jurisdictions do not allow certain
            limitations of liability; in such cases, the foregoing limitations
            shall apply to the fullest extent permitted by applicable law.
          </p>

          <hr className="my-8 border-border" />

          <h2>8. Confidentiality</h2>

          <h3>8.1 Definition</h3>
          <p>
            Each party (the “<strong>Receiving Party</strong>”) acknowledges
            that the other party (the “<strong>Disclosing Party</strong>”) may
            disclose business, technical, financial, or operational information
            that is identified as confidential or that, given the nature of the
            information and the circumstances of disclosure, should reasonably
            be understood to be confidential (“
            <strong>Confidential Information</strong>”).
          </p>
          <p>For MagicalCX, Confidential Information includes:</p>
          <ul>
            <li>
              non‑public information about features, functionality, performance,
              and security of the Service;
            </li>
            <li>product roadmaps and pricing; and</li>
            <li>any non‑public documentation or technical information.</li>
          </ul>
          <p>For Customer, Confidential Information includes:</p>
          <ul>
            <li>User Information;</li>
            <li>User Submissions; and</li>
            <li>any non‑public business information disclosed to MagicalCX.</li>
          </ul>
          <p>
            This Agreement and all related Orders constitute Confidential
            Information of both parties.
          </p>
          <p>
            Confidential Information does <strong>not</strong> include
            information that:
          </p>
          <ul className="list-[lower-alpha]">
            <li>
              is or becomes generally available to the public without breach of
              any obligation owed to the Disclosing Party;
            </li>
            <li>
              was known to the Receiving Party prior to its disclosure by the
              Disclosing Party without breach of any obligation;
            </li>
            <li>
              is received from a third party without breach of any obligation of
              confidentiality; or
            </li>
            <li>
              was independently developed by the Receiving Party without use of
              or reference to the Disclosing Party’s Confidential Information.
            </li>
          </ul>

          <h3>8.2 Protection and Use of Confidential Information</h3>
          <p>The Receiving Party shall:</p>
          <ul className="list-[lower-alpha]">
            <li>
              protect the Disclosing Party’s Confidential Information using at
              least the same degree of care it uses to protect its own similar
              information, but in no event less than a reasonable degree of
              care;
            </li>
            <li>
              restrict access to the Disclosing Party’s Confidential Information
              to its employees, officers, Affiliates, subcontractors, agents,
              consultants, legal advisors, financial advisors, and contractors
              (collectively, “<strong>Representatives</strong>”) who have a
              legitimate need to know such information for the purposes of this
              Agreement and who are bound by confidentiality obligations at
              least as protective as those set forth herein;
            </li>
            <li>
              not disclose any Confidential Information to any third party
              without the Disclosing Party’s prior written consent, except as
              expressly permitted in this Agreement; and
            </li>
            <li>
              use the Disclosing Party’s Confidential Information solely for the
              purpose of performing its obligations or exercising its rights
              under this Agreement.
            </li>
          </ul>
          <p>Nothing in this Section prevents either party from:</p>
          <ul>
            <li>
              disclosing the existence of this Agreement (but not the specific
              terms) or the other party’s name and logo in customer or partner
              lists and marketing materials, or
            </li>
            <li>
              disclosing the terms of this Agreement (under appropriate
              confidentiality obligations) to potential investors, acquirers, or
              professional advisors.
            </li>
          </ul>

          <h3>8.3 Compelled Disclosure</h3>
          <p>
            The Receiving Party may disclose Confidential Information of the
            Disclosing Party to the extent required by applicable law,
            regulation, or legal process, provided that (where legally
            permissible):
          </p>
          <ul>
            <li>
              the Receiving Party gives the Disclosing Party prompt written
              notice of the request, and
            </li>
            <li>
              the Receiving Party provides reasonable assistance (at the
              Disclosing Party’s expense) if the Disclosing Party wishes to seek
              a protective order or otherwise contest the disclosure.
            </li>
          </ul>

          <h3>8.4 Feedback</h3>
          <p>
            Customer or its Users may provide suggestions, ideas, enhancement
            requests, recommendations, or other feedback regarding the Service
            (“<strong>Feedback</strong>”).
          </p>
          <p>
            Customer grants MagicalCX a worldwide, royalty‑free, perpetual,
            irrevocable, fully transferable, and sublicensable license to use,
            copy, disclose, modify, create derivative works of, distribute,
            display, and otherwise exploit any Feedback for any lawful purpose,
            without restriction or obligation of any kind, except that MagicalCX
            will not publicly identify Customer as the source of Feedback
            without Customer’s prior consent.
          </p>

          <hr className="my-8 border-border" />

          <h2>9. Data</h2>

          <h3>9.1 User Information</h3>
          <p>
            To access and use the Service, Customer and its Users must provide
            certain information, which may include names, email addresses,
            usernames, IP addresses, browser and device information,
            organization names, and other similar account or usage details (“
            <strong>User Information</strong>”).
          </p>
          <p>
            Customer authorizes MagicalCX (and its subprocessors and
            subprocessors’ hosting providers) to store, process, and use User
            Information as necessary to:
          </p>
          <ul>
            <li>provide, maintain, and improve the Service;</li>
            <li>manage accounts and authentication;</li>
            <li>provide customer support and security; and</li>
            <li>comply with law.</li>
          </ul>
          <p>
            Customer represents and warrants that it has obtained all necessary
            rights, consents, and authorizations from Users to provide their
            User Information to MagicalCX and to permit MagicalCX to process
            such information as described in this Agreement and in MagicalCX’s
            Privacy Statement.
          </p>
          <p>
            Customer remains responsible for maintaining the confidentiality of
            its and its Users’ login credentials and for any use of the Service
            under such credentials, except where such use results from
            MagicalCX’s security breach.
          </p>

          <h3>9.2 User Submissions</h3>
          <p>
            As between the parties, Customer retains all ownership rights in and
            to its User Submissions.
          </p>
          <p>
            Customer grants MagicalCX a non‑exclusive, worldwide, royalty‑free,
            transferable, and sublicensable license to host, store, reproduce,
            process, and display User Submissions <strong>solely</strong>:
          </p>
          <ul>
            <li>to provide, operate, support, and secure the Service,</li>
            <li>
              to prevent or address service, security, or technical issues,
            </li>
            <li>to comply with law, and</li>
            <li>
              to perform internal analytics and quality improvements that do not
              use Customer‑identifying content for generic AI model training
              unless expressly allowed by a separate written agreement.
            </li>
          </ul>
          <p>
            Unless explicitly agreed otherwise in writing, MagicalCX{" "}
            <strong>does not use</strong> Customer’s User Submissions to train
            generalized AI or machine learning models that are made available to
            other customers. MagicalCX may use de‑identified and aggregated
            information derived from User Submissions as part of Service Data
            (see Section 9.3).
          </p>

          <h3>9.3 Service Data</h3>
          <p>
            MagicalCX may collect information relating to the performance,
            usage, and operation of the Service, including logs, metrics, and
            analytics data (“<strong>Service Data</strong>”).
          </p>
          <p>Provided such Service Data:</p>
          <ul>
            <li>
              is aggregated and/or de‑identified so that it does not identify
              Customer or any individual; and
            </li>
            <li>
              does not contain any Customer Confidential Information in
              identifiable form,
            </li>
          </ul>
          <p>
            MagicalCX may use such Service Data for any lawful business purpose,
            including:
          </p>
          <ul>
            <li>monitoring and improving the Service,</li>
            <li>developing new features or services,</li>
            <li>benchmarking and analytics, and</li>
            <li>
              preparing and sharing insights, provided that Customer or Users
              are not identified as the source.
            </li>
          </ul>
          <p>
            MagicalCX owns all right, title, and interest in and to Service
            Data.
          </p>

          <h3>9.4 Data Protection and Security</h3>
          <p>
            MagicalCX implements commercially reasonable technical and
            organizational measures designed to protect Customer Data (including
            User Information and User Submissions) against unauthorized or
            unlawful processing, and against accidental loss, destruction, or
            damage.
          </p>
          <p>Without limiting the foregoing, MagicalCX aims to maintain:</p>
          <ul>
            <li>encryption in transit (and, where applicable, at rest),</li>
            <li>access controls and role‑based permissions,</li>
            <li>regular backups, and</li>
            <li>infrastructure security in line with industry standards.</li>
          </ul>
          <p>However, Customer is responsible for:</p>
          <ul>
            <li>configuring the Service appropriately for its use;</li>
            <li>
              managing Permissions and access controls within its own accounts;
              and
            </li>
            <li>
              maintaining the security and integrity of its own systems,
              networks, and devices that connect to the Service.
            </li>
          </ul>
          <p>
            MagicalCX’s detailed privacy and security practices are described in
            its Privacy Statement and any additional security documentation it
            may publish (for example, in a Trust or Security Center).
          </p>

          <hr className="my-8 border-border" />

          <h2>10. General Terms</h2>

          <h3>10.1 Governing Law and Jurisdiction</h3>
          <h4>
            10.1.1 If Customer is incorporated or has its principal place of
            business in India
          </h4>
          <p>
            This Agreement shall be governed by and construed in accordance with
            the laws of <strong>India</strong>, without regard to any conflict
            of laws principles that would result in the application of the laws
            of another jurisdiction.
          </p>
          <p>
            Any dispute, controversy, or claim arising out of or relating to
            this Agreement, including any question regarding its existence,
            validity, interpretation, breach, or termination (“
            <strong>Dispute</strong>”), shall be subject to the{" "}
            <strong>
              exclusive jurisdiction of the courts at Bengaluru, Karnataka,
              India
            </strong>
            , and the parties hereby irrevocably submit to such jurisdiction,
            subject to the arbitration provisions in Section 10.2 (if
            applicable).
          </p>

          <h4>
            10.1.2 If Customer is incorporated or has its principal place of
            business outside India
          </h4>
          <p>
            This Agreement shall be governed by and construed in accordance with
            the laws of <strong>India</strong>, without regard to its conflict
            of laws rules, <strong>provided that</strong> mandatory consumer
            protection or data protection laws of Customer’s own jurisdiction
            (for example, in the EU, UK, or other applicable jurisdiction) that
            cannot lawfully be contracted out of shall continue to apply to the
            extent they are directly and mandatorily applicable.
          </p>
          <p>
            Subject to Section 10.2 (Dispute Resolution; Arbitration), the
            parties agree that the courts of{" "}
            <strong>Pune, Maharashtra, India</strong> shall have non‑exclusive
            jurisdiction over any Dispute. This means that MagicalCX (Pure
            Intelligence AI Technologies LLP) retains the right to bring
            proceedings to enforce its intellectual property or payment rights
            in any court of competent jurisdiction where Customer is located or
            where assets are situated, where permitted by applicable law.
          </p>

          <h3>10.2 Dispute Resolution; Arbitration</h3>
          <h4>10.2.1 Good‑Faith Negotiations</h4>
          <p>
            In the event of any Dispute, the parties shall first attempt in good
            faith to resolve the Dispute through informal discussions between
            senior representatives of each party. Either party may initiate this
            process by sending written notice to the other party describing the
            nature of the Dispute. The parties will use reasonable efforts to
            resolve the Dispute within <strong>thirty (30) days</strong> after
            such notice.
          </p>

          <h4>10.2.2 Arbitration (Commercial / B2B Only)</h4>
          <p>
            If the Dispute is not resolved through good‑faith negotiations
            within the 30‑day period, and{" "}
            <strong>
              Customer is not a consumer or micro‑enterprise under the laws of
              its jurisdiction
            </strong>
            , the Dispute shall be finally resolved by binding arbitration as
            follows:
          </p>
          <ul className="list-[lower-alpha]">
            <li>
              The arbitration shall be conducted in accordance with the{" "}
              <strong>Arbitration and Conciliation Act, 1996</strong> (India),
              as amended from time to time.
            </li>
            <li>
              The seat and venue of arbitration shall be{" "}
              <strong>Pune, Maharashtra, India</strong>.
            </li>
            <li>
              The arbitration tribunal shall consist of{" "}
              <strong>a sole arbitrator</strong> appointed jointly by the
              parties. If the parties are unable to agree on a sole arbitrator
              within thirty (30) days, the arbitrator shall be appointed in
              accordance with the rules of the designated arbitral institution
              (if any) or, failing that, by the competent court under the
              Arbitration and Conciliation Act, 1996.
            </li>
            <li>
              The language of the arbitration shall be <strong>English</strong>.
            </li>
            <li>
              The arbitral award shall be <strong>final and binding</strong> on
              the parties and may be entered and enforced in any court of
              competent jurisdiction.
            </li>
          </ul>

          <h4>10.2.3 Injunctive Relief and IP Protection</h4>
          <p>
            Nothing in this Agreement shall prevent either party from seeking
            immediate injunctive or equitable relief, specific performance, or
            other urgent interim relief before any court of competent
            jurisdiction (including courts outside India) to protect its
            Confidential Information or intellectual property rights, or to
            prevent unauthorized access to or use of the Service.
          </p>

          <h4>10.2.4 Consumer and Mandatory Protections</h4>
          <p>
            If Customer is deemed a <strong>consumer</strong>,{" "}
            <strong>micro‑enterprise</strong>, or similar protected party under
            the mandatory laws of its jurisdiction (e.g., in the EU, UK, certain
            US states, Canada, Australia, New Zealand, or Singapore), then any
            mandatory local dispute resolution or consumer protection rules that
            cannot lawfully be waived shall apply in addition to, or in lieu of,
            the arbitration provisions herein, to the minimum extent required by
            such laws.
          </p>

          <h3>10.3 Compliance with Laws; Export Control and Sanctions</h3>
          <h4>10.3.1 Compliance</h4>
          <p>
            Each party shall comply with all laws and regulations applicable to
            its performance under this Agreement, including but not limited to
            applicable privacy, data protection, anti‑bribery, anti‑corruption,
            and export control laws.
          </p>

          <h4>10.3.2 Export and Sanctions</h4>
          <p>Customer shall not:</p>
          <ul>
            <li>
              access, use, export, re‑export, transfer, or otherwise make the
              Service available in any jurisdiction or to any person or entity
              that is prohibited under applicable export control or economic
              sanctions laws (including those of India, the United Nations, the
              European Union, the United Kingdom, and the United States), or
            </li>
            <li>
              use the Service for any purpose prohibited by such laws, including
              nuclear, chemical, or biological weapons proliferation, or missile
              technology.
            </li>
          </ul>
          <p>Customer represents and warrants that:</p>
          <ul>
            <li>
              it is not listed on any government‑maintained sanctions,
              denied‑party, or restricted‑party list, and
            </li>
            <li>
              it will not permit access to or use of the Service by any person
              or entity so listed or located in a restricted jurisdiction.
            </li>
          </ul>
          <p>
            MagicalCX may suspend or terminate access to the Service
            immediately, without liability, where it reasonably believes that
            Customer’s use of the Service violates applicable sanctions or
            export control laws.
          </p>

          <h3>10.4 Anti‑Bribery and Anti‑Corruption</h3>
          <p>
            Each party agrees that in connection with this Agreement it will
            comply with all applicable anti‑bribery and anti‑corruption laws,
            including the <strong>Prevention of Corruption Act, 1988</strong>{" "}
            (India), the <strong>UK Bribery Act 2010</strong>, the{" "}
            <strong>U.S. Foreign Corrupt Practices Act (FCPA)</strong>, and any
            similar laws in other relevant jurisdictions.
          </p>
          <p>
            Neither party will, directly or indirectly, offer, give, promise,
            authorize, or accept any undue or improper advantage (including
            bribes, facilitation payments, or kickbacks) in connection with this
            Agreement.
          </p>

          <h3>10.5 Assignment</h3>
          <p>
            Customer may not assign, transfer, or delegate any of its rights or
            obligations under this Agreement, whether by operation of law or
            otherwise, without MagicalCX’s prior written consent, which will not
            be unreasonably withheld for a bona fide corporate reorganization
            that does not pose additional risk to MagicalCX.
          </p>
          <p>
            MagicalCX may assign or transfer this Agreement, in whole or in
            part, <strong>without Customer’s consent</strong>:
          </p>
          <ul>
            <li>to an Affiliate;</li>
            <li>
              in connection with a merger, acquisition, corporate
              reorganization, or sale of all or substantially all of its assets
              or business related to the Service; or
            </li>
            <li>to a successor entity in any such transaction.</li>
          </ul>
          <p>
            Any attempted assignment in violation of this Section 10.5 will be
            null and void. Subject to the foregoing, this Agreement will bind
            and inure to the benefit of the parties and their respective
            permitted successors and assigns.
          </p>

          <h3>10.6 Force Majeure</h3>
          <p>
            Neither party will be liable for any delay or failure to perform its
            obligations (except for payment obligations) under this Agreement if
            such delay or failure results from events, circumstances, or causes
            beyond its reasonable control, including but not limited to:
          </p>
          <ul>
            <li>
              acts of God or natural disasters (such as earthquakes, floods, or
              storms);
            </li>
            <li>war, terrorism, civil unrest, or armed conflict;</li>
            <li>acts of government or regulatory authorities;</li>
            <li>
              strikes, lockouts, labor disputes (excluding those involving the
              affected party’s own workforce where reasonably controllable);
            </li>
            <li>
              failure or interruption of public or private telecommunications
              networks, internet infrastructure, or power supplies not under the
              affected party’s reasonable control; or
            </li>
            <li>
              pandemics, epidemics, or other public health emergencies and
              related governmental measures.
            </li>
          </ul>
          <p>The affected party shall:</p>
          <ul>
            <li>
              use commercially reasonable efforts to mitigate the impact of the
              force majeure event and resume performance as soon as reasonably
              possible; and
            </li>
            <li>
              promptly notify the other party of the occurrence of such event
              and its expected duration, where practicable.
            </li>
          </ul>
          <p>
            If a force majeure event continues for more than{" "}
            <strong>sixty (60) consecutive days</strong>, either party may
            terminate the affected Orders by giving written notice to the other
            party, without penalty (but without prejudice to any amounts due for
            Services provided up to the effective date of termination).
          </p>

          <h3>10.7 Relationship of the Parties</h3>
          <p>
            The parties are independent contractors. Nothing in this Agreement
            shall be construed as:
          </p>
          <ul>
            <li>
              creating a partnership, joint venture, agency, fiduciary, or
              employment relationship between the parties, or
            </li>
            <li>
              authorizing either party to make or accept any offers or
              representations on behalf of the other party.
            </li>
          </ul>
          <p>
            Each party remains solely responsible for its own employees and
            contractors, and for all employment‑related taxes and contributions
            applicable to them.
          </p>

          <h3>10.8 Notices</h3>
          <h4>10.8.1 Notices to MagicalCX</h4>
          <p>
            All legal or contractual notices to MagicalCX under this Agreement
            shall be in writing and shall be deemed given when delivered:
          </p>
          <ul>
            <li>
              by email to MagicalCX’s designated legal or support email address
              specified on the Service or in the Order, and/or
            </li>
            <li>
              by registered post, courier, or hand delivery to the registered
              office of <strong>Pure Intelligence AI Technologies LLP</strong>{" "}
              (as specified on the MagicalCX website or in the Order).
            </li>
          </ul>

          <h4>10.8.2 Notices to Customer</h4>
          <p>MagicalCX may provide notices to Customer by:</p>
          <ul>
            <li>
              email to the primary email address associated with Customer’s
              account or specified in the Order;
            </li>
            <li>in‑app notifications within the Service; or</li>
            <li>
              posting an update on the MagicalCX website or status page for
              general service‑wide notices.
            </li>
          </ul>
          <p>Notices shall be deemed received:</p>
          <ul>
            <li>
              when sent by email, on the date of transmission (absent a
              bounce‑back or delivery failure),
            </li>
            <li>when posted in‑app, at the time of display to the User, and</li>
            <li>
              for physical delivery, upon confirmed delivery by courier or
              postal service.
            </li>
          </ul>
          <p>
            Customer is responsible for ensuring that its contact details
            (including email address and billing contact) remain current and
            accurate.
          </p>

          <h3>10.9 Publicity</h3>
          <p>Unless Customer expressly objects in writing, MagicalCX may:</p>
          <ul>
            <li>
              use Customer’s name, trade name, and logo (in accordance with
              Customer’s reasonable brand guidelines) in its customer lists,
              marketing materials, presentations, and on its website to identify
              Customer as a user of the Service; and
            </li>
            <li>
              describe in general terms the nature of the Services provided to
              Customer.
            </li>
          </ul>
          <p>
            Any additional, more detailed publicity (such as case studies, press
            releases, or joint marketing activities) will require Customer’s
            prior written approval (email sufficing).
          </p>

          <h3>10.10 Amendments; Changes to the Service</h3>
          <h4>10.10.1 Changes to the Agreement</h4>
          <p>
            MagicalCX may update or modify this Agreement from time to time.
            Material changes will be notified to Customer:
          </p>
          <ul>
            <li>by email,</li>
            <li>by notice within the Service, or</li>
            <li>by posting a conspicuous notice on the MagicalCX website,</li>
          </ul>
          <p>
            at least <strong>thirty (30) days</strong> before the changes take
            effect, unless a shorter period is required by law or relates to
            urgent security, legal, or regulatory changes.
          </p>
          <p>
            If Customer does not agree to the updated terms, Customer may
            terminate the Agreement and any affected subscriptions by providing
            written notice to MagicalCX before the effective date of the updated
            terms. Continued use of the Service after the effective date of
            changes shall constitute acceptance of the updated Agreement.
          </p>

          <h4>10.10.2 Changes to the Service</h4>
          <p>MagicalCX may:</p>
          <ul>
            <li>
              modify, improve, or update the Service from time to time,
              including adding or removing features, and
            </li>
            <li>
              discontinue or deprecate certain functionality or legacy versions
              of the Service,
            </li>
          </ul>
          <p>
            provided that such modifications do not materially reduce the core
            functionality of the Service purchased under an active Subscription,
            except where such changes are:
          </p>
          <ul>
            <li>required to comply with law, regulation, or a court order;</li>
            <li>due to security, privacy, or system integrity concerns; or</li>
            <li>
              part of a service or feature that is clearly designated as beta,
              preview, or experimental.
            </li>
          </ul>
          <p>
            MagicalCX will use commercially reasonable efforts to provide
            advance notice of any material change that negatively affects the
            Service’s core features used by Customer.
          </p>

          <h3>10.11 Severability</h3>
          <p>
            If any provision of this Agreement is held by a court or competent
            authority to be invalid, illegal, or unenforceable, that provision
            shall be enforced to the maximum extent permissible, and the
            remaining provisions shall remain in full force and effect.
          </p>
          <p>
            Where necessary to give effect to the parties’ intention, the
            invalid or unenforceable provision shall be replaced by a valid,
            enforceable provision that most closely reflects the original intent
            and economic effect of the provision.
          </p>

          <h3>10.12 No Waiver</h3>
          <p>
            No failure or delay by either party in exercising any right, power,
            or remedy under this Agreement shall constitute a waiver of that
            right, power, or remedy, nor shall any single or partial exercise of
            any such right, power, or remedy preclude any other or further
            exercise of the same or any other right, power, or remedy.
          </p>
          <p>
            Any waiver must be <strong>in writing</strong> and signed (or sent
            from an authorized email address) by an authorized representative of
            the waiving party.
          </p>

          <h3>10.13 Entire Agreement; Order of Precedence</h3>
          <p>
            This Agreement, together with all Orders, any incorporated policies
            (including the Privacy Statement and Data Processing Addendum, if
            applicable), and any other documents expressly referenced as forming
            part of this Agreement, constitutes the{" "}
            <strong>entire agreement</strong> between the parties with respect
            to the subject matter hereof and supersedes all prior and
            contemporaneous agreements, proposals, representations, and
            understandings, whether written or oral, relating to the same
            subject matter.
          </p>
          <p>If there is any conflict or inconsistency between:</p>
          <ol>
            <li>an Order,</li>
            <li>this Agreement, and</li>
            <li>
              any documentation or policy referenced or published by MagicalCX,
            </li>
          </ol>
          <p>
            the following order of precedence shall apply (unless the Order
            expressly states otherwise):
          </p>
          <ol>
            <li>
              The Order (but only with respect to the specific transaction it
              covers),
            </li>
            <li>This Agreement, and</li>
            <li>
              The then‑current documentation and policies referenced in or made
              available through the Service.
            </li>
          </ol>

          <h3>10.14 Third‑Party Beneficiaries</h3>
          <p>
            Except as expressly provided in this Agreement, this Agreement is
            for the sole benefit of the parties and their respective permitted
            successors and assigns, and nothing in this Agreement shall confer
            any rights or remedies upon any other person or entity, including
            any third‑party beneficiaries.
          </p>

          <h3>10.15 Interpretation</h3>
          <p>
            Headings, section titles, and captions in this Agreement are for
            convenience only and shall not affect the interpretation of any
            provision.
          </p>
          <p>Unless the context requires otherwise:</p>
          <ul>
            <li>
              the words “include,” “includes,” and “including” are deemed to be
              followed by the words “without limitation”;
            </li>
            <li>
              references to “days” mean calendar days unless expressly stated
              otherwise; and
            </li>
            <li>
              references to “written” or “in writing” include email, but not
              fax, unless otherwise specified.
            </li>
          </ul>
        </div>
      </main>

      <div className="dark bg-background">
        <Footer />
      </div>
    </div>
  );
}
