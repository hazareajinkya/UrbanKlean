import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useChannelActions } from "@/hooks/channels/use-channel-actions";
import { useParams } from "next/navigation";
import { WAIcon } from "@/lib/logos";

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

interface WaEmbeddedButtonProps {
  appId: string;
  configId: string;
}

const WaEmbeddedButton: React.FC<WaEmbeddedButtonProps> = ({
  appId,
  configId,
}) => {
  const [isHttps, setIsHttps] = useState(false);
  const [isFbReady, setIsFbReady] = useState(false);
  const { wid } = useParams() as { wid: string };

  // Use refs to store signup data immediately (avoiding async state update issues)
  const signupDataRef = useRef<{
    phoneNumberId: string | null;
    wabaId: string | null;
    businessId: string | null;
  }>({
    phoneNumberId: null,
    wabaId: null,
    businessId: null,
  });

  const { createWhatsappChannel } = useChannelActions();
  useEffect(() => {
    const checkHttps = () => {
      const isSecure =
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      setIsHttps(isSecure);

      if (!isSecure) {
        toast.error(
          "WhatsApp connection requires HTTPS. Please access this page over a secure connection.",
        );
      }
    };

    checkHttps();
  }, []);

  useEffect(() => {
    if (document.getElementById("facebook-jssdk")) return;

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.fbAsyncInit) {
        window.fbAsyncInit();
      }
    };
    document.body.appendChild(script);

    window.fbAsyncInit = () => {
      if (window.FB) {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: "v25.0",
        });
        setIsFbReady(true);
      }
    };

    if (window.FB) {
      window.fbAsyncInit();
    }
  }, [appId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "WA_EMBEDDED_SIGNUP") {
          if (payload.event === "FINISH") {
            console.log("WhatsApp signup finished:", payload);
            // Store in ref for immediate access in FB.login callback
            signupDataRef.current = {
              phoneNumberId: payload.data.phone_number_id,
              wabaId: payload.data.waba_id,
              businessId: payload.data.business_id,
            };
          }

          if (payload.event === "CANCEL") {
            console.warn("WhatsApp signup cancelled:", payload.data);
            toast.warning("WhatsApp connection cancelled");
          }
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSignup = () => {
    if (!isHttps) {
      toast.error(
        "Facebook Login requires HTTPS. Please access this page over a secure connection.",
      );
      return;
    }

    if (!window.FB || !isFbReady) {
      toast.error("Facebook SDK is not ready. Please try again in a moment.");
      return;
    }

    try {
      window.FB.login(
        (response: any) => {
          if (response.error) {
            console.error("FB Login Error:", response.error);
            toast.error(
              `Facebook Login failed: ${
                response.error.message || "Unknown error"
              }`,
            );
            return;
          }

          if (response.authResponse) {
            console.log("FB Login Response:", response);
            const { phoneNumberId, wabaId, businessId } = signupDataRef.current;

            if (phoneNumberId && wabaId && businessId) {
              createWhatsappChannel.mutate({
                wid,
                phone_number_id: phoneNumberId,
                waba_id: wabaId,
                business_id: businessId,
                authorizationCode: response.authResponse.code,
              });
            } else {
              console.error("Missing signup data:", signupDataRef.current);
              toast.error("WhatsApp signup data incomplete. Please try again.");
            }
          }
        },
        {
          config_id: configId,
          response_type: "code",
          override_default_response_type: true,
          auth_type: "rerequest",
        },
      );
    } catch (error) {
      console.error("Error calling FB.login:", error);
      toast.error(
        "Failed to initiate WhatsApp connection. Please ensure you're on HTTPS.",
      );
    }
  };

  const isDisabled = !isHttps || !isFbReady;

  return (
    <Button
      onClick={handleSignup}
      disabled={isDisabled}
      variant="outline"
      className="bg-card"
    >
      <WAIcon className="w-5 h-5" />
      Connect WhatsApp
    </Button>
  );
};

export default WaEmbeddedButton;
