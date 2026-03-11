"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import firebaseAnalyticsService from "@/lib/services/firebase-analytics-service";

export const useFirebaseAnalytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.email) {
      firebaseAnalyticsService.setUserId({ userId: session.user.email });

      firebaseAnalyticsService.setUserProperties({
        properties: { user_role: (session.user as any).role },
      });
    } else {
      firebaseAnalyticsService.setUserId({ userId: null });
    }
  }, [session]);

  useEffect(() => {
    if (!pathname) return;

    const url = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;

    firebaseAnalyticsService.logEvent({
      event: "page_view",
      params: {
        page_path: url,
        page_title: document.title,
        page_location: window.location.href,
      },
    });
  }, [pathname, searchParams]);
};
