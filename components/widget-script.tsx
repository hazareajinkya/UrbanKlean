"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

export const WidgetScript = () => {
  const pathname = usePathname();
  const shouldLoad =
    !pathname?.startsWith("/workspaces") &&
    !pathname?.startsWith("/widget-test") &&
    !pathname?.startsWith("/api") &&
    !pathname?.startsWith("/chat") &&
    !pathname?.startsWith("/share") &&
    !pathname?.startsWith("/billing") &&
    !pathname?.startsWith("/onboard-share");
  if (!shouldLoad) return null;

  return (
    <Script
      async
      src="https://www.magicalcx.com/api/widget/5be36366-8f3d-46c3-b0c7-37f67abbc1a9"
      strategy="afterInteractive"
    />
  );
};
