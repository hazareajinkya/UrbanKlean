"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MotionValue, useMotionValueEvent } from "framer-motion";
import { useDemoModal } from "./demo-modal";

export const Navbar = ({
  scrollYProgress,
}: {
  scrollYProgress?: MotionValue<number>;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isInside, setIsInside] = useState(false);

  const { openDemoModal } = useDemoModal();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerWidth * 0.2);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleCloseMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Resources" },
    { href: "/about", label: "About" },
  ];

  if (scrollYProgress) {
    useMotionValueEvent(scrollYProgress, "change", (v) => {
      if (v > 0.477 && v < 0.99) setIsInside(true);
      else setIsInside(false);
    });
  }

  return (
    <>
      <nav
        className={`w-full  bg-background/80 backdrop-blur-md border-b fixed top-0 left-0 z-50 transition-colors duration-300 ${
          isInside && "dark"
        }`}
      >
        <div
          className={`section-container py-2 md:py-3 pr-2 pl-4 md:px-6 lg:px-0  flex items-center justify-between`}
        >
          <Link
            href="/"
            aria-label="Magical CX Home"
            tabIndex={0}
            className="flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={handleCloseMenu}
          >
            {/* <img
              src="/magical-cx-full.svg"
              alt="Magical CX Logo"
              className="h-auto w-24 rounded-md object-contain transition-transform duration-200 group-hover:scale-105 mr-2"
              tabIndex={-1}
              aria-hidden="true"
              loading="lazy"
              draggable={false}
            /> */}
            <span className="font-medium text-base text-primary tracking-tight">
              Magical CX
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-label={link.label}
                tabIndex={0}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-6 ml-0">
              <Link
                href="/auth"
                aria-label="Sign in"
                tabIndex={0}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Sign in
              </Link>
              {/* <Link
                href="/demo"
                aria-label="Book Demo"
                tabIndex={0}
                className="text-sm px-3 py-1.5 rounded-full font-medium bg-foreground text-background hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              >
                Book a demo
              </Link> */}
              <button
                onClick={openDemoModal}
                aria-label="Book Demo"
                tabIndex={0}
                className={`text-sm rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary ${
                  isScrolled
                    ? "px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                    : "px-0 py-1.5 text-foreground hover:bg-muted focus:border-2 focus:border-muted-foreground"
                }`}
              >
                Talk to us
              </button>
              {/* <Link
                href="/demo"
                aria-label="Book Demo"
                tabIndex={0}
                className="text-sm px-0 py-1.5 rounded-full font-medium bg-transparent text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary flex items-center gap-2"
              >
                <span className="sr-only">Book a demo</span>
                Book a demo
              </Link> */}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleMenu}
            className="md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu - Apple Style */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ease-out ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-white/10 backdrop-blur-sm transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleCloseMenu}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-b shadow-lg transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
          style={{ paddingTop: "calc(3rem + 1px)" }}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleCloseMenu}
                  className="py-3 px-4 text-base font-medium text-foreground hover:bg-muted/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/signin"
                onClick={handleCloseMenu}
                className="py-3 px-4 text-base font-medium text-foreground hover:bg-muted/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Sign in
              </Link>
              <button
                onClick={openDemoModal}
                className="mt-2 py-2 px-3 text-sm font-medium text-center rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Book a demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
