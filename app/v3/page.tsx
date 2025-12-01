"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const maxWidth = "max-w-7xl";
export default function V3LandingPage() {
  return (
    <div>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}

const HeroSection = () => {
  return (
    <div
      className="min-h-screen grid place-items-center w-full px-4 py-24 gap-10"
      style={{
        background:
          "linear-gradient(to bottom, #005FCC,#CCE4FF, #E6F2FF, #F5F4F2)",
        // "linear-gradient(to bottom,  #E6F2FF, #F5F4F2)",
        //   "linear-gradient(to bottom,  #e6f2ff, #f5f4f2, #ffffff)",
      }}
    >
      <div className="absolute inset-0 w-full h-full -z-10">
        <img
          src="https://cdn.prod.website-files.com/689101ae9004544b003316c9/68a08aabc0129e3519802ed1_BG%20image.png"
          alt="Magical CX Logo"
          className="w-full h-full object-cover rounded-md"
          tabIndex={0}
          aria-label="Background image: Magical CX Logo"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col items-center  text-center mt-18 z-10">
        <h1 className="text-4xl mb-4 leading-tight bg-gradient-to-b from-[#e6f2ff] to-[#f5f4f2] bg-clip-text text-transparent transition-all duration-500">
          {/* Customer experience that actually feels human. */}
          {/* Support that feels human, helpful, and surprisingly simple. */}
          {/* Handle 10x more support without hiring 10x more people.{" "} */}
          {/* Reduce support costs without reducing support quality. */}
          Enterprise-grade support with consistency you can{" "}
          <span className="font-bodoni-moda italic">trust</span>.
          {/* Support that earns trust, reduces tickets, and increases revenue. */}
          {/* The modern infrastructure for customer conversation management. */}
        </h1>
        <p className="text-lg text-[#f5f4f2] max-w-2xl mx-auto ">
          Resolve customer questions instantly, reduce support volume by 73%,
          and turn conversations into sales — without extra staff or tools.
        </p>

        <div className="flex justify-center w-full mt-8 z-10">
          <Button
            asChild
            size="lg"
            className="px-8 py-2 text-base font-medium rounded-full hover:bg-white/80 transition-transform duration-200 hover:-translate-y-1 focus:ring-2 focus:ring-primary"
            style={{
              background: "linear-gradient(to bottom,#007aff, #32ADE6)",
              //   color: "#007aff",
            }}
          >
            <Link
              href="https://calendly.com/echorift-ai"
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={0}
              aria-label="Book a Demo"
              className="rounded-full"
            >
              Book a Demo
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid place-items-center w-full animate-fade-in z-10">
        <img
          // src="https://res.cloudinary.com/djmkshevy/image/upload/v1764321802/image_kp2ls8.jpg"
          src="https://res.cloudinary.com/djmkshevy/image/upload/v1764332398/WhatsApp_Image_2025-11-27_at_1.08.15_PM_hyxoid.jpg"
          alt="Customer support dashboard preview"
          className="rounded-md w-full max-w-7xl h-auto mb-8 transition-all duration-300 mx-auto"
          loading="lazy"
        />
      </div>
    </div>
  );
};
const Header = () => {
  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-transparent">
      <div
        className={`${maxWidth} mx-auto flex items-center justify-between px-0 py-3`}
      >
        <Link
          href="/"
          aria-label="Magical CX Home"
          tabIndex={0}
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <span className="text-white text-base tracking-tight">
            Magical CX
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="#features"
            aria-label="Features"
            tabIndex={0}
            className="text-white hover:text-white/80 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Features
          </Link>
          <Link
            href="#integration"
            aria-label="Integration"
            tabIndex={0}
            className="text-white hover:text-white/80 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Integration
          </Link>
          <Link
            href="#pricing"
            aria-label="Pricing"
            tabIndex={0}
            className="text-white hover:text-white/80 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Pricing
          </Link>
          <Link
            href="#resources"
            aria-label="Resources"
            tabIndex={0}
            className="text-white hover:text-white/80 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Resources
          </Link>
          <Link
            href="/demo"
            aria-label="Book Demo"
            tabIndex={0}
            className="ml-1 text-sm px-3 py-1 rounded-full font-medium bg-primary text-primary-foreground hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            Book a demo
          </Link>
        </div>
      </div>
    </nav>
  );
};

// const Hero2Section = () => {
//   return (
//     <div
//       className="min-h-screen grid place-items-center w-full px-4 py-24 gap-10"
//       style={{
//         background:
//           "linear-gradient(to bottom, #005FCC, #CCE4FF, #E6F2FF, #F5F4F2)",
//         // "linear-gradient(to bottom,  #E6F2FF, #F5F4F2)",
//         //   "linear-gradient(to bottom,  #e6f2ff, #f5f4f2, #ffffff)",
//       }}
//     >
//       <div className="flex flex-col items-start text-left mt-18 w-full max-w-6xl mx-auto">
//         <h1 className="text-5xl leading-tight mb-4 font-medium bg-gradient-to-br from-[#ffffff] via-[#e6f2ff] to-[#cce4ff] bg-clip-text text-transparent transition-all duration-500">
//           {/* Support that feels human, helpful, and surprisingly simple. */}
//           Customer support that actually feels human.
//         </h1>
//         <p className="text-lg text-black/80 mb-0 max-w-2xl">
//           Resolve customer questions instantly, reduce support volume by 73%,
//           and turn conversations into sales — without extra staff or tools.
//         </p>

//         <div className="flex w-full mt-8">
//           <Button
//             asChild
//             size="lg"
//             className="px-8 py-2 text-base font-semibold rounded-full hover:bg-white/80 transition-transform duration-200 hover:-translate-y-1 focus:ring-2 focus:ring-primary"
//           >
//             <Link
//               href="https://calendly.com/echorift-ai"
//               target="_blank"
//               rel="noopener noreferrer"
//               tabIndex={0}
//               aria-label="Book a Demo"
//               className="rounded-full"
//             >
//               Book a Demo
//             </Link>
//           </Button>
//         </div>
//       </div>
//       <div className="grid place-items-center w-full animate-fade-in">
//         <img
//           // src="https://res.cloudinary.com/djmkshevy/image/upload/v1764321802/image_kp2ls8.jpg"
//           src="https://res.cloudinary.com/djmkshevy/image/upload/v1764332398/WhatsApp_Image_2025-11-27_at_1.08.15_PM_hyxoid.jpg"
//           alt="Customer support dashboard preview"
//           className="rounded-md border border-muted w-full max-w-6xl h-auto mb-8 transition-all duration-300 mx-auto"
//           loading="lazy"
//         />
//       </div>
//     </div>
//   );
// };

const FeaturesSection = () => {
  const [selectedFeature, setSelectedFeature] = useState(1);

  const features = [
    {
      title: "Build & deploy your agent",
      description: "",
    },
    {
      title: "Agent solves your customers' problems",
      description:
        "The agent will answer questions and access external systems to gather data and take actions.",
    },
    {
      title: "Monitor performance",
      description: "",
    },
    {
      title: "Scale effortlessly",
      description: "",
    },
    {
      title: "Integrate seamlessly",
      description: "",
    },
  ];

  const chatMessages = [
    {
      text: "Can I add someone else to my team?",
      sender: "user",
      avatar: "👤",
    },
    {
      text: "Yes, you can! Your current plan allows for up to 5 people from your team. Would you like to add anyone?",
      sender: "agent",
      avatar: "🤖",
    },
  ];

  const handleFeatureClick = (index: number) => {
    setSelectedFeature(index);
  };

  const formatNumber = (num: number) => {
    return String(num).padStart(2, "0");
  };

  return (
    <section className="w-full bg-gray-50 py-24 px-4" id="features">
      <div className={`${maxWidth} mx-auto`}>
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="flex-1 space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => handleFeatureClick(index)}
                className={`relative cursor-pointer transition-all rounded-lg p-4 ${
                  index === selectedFeature
                    ? "bg-white shadow-sm"
                    : "hover:bg-white/30"
                }`}
                tabIndex={0}
                role="button"
                aria-label={`Select ${feature.title}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleFeatureClick(index);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`text-sm ${
                      index === selectedFeature
                        ? "text-orange-500"
                        : "text-gray-400"
                    }`}
                  >
                    {formatNumber(index + 1)}.
                  </span>
                  <div className="flex-1">
                    <h3
                      className={`text-base mb-1 ${
                        index === selectedFeature
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {feature.title}
                    </h3>
                    {feature.description && index === selectedFeature && (
                      <p className="text-sm text-gray-600 leading-relaxed mt-1">
                        {feature.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 w-full">
            <div className="bg-white rounded-lg p-6 shadow-sm min-h-[400px] flex flex-col">
              <div className="space-y-4 mb-6 flex-1">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.sender === "agent" && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs">{message.avatar}</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-3 ${
                        message.sender === "user"
                          ? "bg-white border border-gray-200 text-gray-900"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                    {message.sender === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs">{message.avatar}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-center pt-4">
                <button
                  className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
                  aria-label="Pause"
                  tabIndex={0}
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer
      className="w-full text-white"
      style={{
        background: "linear-gradient(to bottom, #003F88, #007aff )",
      }}
    >
      {/* Middle Navigation Section */}
      <div
        className={`${maxWidth} mx-auto px-4 py-16 border-b border-purple-300/20`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <img
                src="/logo-transparent.png"
                alt="Magical CX Logo"
                className="w-12 h-12 object-contain rounded-md"
              />
            </div>
            <span className="text-lg">Magical CX</span>
            <p className="text-sm text-white/70">
              A better customer experience, for every customer.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Overview
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Link href="#" className="hover:text-white transition-colors">
                  Solutions
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Releases
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  News
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Media kit
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Newsletter
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Help centre
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Cookies
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Licenses
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Settings
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div
        className={`${maxWidth} mx-auto px-4 py-6 flex items-center justify-between flex-wrap gap-4`}
      >
        <p className="text-sm text-white/70">
          © {new Date().getFullYear()} Magical CX. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          {/* X/Twitter Icon */}
          <Link
            href="#"
            aria-label="Twitter"
            className="text-white hover:text-white/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </Link>
          {/* LinkedIn Icon */}
          <Link
            href="#"
            aria-label="LinkedIn"
            className="text-white hover:text-white/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </Link>
          {/* Facebook Icon */}
          <Link
            href="#"
            aria-label="Facebook"
            className="text-white hover:text-white/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </Link>
          {/* Instagram Icon */}
          <Link
            href="#"
            aria-label="Instagram"
            className="text-white hover:text-white/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </Link>
          {/* YouTube Icon */}
          <Link
            href="#"
            aria-label="YouTube"
            className="text-white hover:text-white/80 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
};
