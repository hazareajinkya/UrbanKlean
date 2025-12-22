import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { coreConf } from "@/lib/utils/conf";

export const metadata: Metadata = {
  title: "Privacy Policy | MagicalCX",
  description:
    "Privacy Policy for MagicalCX. Learn how we collect, use, store, and protect your personal data when you use our website and services.",
  openGraph: {
    title: "Privacy Policy | MagicalCX",
    description:
      "Privacy Policy for MagicalCX. Learn how we collect, use, store, and protect your personal data when you use our website and services.",
    url: `${coreConf.baseUrl}/legal/privacy`,
  },
  alternates: {
    canonical: `${coreConf.baseUrl}/legal/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 border-x section-container section-content-padding w-full ">
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
            Privacy Policy
          </h1>

          <p>
            This Privacy Policy is designed to help you understand how{" "}
            <strong>
              MagicalCX and / or Pure Intelligence AI Technologies LLP
            </strong>{" "}
            (“<strong>MagicalCX</strong>,” “<strong>we</strong>,” “
            <strong>us</strong>,” or “<strong>our</strong>”) collects, uses, and
            shares your personal information, and to help you understand and
            exercise your privacy rights.
          </p>

          <hr className="my-8 border-border" />

          <h2>1. Scope and Updates to This Privacy Policy</h2>
          <p>
            This Privacy Policy applies to personal information processed by us,
            including on our websites, web applications, mobile applications,
            and other online or offline offerings. To make this Privacy Policy
            easier to read, our websites, web applications, mobile applications,
            and other offerings are collectively called the “
            <strong>Services</strong>
            .”
          </p>

          <h3>Changes to Our Privacy Policy</h3>
          <p>
            We may revise this Privacy Policy from time to time in our sole
            discretion. If there are any material changes to this Privacy
            Policy, we will notify you as required by applicable law (for
            example, by email, in‑product notice, or by updating the “Last
            Updated” date). You understand and agree that you will be deemed to
            have accepted the updated Privacy Policy if you continue to use our
            Services after the new Privacy Policy takes effect.
          </p>

          <h3>An Important Note About Customer Data</h3>
          <p>
            This Privacy Policy does <strong>not</strong> apply to any of the
            personal information that we process on behalf of our customers
            through their use of our Services (“
            <strong>Customer Data</strong>”). Our customers’ respective privacy
            policies govern their collection and use of Customer Data. Our
            processing of Customer Data is governed by the contracts we have in
            place with our customers, not this Privacy Policy. Any questions or
            requests relating to Customer Data should be directed to the
            relevant customer (for example, the business that deployed
            MagicalCX).
          </p>

          <hr className="my-8 border-border" />

          <h2>2. Personal Information We Collect</h2>
          <p>
            The categories of personal information we collect depend on how you
            interact with us, our Services, and the requirements of applicable
            law. We collect information that you provide to us directly,
            information we obtain automatically when you use our Services, and
            information from other sources such as third‑party services and
            organizations, as described below.
          </p>

          <h3>A. Personal Information You Provide to Us Directly</h3>
          <p>
            We may collect personal information that you provide to us,
            including:
          </p>

          <p>
            <strong>Account Information.</strong> We may collect personal
            information in connection with the creation or administration of an
            account, such as your name, email address, phone number, postal
            address, professional details (e.g., company name, title, role), and
            any other information that you provide to us or that we otherwise
            collect in connection with account setup and management.
          </p>

          <p>
            <strong>Purchases.</strong> We may collect personal information and
            details associated with your purchases, including payment
            information. Any payments made via our Services are processed by
            third‑party payment processors. We do not directly collect or store
            full payment card numbers entered through our Services, but we may
            receive information associated with your payment card (e.g., billing
            details, last four digits, payment status).
          </p>

          <p>
            <strong>Your Communications with Us.</strong> We may collect
            personal information, such as your name, email address, phone
            number, or mailing address when you request information about
            MagicalCX or our Services, register for our newsletter, request
            support, or otherwise communicate with us (for example, via chat,
            email, or contact forms).
          </p>

          <p>
            <strong>Surveys.</strong> We may contact you to participate in
            surveys. If you decide to participate, we may collect personal
            information from you in connection with the survey (such as your
            responses, preferences, and feedback).
          </p>

          <p>
            <strong>Interactive Features.</strong> We and other users of our
            Services may collect personal information that you submit or make
            available through interactive features (e.g., commenting
            functionalities, forums, blogs, feedback tools, and social media
            pages). Any information you provide using the public sharing
            features of the Services will be considered “public,” unless
            otherwise required by applicable law, and is not subject to the
            privacy protections set forth in this Privacy Policy.
          </p>

          <p>
            <strong>Sweepstakes or Contests.</strong> We may collect personal
            information you provide for any sweepstakes, promotions, or contests
            that we may offer. In some jurisdictions, we may be required to
            publicly share information regarding winners.
          </p>

          <p>
            <strong>Conferences, Trade Shows, and Other Events.</strong> We may
            collect personal information from individuals when we attend,
            sponsor, or host conferences, trade shows, webinars, and other
            events (for example, if you share your business card, scan a QR
            code, or register for an event with us).
          </p>

          <p>
            <strong>Business Development and Strategic Partnerships.</strong> We
            may collect personal information from individuals and third parties
            to assess and pursue potential business opportunities, partnerships,
            or integrations.
          </p>

          <p>
            <strong>Job Applications.</strong> We may post job openings and
            opportunities on our Services. If you respond to one of these
            postings, we may collect your personal information, such as your
            application, CV, cover letter, LinkedIn profile, and any other
            information you choose to provide to us.
          </p>

          <h3>B. Personal Information Collected Automatically</h3>
          <p>
            We may collect certain personal information automatically when you
            use our Services.
          </p>

          <p>
            <strong>Automatic Collection of Personal Information.</strong> We
            may automatically collect information such as:
          </p>
          <ul>
            <li>Internet protocol (IP) address</li>
            <li>User settings and preferences</li>
            <li>
              Device identifiers (e.g., MAC address, cookie identifiers, mobile
              advertising identifiers)
            </li>
            <li>
              Browser or device information (e.g., type, version, operating
              system)
            </li>
            <li>
              Location information (including approximate location derived from
              IP address)
            </li>
            <li>Internet service provider</li>
            <li>
              Log data regarding your use of our Services, such as:
              <ul className="list-[circle] pl-5 mt-2">
                <li>
                  Pages or screens you visit before, during, and after using our
                  Services
                </li>
                <li>Features you use and actions you take</li>
                <li>Items searched for via the Services</li>
                <li>Links you click and content you interact with</li>
                <li>Frequency, timing, and duration of your activities</li>
              </ul>
            </li>
          </ul>

          <p>
            <strong>Cookie Policy (and Other Technologies).</strong> We, as well
            as third parties that provide content, advertising, or other
            functionality on our Services, may use cookies, pixel tags, and
            other technologies (“<strong>Technologies</strong>”) to
            automatically collect information through your use of our Services.
          </p>
          <ul>
            <li>
              <strong>Cookies.</strong> Cookies are small text files placed in
              device browsers that store preferences and facilitate and enhance
              your experience.
            </li>
            <li>
              <strong>Pixel Tags / Web Beacons.</strong> A pixel tag (also known
              as a web beacon or clear GIF) is a piece of code embedded in our
              Services or emails that collects information about engagement (for
              example, whether a page has been visited or an email has been
              opened).
            </li>
          </ul>

          <p>
            <strong>Analytics.</strong> We may use Technologies and other
            third‑party tools to process analytics information on our Services.
            These tools help us better understand how our digital Services are
            used and to continually improve and personalize our Services. Some
            of our analytics providers include:
          </p>
          <ul>
            <li>
              <strong>Google Analytics.</strong> For more information about how
              Google uses your personal information, please visit “How Google
              uses information from sites or apps that use our services.” To
              learn more about how to opt out of Google Analytics’ use of your
              information, please visit the Google Analytics opt‑out page.
            </li>
          </ul>

          <p>
            See <strong>“Your Privacy Choices and Rights”</strong> below to
            understand your choices regarding these Technologies.
          </p>

          <h3>C. Personal Information Collected from Other Sources</h3>
          <p>
            We may collect personal information from other sources, including:
          </p>

          <p>
            <strong>Third‑Party Services and Sources.</strong> We may obtain
            personal information about you from third‑party services and
            organizations. For example, if you access our Services through a
            third‑party application (such as a single sign‑on provider or a CRM
            integration), we may collect personal information that you have made
            available via your privacy settings with that third‑party
            application.
          </p>

          <p>
            <strong>Referrals and Sharing Features.</strong> Our Services may
            offer various tools and functionalities that allow you to provide
            personal information about others through a referral or sharing
            feature. For example, you may be able to invite a colleague to use
            our Services. Please only share with us personal information of
            people with whom you have a relationship (e.g., relative, friend, or
            co‑worker) and only where you have their permission to do so, as
            required by applicable law.
          </p>

          <hr className="my-8 border-border" />

          <h2>3. How We Use Your Personal Information</h2>
          <p>
            We use your personal information for a variety of business purposes,
            including to provide our Services, for administrative purposes, and
            to market our products and Services, as described below.
          </p>

          <h3>A. Provide Our Services</h3>
          <p>
            We use your personal information to fulfill our contract with you
            and provide you with our Services, such as:
          </p>
          <ul>
            <li>Managing your information and accounts;</li>
            <li>
              Providing access to certain areas, functionalities, and features
              of our Services;
            </li>
            <li>Answering requests for customer or technical support;</li>
            <li>
              Communicating with you about your account, activities on our
              Services, and changes to our terms, policies, or features;
            </li>
            <li>
              Processing your financial information and other payment methods
              for products or Services purchased;
            </li>
            <li>
              Processing applications if you apply for a job we post on our
              Services; and
            </li>
            <li>
              Allowing you to register for and participate in events (e.g.,
              webinars, demos, conferences).
            </li>
          </ul>

          <h3>B. Administrative Purposes</h3>
          <p>
            We use your personal information for various administrative
            purposes, such as:
          </p>
          <ul>
            <li>
              Pursuing our legitimate interests, such as direct marketing,
              research and development (including marketing research), product
              development, network and information security, and fraud
              prevention;
            </li>
            <li>
              Detecting security incidents, protecting against malicious,
              deceptive, fraudulent, or illegal activity, and prosecuting those
              responsible for such activity;
            </li>
            <li>Measuring interest in and engagement with our Services;</li>
            <li>Improving, upgrading, or enhancing our Services;</li>
            <li>Developing new products and services;</li>
            <li>Ensuring internal quality control and safety;</li>
            <li>
              Authenticating and verifying individual identities, including
              requests to exercise your rights under this Privacy Policy;
            </li>
            <li>Debugging to identify and repair errors with our Services;</li>
            <li>
              Auditing relating to interactions, transactions, and other
              compliance activities;
            </li>
            <li>
              Sharing personal information with third parties as needed to
              provide the Services;
            </li>
            <li>Enforcing our agreements and policies; and</li>
            <li>
              Carrying out activities required to comply with our legal
              obligations.
            </li>
          </ul>

          <h3>C. Marketing and Advertising Our Products and Services</h3>
          <p>
            We may use personalization information to tailor and provide you
            with content and advertisements, as permitted by applicable law.
            Some of the ways we may market to you include:
          </p>
          <ul>
            <li>Email campaigns;</li>
            <li>
              Text messages (where permitted by law and subject to your consent
              where required);
            </li>
            <li>Custom audience advertising; and</li>
            <li>
              “Personalized,” “interest‑based,” or “targeted” advertising,
              including through cross‑device tracking.
            </li>
          </ul>
          <p>
            If you have any questions about our marketing practices, you may
            contact us at any time as set forth in <strong>“Contact Us”</strong>{" "}
            below.
          </p>

          <h3>D. With Your Consent</h3>
          <p>
            We may use personal information for other purposes that are clearly
            disclosed to you at the time you provide personal information or
            with your consent.
          </p>

          <h3>E. Other Purposes</h3>
          <p>
            We also use your personal information for other purposes as
            requested by you or as permitted by applicable law, including:
          </p>
          <p>
            <strong>De‑identified and Aggregated Information.</strong> We may
            use personal information to create de‑identified and/or aggregated
            information, such as demographic information, information about how
            you use the Services, information about the device from which you
            access our Services, or other analyses we create. De‑identified
            and/or aggregated information is not personal information, and we
            may use, disclose, and retain such information as permitted by
            applicable laws, including for research, analysis, analytics,
            benchmarking, and any other legally permissible purposes.
          </p>

          <hr className="my-8 border-border" />

          <h2>4. How We Disclose Your Personal Information</h2>
          <p>
            We disclose your personal information to third parties for a variety
            of business purposes, including to provide our Services, to protect
            us or others, or in the event of a major business transaction such
            as a merger, sale, or asset transfer, as described below.
          </p>

          <h3>A. Disclosures to Provide Our Services</h3>
          <p>
            The categories of third parties with whom we may share your personal
            information include:
          </p>

          <p>
            <strong>Service Providers.</strong> We may share your personal
            information with third‑party service providers and vendors that
            assist us with the provision, security, operation, and improvement
            of our Services. This includes service providers that provide us
            with IT support, hosting, payment processing, customer service,
            analytics, email delivery, marketing support, and other related
            services.
          </p>

          <p>
            <strong>Third‑Party Services You Share or Interact With.</strong>{" "}
            Certain features and functionalities of the Services may link to,
            integrate with, or allow you to interface with, interact with, share
            information with, direct us to share information with, access,
            and/or use third‑party websites, services, products, and technology
            (collectively, “<strong>Third‑Party Services</strong>”). Any
            information shared with or otherwise collected by a Third‑Party
            Service is subject to that Third‑Party Service’s own privacy policy
            and terms. We are not responsible for the processing of personal
            information by Third‑Party Services.
          </p>

          <p>
            <strong>Business Partners.</strong> We may share your personal
            information with business partners to provide you with a product or
            service you have requested. We may also share your personal
            information with business partners with whom we jointly offer
            products or services or engage in co‑marketing activities.
          </p>

          <p>
            <strong>Affiliates.</strong> We may share your personal information
            with our corporate affiliates (for example, subsidiaries, joint
            ventures, or other companies under common control with MagicalCX and
            / or Pure Intelligence AI Technologies LLP), in which case we will
            require such affiliates to honor this Privacy Policy.
          </p>

          <p>
            <strong>Advertising Partners.</strong> We may share your personal
            information with third‑party advertising partners. These partners
            may set Technologies and other tracking tools on our Services to
            collect information about your activities and your device (e.g.,
            your IP address, cookie identifiers, pages visited, location, time
            of day). These advertising partners may use this information (and
            similar information collected from other services) to deliver
            personalized, interest‑based, or targeted advertisements to you when
            you visit digital properties within their networks.
          </p>

          <h3>B. Disclosures to Protect Us or Others</h3>
          <p>
            We may access, preserve, and disclose any information we store
            associated with you to external parties if we, in good faith,
            believe doing so is required or appropriate to:
          </p>
          <ul>
            <li>
              Comply with applicable laws or regulations, law enforcement
              requests, or national security requirements, and legal processes
              such as a court order or subpoena;
            </li>
            <li>Protect your, our, or others’ rights, property, or safety;</li>
            <li>Enforce our policies or contracts;</li>
            <li>Collect amounts owed to us; or</li>
            <li>
              Assist with an investigation or prosecution of suspected or actual
              illegal activity.
            </li>
          </ul>

          <h3>
            C. Disclosure in the Event of Merger, Sale, or Other Asset Transfers
          </h3>
          <p>
            If we are involved in a merger, acquisition, financing due
            diligence, reorganization, bankruptcy, receivership, sale of company
            assets, or transition of service to another provider, your personal
            information may be transferred as part of such a transaction as
            permitted by law and/or contract. We will use reasonable efforts to
            require the recipient to honor this Privacy Policy or follow
            substantially similar privacy protections.
          </p>

          <hr className="my-8 border-border" />

          <h2>5. Your Privacy Choices and Rights</h2>

          <h3>Your Privacy Choices</h3>
          <p>
            The privacy choices you may have about your personal information are
            determined by applicable law and are described below.
          </p>

          <p>
            <strong>Email Communications.</strong> If you receive an unwanted
            marketing email from us, you can use the unsubscribe link found at
            the bottom of the email to opt out of receiving future marketing
            emails. Note that you will continue to receive transactional and
            service‑related emails regarding products or Services you have
            requested (e.g., account notifications, security alerts). We may
            also send you certain non‑promotional communications regarding us
            and our Services that you cannot opt out of (e.g., important updates
            to our Terms or this Privacy Policy).
          </p>

          <p>
            <strong>Text Messages.</strong> If you receive an unwanted text
            message from us, you may opt out of receiving future text messages
            from us by following the instructions in the text message you
            received or by contacting us as set forth in{" "}
            <strong>“Contact Us”</strong> below.
          </p>

          <p>
            <strong>Mobile Devices.</strong> We may send you push notifications
            through our mobile applications. You may opt out from receiving
            these push notifications by changing the settings on your mobile
            device. With your consent, we may also collect precise
            location‑based information via our mobile applications; you may opt
            out of this collection by changing the location settings on your
            device.
          </p>

          <p>
            <strong>Phone Calls.</strong> If you receive an unwanted marketing
            phone call from us, you may opt out of receiving future marketing
            calls by following any instructions provided on the call or by
            contacting us as set forth in <strong>“Contact Us”</strong> below.
          </p>

          <p>
            <strong>“Do Not Track.”</strong> Do Not Track (“DNT”) is a privacy
            preference that users can set in some web browsers. Please note that
            we do not respond to or honor DNT signals or similar mechanisms
            transmitted by web browsers at this time.
          </p>

          <p>
            <strong>Cookies and Personalized Advertising.</strong> You may stop
            or restrict the placement of Technologies on your device or remove
            them by adjusting your browser or device settings. However, if you
            adjust your preferences, our Services may not function properly or
            some features may be unavailable.
          </p>

          <p>
            Please note that cookie‑based opt‑outs are generally not effective
            on mobile applications. However, you may opt out of personalized
            advertising on some mobile applications by following the
            instructions for Android, iOS, or other platforms, as applicable.
          </p>

          <p>
            The online advertising industry also provides websites from which
            you may opt out of receiving targeted ads from participating data
            partners and other advertising partners. You can learn more about
            such tools and your choices by visiting, for example:
          </p>
          <ul>
            <li>Network Advertising Initiative</li>
            <li>Digital Advertising Alliance</li>
            <li>European Digital Advertising Alliance</li>
            <li>Digital Advertising Alliance of Canada</li>
          </ul>
          <p>
            Please note you must separately opt out in each browser and on each
            device.
          </p>

          <h3>Your Privacy Rights</h3>
          <p>
            Depending on your location and subject to applicable law, you may
            have some or all of the following rights:
          </p>
          <ul>
            <li>
              <strong>
                Request Access to and Portability of Your Personal Information,
              </strong>{" "}
              including:
              <ul className="list-[circle] pl-5 mt-2">
                <li>
                  obtaining access to or a copy of your personal information;
                  and
                </li>
                <li>
                  receiving an electronic copy of personal information that you
                  have provided to us, or asking us to send that information to
                  another company in a structured, commonly used, and
                  machine‑readable format (also known as the “right of data
                  portability”);
                </li>
              </ul>
            </li>
            <li>
              <strong>Request Correction</strong> of your personal information
              where it is inaccurate or incomplete. In some cases, we may
              provide self‑service tools that enable you to update your personal
              information directly;
            </li>
            <li>
              <strong>Request Deletion</strong> of your personal information;
            </li>
            <li>
              <strong>
                Request to Opt Out of Certain Processing Activities
              </strong>
              , including, as applicable, if we process your personal
              information for “targeted advertising,” if we “sell” your personal
              information, or if we engage in “profiling” in furtherance of
              decisions that produce legal or similarly significant effects
              concerning you, in each case as such terms are defined by
              applicable privacy laws;
            </li>
            <li>
              <strong>Request Restriction of or Object to</strong> our
              processing of your personal information, in certain circumstances;
            </li>
            <li>
              <strong>Appeal Our Decision</strong> to decline to process your
              request, where such appeal rights are provided by applicable law;
              and
            </li>
            <li>
              <strong>Withdraw Your Consent</strong> to our processing of your
              personal information, where our processing is based on your
              consent. Please note that your withdrawal will only take effect
              for future processing and will not affect the lawfulness of
              processing before the withdrawal.
            </li>
          </ul>

          <p>
            If you would like to exercise any of these rights, please contact us
            as set forth in <strong>“Contact Us”</strong> below. We will process
            such requests in accordance with applicable laws, including
            verifying your identity where required.
          </p>

          <p>
            If your personal information is subject to the applicable data
            protection laws of the European Economic Area, Switzerland, or the
            United Kingdom, you also have the right to lodge a complaint with
            the competent supervisory authority if you believe our processing of
            your personal information violates applicable law, such as:
          </p>
          <ul>
            <li>European Economic Area Data Protection Authorities (DPAs)</li>
            <li>
              Swiss Federal Data Protection and Information Commissioner (FDPIC)
            </li>
            <li>UK Information Commissioner’s Office (ICO)</li>
          </ul>

          <hr className="my-8 border-border" />

          <h2>6. International Transfers of Personal Information</h2>
          <p>
            All personal information processed by us may be transferred,
            processed, and stored anywhere in the world, including, but not
            limited to, the United States, India, or other countries, which may
            have data protection laws that are different from the laws where you
            reside.
          </p>
          <p>
            Where required by applicable law, we implement appropriate
            safeguards to protect personal information when it is transferred
            internationally. For example, if we transfer personal information
            that originates in the European Economic Area, Switzerland, or the
            United Kingdom to a country that has not been found to provide an
            adequate level of protection under applicable data protection laws,
            we may rely on safeguards such as the{" "}
            <strong>EU Standard Contractual Clauses</strong> or equivalent
            mechanisms.
          </p>
          <p>
            For more information about the safeguards we use for international
            transfers of your personal information, please contact us as set
            forth in <strong>“Contact Us”</strong> below.
          </p>

          <hr className="my-8 border-border" />

          <h2>7. Retention of Personal Information</h2>
          <p>
            We retain the personal information we collect as described in this
            Privacy Policy for as long as:
          </p>
          <ul>
            <li>you use our Services; or</li>
            <li>
              as necessary to fulfill the purpose(s) for which it was collected;
            </li>
            <li>to provide our Services;</li>
            <li>to resolve disputes;</li>
            <li>to establish or defend legal claims;</li>
            <li>to conduct audits;</li>
            <li>to pursue legitimate business purposes;</li>
            <li>to enforce our agreements; and</li>
            <li>to comply with applicable laws.</li>
          </ul>
          <p>
            To determine the appropriate retention period for personal
            information, we may consider:
          </p>
          <ul>
            <li>applicable legal requirements;</li>
            <li>
              the amount, nature, and sensitivity of the personal information;
            </li>
            <li>
              the potential risk of harm from unauthorized use or disclosure;
            </li>
            <li>
              the purposes for which we process your personal information; and
            </li>
            <li>whether we can achieve those purposes through other means.</li>
          </ul>

          <hr className="my-8 border-border" />

          <h2>8. Supplemental Notice for Nevada Residents</h2>
          <p>
            If you are a resident of Nevada, you have the right to opt out of
            the sale of certain personal information to third parties who intend
            to license or sell that personal information. Please note that we do
            not currently “sell” your personal information as “sale” is defined
            in Nevada Revised Statutes Chapter 603A. If you have any questions,
            please contact us as set forth in <strong>“Contact Us”</strong>{" "}
            below.
          </p>

          <hr className="my-8 border-border" />

          <h2>9. Our Lawful Basis for Processing</h2>
          <p>
            If your personal information is subject to the EU or UK General Data
            Protection Regulation, our processing of your personal information
            is supported by the following lawful bases, as applicable:
          </p>
          <ul>
            <li>
              <strong>Performance of a Contract.</strong> MagicalCX may need to
              process your personal information to perform our contract with you
              or take steps at your request prior to entering into a contract
              (for example, to provide you with our Services).
            </li>
            <li>
              <strong>Legitimate Interest.</strong> MagicalCX may process your
              personal information to further its legitimate interests (for
              example, to secure our Services, improve and develop new features,
              and market our Services), but only where our interests are not
              overridden by your interests or fundamental rights and freedoms.
            </li>
            <li>
              <strong>Compliance with Legal Obligations.</strong> MagicalCX may
              process your personal information to comply with our legal
              obligations (for example, tax, accounting, and regulatory
              requirements).
            </li>
            <li>
              <strong>Consent.</strong> In some cases, MagicalCX may also rely
              on your consent to process your personal information (for example,
              for certain types of marketing). When we rely on your consent, you
              may withdraw it at any time as described in this Privacy Policy.
            </li>
          </ul>

          <hr className="my-8 border-border" />

          <h2>10. Children’s Information</h2>
          <p>
            The Services are not directed to children under the age of 18 (or
            other age as required by local law), and we do not knowingly collect
            personal information from children.
          </p>
          <p>
            If you are a parent or guardian and believe your child has provided
            us with personal information without your consent, you may contact
            us as described in <strong>“Contact Us”</strong> below. If we become
            aware that a child has provided us with personal information in
            violation of applicable law, we will delete such personal
            information (unless we have a legal obligation to retain it) and, if
            applicable, terminate the child’s account.
          </p>

          <hr className="my-8 border-border" />

          <h2>11. Other Provisions</h2>
          <p>
            <strong>Third‑Party Websites / Applications.</strong> The Services
            may contain links to other websites or applications, and other
            websites or applications may reference or link to our Services.
            These third‑party services are not controlled by us. We encourage
            you to read the privacy policies of each website and application
            with which you interact. We do not endorse, screen, or approve, and
            are not responsible for, the privacy practices or content of such
            other websites or applications. Providing personal information to
            third‑party websites or applications is at your own risk.
          </p>

          <hr className="my-8 border-border" />

          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about our privacy practices or this
            Privacy Policy, or if you would like to exercise your rights as
            detailed in this Privacy Policy, please contact us at:
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a
              href="mailto:support@magicalcx.com"
              className="text-primary hover:underline"
            >
              support@magicalcx.com
            </a>
          </p>
        </div>
      </main>

      <div className="bg-background dark">
        <Footer />
      </div>
    </div>
  );
}
