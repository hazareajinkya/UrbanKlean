"use client";

import Image from "next/image";
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
import { coreConf } from "@/lib/utils/conf";
import { useCurrentUser } from "@/lib/hooks/user/use-user";

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

  const { user } = useCurrentUser();

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
    { href: "/blog", label: "Blog" },
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
          className={`section-container py-2 px-4 pr-2 md:px-6 lg:px-0 flex items-center justify-between`}
        >
          <Link
            href="/"
            aria-label="Magical CX Home"
            tabIndex={0}
            className="relative inline-flex items-center focus:outline-none focus:ring-2 focus:ring-primary z-50"
            onClick={handleCloseMenu}
          >
            <span className="font-medium text-base text-primary tracking-tight">
              Magical CX
            </span>
            <span className="absolute top-0 -right-8 text-[10px] text-muted-foreground font-medium uppercase tracking-wider leading-none">
              BETA
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
              {coreConf.isProd ? (
                <></>
              ) : (
                <Link
                  href={user ? "/workspaces" : "/auth"}
                  aria-label={user ? "Dashboard" : "Sign in"}
                  tabIndex={0}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {user ? "Dashboard" : "Sign in"}
                </Link>
              )}
              <button
                onClick={openDemoModal}
                aria-label="Book Demo"
                tabIndex={0}
                className={`cursor-pointer text-sm rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary ${
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

              {!coreConf.isProd && (
                <motion.div custom={navLinks.length} variants={itemVariants}>
                  <Link
                    href={user ? "/workspaces" : "/auth"}
                    onClick={handleCloseMenu}
                    className="block py-2 text-3xl font-medium tracking-tight text-foreground hover:text-black/70 transition-colors"
                  >
                    {user ? "Dashboard" : "Sign in"}
                  </Link>
                </motion.div>
              )}

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

const Logo = ({ className }: { className?: string }) => {
  return (
    <svg
      width="2399"
      height="565"
      viewBox="0 0 2399 565"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="537" height="565" fill="url(#pattern0_306_73)" />
      <path
        d="M538.463 457.638C522.321 457.638 507.728 454.653 494.682 448.683C481.636 442.603 471.299 433.813 463.67 422.315C456.152 410.817 452.393 396.721 452.393 380.026C452.393 365.654 455.157 353.824 460.685 344.537C466.213 335.25 473.676 327.898 483.073 322.48C492.471 317.063 502.974 312.972 514.582 310.208C526.191 307.444 538.021 305.344 550.072 303.907C565.329 302.138 577.711 300.7 587.219 299.595C596.728 298.379 603.637 296.444 607.949 293.79C612.261 291.137 614.417 286.825 614.417 280.855V279.694C614.417 265.211 610.326 253.989 602.145 246.029C594.074 238.069 582.023 234.089 565.992 234.089C549.298 234.089 536.141 237.792 526.523 245.2C517.015 252.497 510.436 260.623 506.788 269.578L460.188 258.964C465.715 243.486 473.786 230.993 484.4 221.485C495.124 211.866 507.451 204.901 521.382 200.589C535.312 196.167 549.961 193.956 565.329 193.956C575.5 193.956 586.28 195.172 597.667 197.604C609.165 199.926 619.89 204.238 629.84 210.54C639.901 216.842 648.137 225.852 654.55 237.571C660.962 249.18 664.168 264.271 664.168 282.845V452H615.744V417.174H613.754C610.547 423.586 605.738 429.888 599.326 436.08C592.913 442.271 584.677 447.412 574.616 451.502C564.555 455.593 552.504 457.638 538.463 457.638ZM549.243 417.837C562.952 417.837 574.671 415.129 584.4 409.711C594.24 404.294 601.703 397.218 606.788 388.484C611.985 379.639 614.583 370.187 614.583 360.126V327.29C612.814 329.059 609.386 330.717 604.301 332.265C599.326 333.702 593.632 334.974 587.219 336.079C580.807 337.074 574.56 338.014 568.48 338.898C562.399 339.672 557.313 340.336 553.223 340.888C543.604 342.105 534.815 344.15 526.854 347.025C519.005 349.899 512.703 354.045 507.949 359.462C503.305 364.769 500.984 371.845 500.984 380.69C500.984 392.962 505.517 402.249 514.582 408.55C523.648 414.742 535.202 417.837 549.243 417.837ZM837.013 552.83C816.781 552.83 799.368 550.176 784.774 544.869C770.291 539.563 758.461 532.542 749.285 523.808C740.108 515.074 733.254 505.51 728.721 495.118L771.341 477.539C774.326 482.404 778.306 487.545 783.282 492.962C788.367 498.49 795.222 503.189 803.845 507.058C812.58 510.928 823.801 512.863 837.511 512.863C856.306 512.863 871.839 508.274 884.111 499.098C896.383 490.032 902.519 475.549 902.519 455.648V405.565H899.368C896.383 410.983 892.071 417.008 886.433 423.642C880.905 430.275 873.276 436.024 863.547 440.889C853.818 445.753 841.159 448.186 825.57 448.186C805.449 448.186 787.317 443.487 771.175 434.089C755.144 424.581 742.43 410.596 733.033 392.132C723.746 373.559 719.102 350.728 719.102 323.641C719.102 296.554 723.69 273.337 732.867 253.989C742.154 234.642 754.868 219.827 771.009 209.545C787.151 199.152 805.449 193.956 825.902 193.956C841.712 193.956 854.481 196.609 864.21 201.916C873.94 207.112 881.513 213.193 886.93 220.158C892.458 227.124 896.715 233.26 899.7 238.566H903.348V197.273H951.939V457.638C951.939 479.529 946.853 497.495 936.682 511.536C926.51 525.577 912.746 535.969 895.388 542.713C878.141 549.458 858.683 552.83 837.013 552.83ZM836.516 407.058C850.778 407.058 862.829 403.741 872.668 397.108C882.619 390.364 890.137 380.745 895.222 368.252C900.418 355.648 903.017 340.557 903.017 322.978C903.017 305.841 900.474 290.75 895.388 277.704C890.302 264.658 882.84 254.487 873 247.19C863.16 239.783 850.999 236.079 836.516 236.079C821.59 236.079 809.152 239.948 799.202 247.688C789.252 255.316 781.734 265.709 776.648 278.865C771.673 292.022 769.185 306.726 769.185 322.978C769.185 339.672 771.728 354.321 776.814 366.925C781.9 379.529 789.418 389.368 799.368 396.444C809.429 403.52 821.811 407.058 836.516 407.058ZM1018.44 452V197.273H1068.03V452H1018.44ZM1043.48 157.969C1034.86 157.969 1027.45 155.095 1021.26 149.346C1015.18 143.486 1012.14 136.521 1012.14 128.45C1012.14 120.269 1015.18 113.303 1021.26 107.554C1027.45 101.695 1034.86 98.7649 1043.48 98.7649C1052.11 98.7649 1059.46 101.695 1065.54 107.554C1071.73 113.303 1074.82 120.269 1074.82 128.45C1074.82 136.521 1071.73 143.486 1065.54 149.346C1059.46 155.095 1052.11 157.969 1043.48 157.969ZM1242.03 457.141C1217.38 457.141 1196.15 451.558 1178.35 440.391C1160.66 429.114 1147.06 413.581 1137.55 393.791C1128.05 374.001 1123.29 351.336 1123.29 325.797C1123.29 299.926 1128.16 277.096 1137.88 257.306C1147.61 237.406 1161.32 221.872 1179.01 210.706C1196.7 199.539 1217.54 193.956 1241.53 193.956C1260.88 193.956 1278.13 197.549 1293.28 204.735C1308.42 211.811 1320.64 221.761 1329.93 234.586C1339.32 247.411 1344.91 262.392 1346.67 279.528H1298.42C1295.76 267.588 1289.68 257.306 1280.17 248.683C1270.78 240.059 1258.17 235.747 1242.36 235.747C1228.54 235.747 1216.44 239.396 1206.04 246.692C1195.76 253.879 1187.75 264.161 1182 277.538C1176.25 290.805 1173.37 306.505 1173.37 324.636C1173.37 343.21 1176.19 359.241 1181.83 372.729C1187.47 386.218 1195.43 396.665 1205.71 404.073C1216.11 411.48 1228.32 415.184 1242.36 415.184C1251.76 415.184 1260.27 413.47 1267.9 410.043C1275.64 406.505 1282.11 401.475 1287.3 394.952C1292.61 388.429 1296.32 380.579 1298.42 371.403H1346.67C1344.91 387.876 1339.54 402.58 1330.59 415.516C1321.63 428.451 1309.64 438.622 1294.6 446.03C1279.68 453.437 1262.15 457.141 1242.03 457.141ZM1473.83 457.638C1457.69 457.638 1443.1 454.653 1430.05 448.683C1417 442.603 1406.67 433.813 1399.04 422.315C1391.52 410.817 1387.76 396.721 1387.76 380.026C1387.76 365.654 1390.53 353.824 1396.05 344.537C1401.58 335.25 1409.04 327.898 1418.44 322.48C1427.84 317.063 1438.34 312.972 1449.95 310.208C1461.56 307.444 1473.39 305.344 1485.44 303.907C1500.7 302.138 1513.08 300.7 1522.59 299.595C1532.1 298.379 1539.01 296.444 1543.32 293.79C1547.63 291.137 1549.79 286.825 1549.79 280.855V279.694C1549.79 265.211 1545.69 253.989 1537.51 246.029C1529.44 238.069 1517.39 234.089 1501.36 234.089C1484.67 234.089 1471.51 237.792 1461.89 245.2C1452.38 252.497 1445.8 260.623 1442.16 269.578L1395.56 258.964C1401.08 243.486 1409.15 230.993 1419.77 221.485C1430.49 211.866 1442.82 204.901 1456.75 200.589C1470.68 196.167 1485.33 193.956 1500.7 193.956C1510.87 193.956 1521.65 195.172 1533.04 197.604C1544.53 199.926 1555.26 204.238 1565.21 210.54C1575.27 216.842 1583.51 225.852 1589.92 237.571C1596.33 249.18 1599.54 264.271 1599.54 282.845V452H1551.11V417.174H1549.12C1545.92 423.586 1541.11 429.888 1534.69 436.08C1528.28 442.271 1520.04 447.412 1509.98 451.502C1499.92 455.593 1487.87 457.638 1473.83 457.638ZM1484.61 417.837C1498.32 417.837 1510.04 415.129 1519.77 409.711C1529.61 404.294 1537.07 397.218 1542.16 388.484C1547.35 379.639 1549.95 370.187 1549.95 360.126V327.29C1548.18 329.059 1544.75 330.717 1539.67 332.265C1534.69 333.702 1529 334.974 1522.59 336.079C1516.18 337.074 1509.93 338.014 1503.85 338.898C1497.77 339.672 1492.68 340.336 1488.59 340.888C1478.97 342.105 1470.18 344.15 1462.22 347.025C1454.37 349.899 1448.07 354.045 1443.32 359.462C1438.67 364.769 1436.35 371.845 1436.35 380.69C1436.35 392.962 1440.88 402.249 1449.95 408.55C1459.02 414.742 1470.57 417.837 1484.61 417.837ZM1715.17 112.364V452H1665.58V112.364H1715.17ZM2067.95 222.812H2016.2C2014.21 211.756 2010.51 202.027 2005.09 193.624C1999.68 185.222 1993.04 178.091 1985.19 172.231C1977.34 166.372 1968.55 161.949 1958.82 158.964C1949.21 155.979 1938.98 154.487 1928.14 154.487C1908.58 154.487 1891.05 159.406 1875.57 169.246C1860.21 179.086 1848.04 193.514 1839.09 212.53C1830.24 231.546 1825.82 254.763 1825.82 282.182C1825.82 309.821 1830.24 333.149 1839.09 352.165C1848.04 371.182 1860.26 385.554 1875.74 395.283C1891.22 405.013 1908.63 409.877 1927.98 409.877C1938.7 409.877 1948.87 408.44 1958.49 405.565C1968.22 402.58 1977.01 398.213 1984.86 392.464C1992.71 386.715 1999.34 379.695 2004.76 371.403C2010.29 363 2014.1 353.382 2016.2 342.547L2067.95 342.713C2065.18 359.407 2059.82 374.775 2051.86 388.816C2044.01 402.746 2033.89 414.797 2021.51 424.968C2009.24 435.029 1995.2 442.824 1979.39 448.352C1963.58 453.879 1946.33 456.643 1927.65 456.643C1898.24 456.643 1872.04 449.678 1849.04 435.748C1826.04 421.707 1807.91 401.641 1794.64 375.549C1781.49 349.457 1774.91 318.335 1774.91 282.182C1774.91 245.919 1781.54 214.796 1794.81 188.815C1808.08 162.723 1826.21 142.712 1849.21 128.782C1872.2 114.741 1898.35 107.72 1927.65 107.72C1945.67 107.72 1962.47 110.318 1978.06 115.515C1993.76 120.6 2007.86 128.118 2020.35 138.069C2032.84 147.908 2043.18 159.959 2051.36 174.221C2059.54 188.373 2065.07 204.57 2067.95 222.812ZM2160.82 112.364L2242.08 245.2H2244.73L2325.99 112.364H2385.36L2279.56 282.182L2386.02 452H2326.32L2244.73 320.988H2242.08L2160.48 452H2100.78L2209.07 282.182L2101.45 112.364H2160.82Z"
        fill="white"
      />
      <defs>
        <pattern
          id="pattern0_306_73"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use transform="matrix(0.000720438 0 0 0.000684735 -0.1527 -0.0955752)" />
        </pattern>
        <image
          id="image0_306_73"
          width="1600"
          height="1600"
          preserveAspectRatio="none"
        />
      </defs>
    </svg>
  );
};
