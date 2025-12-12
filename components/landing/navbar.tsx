"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MotionValue,
  useMotionValueEvent,
  AnimatePresence,
  motion,
  Variants,
} from "framer-motion";
import { useDemoModal } from "./demo-modal";

export const Navbar = ({
  whyRefProgress,
  ctaRefProgress,
}: {
  whyRefProgress?: MotionValue<number>;
  ctaRefProgress?: MotionValue<number>;
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
    { href: "/#features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/blog", label: "Resources" },
    { href: "/about", label: "About" },
  ];

  if (whyRefProgress && ctaRefProgress) {
    useMotionValueEvent(whyRefProgress, "change", (v) => {
      if (v > 0 && v < 0.99) setIsInside(true);
      else setIsInside(false);
    });
    useMotionValueEvent(ctaRefProgress, "change", (v) => {
      if (v > 0 && v < 0.99) setIsInside(true);
      else setIsInside(false);
    });
  }

  const menuVariants: Variants = {
    initial: {
      y: "-100%",
    },
    animate: {
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.19, 1, 0.22, 1],
      },
    },
    exit: {
      y: "-100%",
      transition: {
        duration: 0.5,
        ease: [0.19, 1, 0.22, 1],
      },
    },
  };

  const itemVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 + i * 0.05,
        duration: 0.5,
        ease: [0.19, 1, 0.22, 1],
      },
    }),
    exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
  };

  const buttonVariants: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.3,
        duration: 0.5,
        ease: [0.19, 1, 0.22, 1],
      },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav
        className={`w-full bg-background/80 backdrop-blur-md border-b fixed top-0 left-0 z-50 transition-colors duration-300 ${
          isInside && "dark"
        }`}
      >
        <div
          className={`section-container py-3 px-4 md:px-6 lg:px-0 flex items-center justify-between`}
        >
          <Link
            href="/"
            aria-label="Magical CX Home"
            tabIndex={0}
            className="flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary z-50"
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
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleMenu}
            className="md:hidden z-50 relative"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="size-5" aria-hidden="true" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu
                    className={`${
                      isInside ? "text-primary" : "text-foreground"
                    }`}
                    aria-hidden="true"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </nav>

      {/* Mobile Menu - Apple Style */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 top-0 z-40 bg-background/98 backdrop-blur-3xl md:hidden flex flex-col pt-24"
          >
            <div className="flex flex-col px-8 gap-6 w-full max-w-lg mx-auto h-full overflow-y-auto pb-10">
              {navLinks.map((link, i) => (
                <motion.div key={link.href} custom={i} variants={itemVariants}>
                  <Link
                    href={link.href}
                    onClick={handleCloseMenu}
                    className="block py-2 text-3xl font-medium tracking-tight text-foreground hover:text-black/70 transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div custom={navLinks.length} variants={itemVariants}>
                <Link
                  href="/auth"
                  onClick={handleCloseMenu}
                  className="block py-2 text-3xl font-medium tracking-tight text-foreground hover:text-black/70 transition-colors"
                >
                  Sign in
                </Link>
              </motion.div>

              <motion.div variants={buttonVariants} className="mt-8">
                <button
                  onClick={() => {
                    handleCloseMenu();
                    openDemoModal();
                  }}
                  className="w-full py-4 rounded-full bg-black text-white font-medium text-xl hover:bg-black/90 active:scale-[0.98] transition-all shadow-lg"
                >
                  Book a demo
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
