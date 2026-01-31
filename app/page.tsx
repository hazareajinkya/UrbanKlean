import Script from "next/script";
import { coreConf } from "@/lib/utils/conf";
import { faqSchemaItems } from "@/lib/data/faq-schema-items";
import { HomepageClientWrapper } from "@/components/landing/homepage-client-wrapper";

export default function LandingPage() {
  const baseUrl = coreConf.baseUrl || "";

  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "MagicalCX",
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        sameAs: [
          "https://x.com/MagicalCX_",
          "https://www.linkedin.com/company/magicalcx",
          "https://www.facebook.com/profile.php?id=61583111064272",
          "https://www.instagram.com/themagicalcx/",
          "https://www.youtube.com/@MagicalCX",
        ],
      },
      {
        "@type": "WebSite",
        name: "MagicalCX",
        url: baseUrl,
      },
      {
        "@type": "SoftwareApplication",
        name: "MagicalCX",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description:
          "Empathy-first AI customer experience platform that automates support and drives revenue.",
        url: baseUrl,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSchemaItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="bg-background min-h-screen">
      <Script
        id="home-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaGraph),
        }}
      />
      <Script
        id="home-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <HomepageClientWrapper />
    </div>
  );
}
