import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
import {
  ArrowRight,
  Check,
  Copy,
  Loader2,
  Mail,
  RefreshCcw,
} from "lucide-react";

import { useEffect, useState } from "react";
import {
  getSignatureDetails,
  useEmailActions,
} from "@/lib/hooks/email/use-email-actions";
import { toast } from "sonner";
import { generateDefaultChannel } from "@/lib/types/channel";
import channelService from "@/lib/services/channel-service";
import { generateForwardingEmail, getwid } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { channelsKey } from "@/hooks/channels/use-channels";

interface EmailSetupModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const EmailSetupModal = ({ isOpen, closeModal }: EmailSetupModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [forwardingEmail, setForwardingEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const [signatureId, setSignatureId] = useState(
    localStorage.getItem("signatureId") ?? ""
  );

  const qc = useQueryClient();
  const {
    sendVerificationEmail,
    resendVerificationEmail,
    checkIfEmailVerified,
  } = useEmailActions();

  const handleSendVerification = async () => {
    if (!email || !displayName) return;

    try {
      await sendVerificationEmail.mutateAsync({ email, displayName });
      setEmailSent(true);
    } catch (error) {}
  };

  const handleResendEmail = async () => {
    if (!email) return;
    const signatureId = localStorage.getItem("signatureId");
    if (!signatureId) return;

    try {
      await resendVerificationEmail.mutateAsync({ signatureId });
      setEmailSent(true);
    } catch (error) {}
  };

  const handleVerifiedEmail = async () => {
    const sid = localStorage.getItem("signatureId");
    if (!sid) return;
    const data = await checkIfEmailVerified.mutateAsync({
      signatureId: sid,
    });

    if (data.confirmed) {
      const fwdEmail = await createEmailChannel(data);
      setForwardingEmail(fwdEmail);
      setStep(2);
    } else {
      toast.warning("You haven't verified your email yet");
    }
  };

  const createEmailChannel = async (data: any): Promise<string> => {
    const fwdEmail = generateForwardingEmail();
    const metadata = {
      id: data.emailAddress,
      email: data.emailAddress,
      name: data.name,
      signatureId: data.signatureId,
      domain: data.domain,
      replyToEmail: data.replyToEmail,
      returnPathDomain: data.returnPathDomain,
      forwardingEmail: fwdEmail,
    };
    console.log(metadata);
    const creds = { signatureId: data.signatureId };
    const emailChannel = generateDefaultChannel(
      data.emailAddress,
      "email",
      creds,
      metadata
    );

    await channelService.addChannel(getwid(), emailChannel);
    qc.invalidateQueries({ queryKey: channelsKey(getwid()) });
    return fwdEmail;
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(forwardingEmail);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleFinish = () => {
    setStep(1);
    setEmail("");
    setDisplayName("");
    setEmailSent(false);
    setForwardingEmail("");
    setCopied(false);
    localStorage.removeItem("signatureId");
    closeModal();
  };

  useEffect(() => {
    if (signatureId) {
      const sid = localStorage.getItem("signatureId");

      if (!sid) return;
      getSignatureDetails(sid).then((data) => {
        if (data.emailAddress) setEmail(data.emailAddress);
        if (data.name) setDisplayName(data.name);
        if (data.signatureId) {
          setSignatureId(data.signatureId);
          setEmailSent(true);
        }
      });
    }
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      closeModal={closeModal}
      className="max-w-md bg-background rounded-xl p-6 shadow-xl"
    >
      {step === 1 ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Connect your email</h2>
            <p className="text-sm text-muted-foreground">
              We&apos;ll send a verification link to confirm ownership.
            </p>
          </div>

          {/* Form */}
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendVerification();
            }}
            aria-label="Email Setup Form"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="support@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-label="Email Address"
                required
                disabled={emailSent}
                tabIndex={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Company Support"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="off"
                aria-label="Email Display Name"
                required
                disabled={emailSent}
                tabIndex={0}
              />
              <p className="text-xs text-muted-foreground">
                This name appears in emails sent to customers.
              </p>
            </div>

            {!emailSent && (
              <Button
                type="submit"
                className="w-full"
                disabled={
                  sendVerificationEmail.isPending || !email || !displayName
                }
                aria-label="Send Verification Email"
                tabIndex={0}
              >
                {sendVerificationEmail.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Send verification email"
                )}
              </Button>
            )}
          </form>

          {/* Verification Sent State */}
          {emailSent && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="size-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Check your inbox</p>
                  <p className="text-muted-foreground">
                    We sent a verification link to{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEmailSent(false)}
                  aria-label="Change Email"
                  tabIndex={0}
                >
                  Change email
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleResendEmail()}
                  aria-label="Resend Email"
                  disabled={resendVerificationEmail.isPending}
                  tabIndex={0}
                >
                  {resendVerificationEmail.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="size-4" />
                  )}
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={handleVerifiedEmail}
                disabled={checkIfEmailVerified.isPending}
                aria-label="Continue to Next Step"
                tabIndex={0}
              >
                {checkIfEmailVerified.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    I&apos;ve verified my email
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Set up forwarding</h2>
            <p className="text-sm text-muted-foreground">
              Forward emails to the address below to receive them in MagicalCX.
            </p>
          </div>

          {/* Forwarding Email */}
          <div className="space-y-3">
            <Label>Forwarding address</Label>
            <div className="flex gap-2">
              <div
                className="flex-1 px-3 py-2.5 bg-muted rounded-lg font-mono text-sm cursor-text select-all break-all"
                onClick={handleCopyEmail}
                role="button"
                tabIndex={0}
                aria-label="Click to copy forwarding email"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleCopyEmail();
                }}
              >
                {forwardingEmail}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyEmail}
                aria-label="Copy forwarding email"
                tabIndex={0}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="size-4 text-green-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add this address in your email provider&apos;s forwarding settings
              (Gmail, Outlook, etc.)
            </p>
          </div>

          {/* Done */}
          <Button
            className="w-full"
            onClick={handleFinish}
            tabIndex={0}
            aria-label="Complete setup"
          >
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default EmailSetupModal;
