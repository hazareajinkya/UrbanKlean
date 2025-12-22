"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

export const WidgetScript = () => {
  const pathname = usePathname();
  const shouldLoad =
    !pathname?.startsWith("/workspaces") &&
    !pathname?.startsWith("/api") &&
    !pathname?.startsWith("/chat");

  if (!shouldLoad) return null;

  return (
    <Script
      async
      src="https://www.magicalcx.com/api/widget/c0e54882-04fc-489e-975b-e2b7edbf2adf"
      //   src="http://localhost:3001/api/widget/c0e54882-04fc-489e-975b-e2b7edbf2adf"
      strategy="afterInteractive"
    />
  );
};
