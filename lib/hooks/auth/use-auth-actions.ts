import { useMutation } from "@tanstack/react-query";
import userService from "@/lib/services/user-service";
import { toast } from "sonner";
import { IUser } from "@/lib/types/user";
import {
  signOut as fbSignOut,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import { signIn, signOut } from "next-auth/react";
import { auth } from "@/lib/clients/firebase";
import { handleError } from "@/lib/utils";

// do something of ur own

export const useAuthActions = () => {
  const signInGoogle = useMutation({
    mutationFn: async () => {
      const fbuser = await googleSignIn();
      const user = await handleSignIn(fbuser);
      return user;
    },
    onSuccess: (data) => {
      console.log("data: ", data);
      toast.success("Signed in successfully");
      nextAuthSignIn(data);
    },
    onError: handleError,
  });

  const sendLoginEmail = useMutation({
    mutationFn: async (email: string) => {
      await sendSignInEmail(email);
    },
    onSuccess: () => toast.success("Sign in link sent successfully"),
    onError: handleError,
  });

  const verifyEmailLink = useMutation({
    mutationFn: async () => {
      console.log("running: ");

      const fbuser = await verifySignInLink();
      const user = await handleSignIn(fbuser);
      return user;
    },
    onSuccess: (data) => {
      toast.success("Signed in successfully");
      nextAuthSignIn(data);
    },
    onError: handleError,
  });

  const signOutUser = useMutation({
    mutationFn: async () => {
      await fbSignOut(auth);
      await signOut();
    },
    onSuccess: () => toast.success("Signed out successfully"),
    onError: handleError,
  });

  return {
    signInGoogle,
    sendLoginEmail,
    verifyEmailLink,
    signOutUser,
  };
};

const nextAuthSignIn = async (user: IUser) => {
  const url = window.location.href.split("callbackUrl=");
  let callbackUrl;
  if (url.length > 1) {
    callbackUrl = decodeURIComponent(url[1]);
  }

  signIn("credentials", {
    email: user.email,
    name: user.name,
    image: user.photoUrl,
    id: user.id,
    redirect: true,
    callbackUrl: callbackUrl,
  });
};

const googleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

const sendSignInEmail = async (email: string) => {
  const actionCodeSettings = {
    url: process.env.NEXT_PUBLIC_BASE_URL + "/auth/verify",
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email.trim(), actionCodeSettings);
  window.localStorage.setItem("emailForSignIn", email);
  console.log("email: ", email);
  return true;
};

const verifySignInLink = async () => {
  const email2 = window.localStorage.getItem("emailForSignIn");
  console.log("email2: ", email2);

  const email = window.localStorage.getItem("emailForSignIn");
  console.log("email: ", email);

  if (!email) {
    throw new Error("No email found");
  }

  const isLinkValid = isSignInWithEmailLink(auth, window.location.href);

  if (!isLinkValid) {
    throw new Error("Invalid sign in link");
  }

  const result = await signInWithEmailLink(auth, email, window.location.href);
  console.log("result: ", result);

  window.localStorage.removeItem("emailForSignIn");
  return result.user;
};

const handleSignIn = async (fbuser: User) => {
  const email = fbuser.email ?? "";
  let userInfo = await userService.getUser(email);

  if (!userInfo) {
    userInfo = await userService.createUser(fbuser);
  }

  return userInfo;
};
