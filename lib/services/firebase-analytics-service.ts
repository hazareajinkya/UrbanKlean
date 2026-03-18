import { logEvent, setUserId, setUserProperties } from "firebase/analytics";
import { analytics } from "../clients/firebase";
import {
  FirebaseAnalyticsEvent,
  FirebaseAnalyticsUserProperties,
} from "../types/firebase-analytics";

const logFirebaseEvent = async (args: {
  event: FirebaseAnalyticsEvent;
  params?: Record<string, any>;
}) => {
  const instance = await analytics;
  if (!instance) {
    console.warn(
      "[Firebase Analytics] Analytics not initialized or not supported in this browser.",
    );
    return;
  }

  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  const finalParams = {
    ...args.params,

    ...(isLocalhost ? { debug_mode: true } : {}),
  };

  console.log(`[Firebase Analytics] Logging event: ${args.event}`, finalParams);
  logEvent(instance, args.event as string, finalParams);
};

const setFirebaseUserId = async (args: { userId: string | null }) => {
  const instance = await analytics;
  if (!instance) return;

  setUserId(instance, args.userId);
};

const setFirebaseUserProperties = async (args: {
  properties: FirebaseAnalyticsUserProperties;
}) => {
  const instance = await analytics;
  if (!instance) return;

  setUserProperties(instance, args.properties);
};

const firebaseAnalyticsService = {
  logEvent: logFirebaseEvent,
  setUserId: setFirebaseUserId,
  setUserProperties: setFirebaseUserProperties,
};

export default firebaseAnalyticsService;
