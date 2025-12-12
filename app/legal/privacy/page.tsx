"use client";

import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 border-x section-container section-content-padding w-full ">
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
            Privacy Statement
          </h1>

          <p className="italic text-muted-foreground">
            Last updated: December 12, 2025
          </p>

          <h2>Introduction</h2>
          <p>
            MagicalCX is an AI agent platform for sales, customer support, and
            user engagement.
            <br />
            MagicalCX is a product by{" "}
            <strong>Pure Intelligence AI Technologies LLP</strong> (“Pure
            Intelligence”, “we”, “our”, “us”).
          </p>
          <p>
            We understand that you are aware of and care about your own personal
            privacy interests, and we take that seriously. This Privacy
            Statement describes MagicalCX’s policies and practices regarding our
            collection and use of your personal data, and sets forth your
            privacy rights.
          </p>
          <p>
            We recognize that information privacy is an ongoing responsibility,
            and we will update this Privacy Statement from time to time as we
            undertake new personal data practices or adopt new privacy policies.
          </p>
          <p>
            By using MagicalCX, visiting our websites, or otherwise interacting
            with us, you acknowledge that you have read and understood this
            Privacy Statement.
          </p>

          <hr className="my-8 border-border" />

          <h2>Contacting Us About Data Protection</h2>
          <p>
            MagicalCX is a product by{" "}
            <strong>Pure Intelligence AI Technologies LLP</strong>,
            headquartered at:
          </p>
          <blockquote className="not-italic border-l-4 border-primary pl-4 my-4">
            <strong>Pure Intelligence AI Technologies LLP</strong>
            <br />
            MagicalCX
            <br />
            11, Baner Park, Aundh
            <br />
            Pune 411007
            <br />
            India
          </blockquote>
          <p>
            For any inquiries or concerns regarding our personal data policies,
            practices, or if you wish to exercise your privacy rights, please
            contact us. Our team is committed to assisting you with any
            questions you might have and ensuring your data is handled with the
            utmost care and respect.
          </p>
          <p>
            <strong>Privacy Contact Information</strong>
          </p>
          <blockquote className="not-italic border-l-4 border-primary pl-4 my-4">
            Email: <strong>privacy@magicalcx.com</strong>
            <br />
            Address:{" "}
            <strong>
              Pure Intelligence AI Technologies LLP, MagicalCX, 11, Baner Park,
              Aundh, Pune 411007, India
            </strong>
          </blockquote>

          <hr className="my-8 border-border" />

          <h2>How We Collect and Use (Process) Your Personal Information</h2>
          <p>
            MagicalCX (a product by Pure Intelligence AI Technologies LLP)
            collects personal information about its website visitors, users, and
            customers. With a few exceptions, this information is generally
            limited to:
          </p>
          <ul>
            <li>Name</li>
            <li>Job title</li>
            <li>Employer / organization name</li>
            <li>Work address</li>
            <li>Work email</li>
            <li>Work phone number</li>
          </ul>
          <p>We use this information to:</p>
          <ul>
            <li>Provide prospects and customers with our services</li>
            <li>Administer user accounts and access to MagicalCX</li>
            <li>Communicate about product features, updates, and support</li>
            <li>Process payments and manage billing (where applicable)</li>
            <li>
              Send relevant service and marketing communications (where
              permitted by law)
            </li>
          </ul>
          <p>
            We <strong>do not sell</strong> personal information to anyone and
            only share it with third parties who are facilitating the delivery
            of our services as described in this Privacy Statement.
          </p>
          <p>
            From time to time, MagicalCX receives personal information about
            individuals from third parties. Typically, information collected
            from third parties will include further details on your employer or
            industry. We may also collect your personal data from a third‑party
            website (e.g., LinkedIn) or other publicly available sources where
            permitted by law.
          </p>

          <hr className="my-8 border-border" />

          <h2>Use of the MagicalCX Website</h2>
          <p>
            As is true of most other websites, MagicalCX’s websites
            automatically collect certain information and store it in log files.
            This information may include:
          </p>
          <ul>
            <li>Internet protocol (IP) addresses</li>
            <li>
              The region or general location where your computer or device is
              accessing the internet
            </li>
            <li>Browser type and version</li>
            <li>Operating system and platform</li>
          </ul>
        </div>
      </main>

      <div className="bg-background dark">
        <Footer />
      </div>
    </div>
  );
}
