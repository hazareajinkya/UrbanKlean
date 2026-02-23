import { axiosClient } from "@/lib/clients/axios-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useEmailActions = () => {
  const sendVerificationEmail = useMutation({
    mutationFn: async ({
      email,
      displayName,
    }: {
      email: string;
      displayName: string;
    }) => {
      const { data } = await axiosClient.post(
        "/api/email/send-verification-email",
        { email, displayName }
      );
      return data.data;
    },
    onSuccess: (data, variables) => {
      localStorage.setItem("signatureId", data.signatureId);
      toast.success("Verification email sent successfully");
    },
    onError: (error: Error) => {
      console.log("error: ", error);
      toast.error(error.message);
    },
  });

  const resendVerificationEmail = useMutation({
    mutationFn: async ({ signatureId }: { signatureId: string }) => {
      const { data } = await axiosClient.post(
        "/api/email/resend-verification-email",
        { signatureId }
      );
      return data.data;
    },
    onSuccess: (data, variables) => {
      localStorage.setItem("signatureId", data.signatureId);
      toast.success("Verification email resend successfully");
    },
    onError: (error: Error) => {
      console.log("error: ", error);
      toast.error(error.message);
    },
  });

  const checkIfEmailVerified = useMutation({
    mutationFn: async ({ signatureId }: { signatureId: string }) => {
      const data = await getSignatureDetails(signatureId);
      return data;
    },
    onError: (error: Error) => {
      console.log("error: ", error);
      toast.error(error.message);
    },
  });

  return {
    sendVerificationEmail,
    resendVerificationEmail,
    checkIfEmailVerified,
  };
};

export const getSignatureDetails = async (signatureId: string) => {
  const { data } = await axiosClient.get(`/api/email/get-signature-details`, {
    params: { signatureId },
  });
  return data.data;
};
