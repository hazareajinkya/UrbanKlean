import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/ui/modal";
import { ArrowRight, Loader2, Pencil, RefreshCcw, Send } from "lucide-react";

import { useEffect, useState } from "react";
import {
  getSignatureDetails,
  useEmailActions,
} from "@/lib/hooks/email/use-email-actions";
import { toast } from "sonner";

interface EmailSetupModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const EmailSetupModal = ({ isOpen, closeModal }: EmailSetupModalProps) => {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const [signatureId, setSignatureId] = useState(
    localStorage.getItem("signatureId") ?? ""
  );

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

  const handleChangeEmail = () => {
    setEmailSent(false);
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
    const isVerified = await checkIfEmailVerified.mutateAsync({
      signatureId: sid,
    });

    if (isVerified) {
      closeModal();
    } else {
      toast.warning("You haven't verified your email yet");
    }
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
      className="max-w-2xl bg-white dark:bg-black rounded-2xl p-6"
    >
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-medium">Verify your email</h2>
          <p className="text-sm text-muted-foreground">
            Enter email address where you want to automate emails.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendVerification();
          }}
          aria-label="Email Setup Form"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="support@company.com"
              className="w-full"
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
            <Label htmlFor="displayName">Email Display Name</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Support at Company"
              className="w-full"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="off"
              aria-label="Email Display Name"
              required
              disabled={emailSent}
              tabIndex={0}
            />
          </div>
          {!emailSent && (
            <div className="flex justify-end w-full">
              <Button
                type="submit"
                disabled={
                  sendVerificationEmail.isPending || !email || !displayName
                }
                aria-label="Send Verification Email"
                className="transition-all"
              >
                {sendVerificationEmail.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Send Verification Email
              </Button>
            </div>
          )}
        </form>

        {emailSent && (
          <div className="mt-6 p-4 border border-primary/10 bg-primary/5 text-primary rounded-lg  animate-fade-in">
            <p className="text-sm ">
              Verification email has been sent to{" "}
              <span className="font-semibold">{email}</span> <br />
              <br />
              Please check your inbox and click on the verification link sent
              <br />
              <br />
              Once verified, come back here and click on the continue setup
              button.
            </p>
          </div>
        )}

        {emailSent ? (
          <div className="flex flex-row items-center justify-between mt-6 gap-2">
            <>
              <Button
                variant="outline"
                onClick={() => setEmailSent(false)}
                aria-label="Change Email"
                className="transition-all"
              >
                Change email
              </Button>
              <div className="flex flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleResendEmail()}
                  aria-label="Resend Email"
                  disabled={resendVerificationEmail.isPending}
                  className="transition-all"
                >
                  {resendVerificationEmail.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="size-4" />
                  )}
                  Resend Email
                </Button>
                <Button
                  onClick={handleVerifiedEmail}
                  disabled={checkIfEmailVerified.isPending}
                  aria-label="I've Verified Email"
                  className="transition-all"
                >
                  {checkIfEmailVerified.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  Continue setup
                </Button>
              </div>
            </>
          </div>
        ) : (
          <></>
        )}
      </div>
    </Modal>
  );
};

export default EmailSetupModal;
