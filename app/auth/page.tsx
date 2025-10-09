"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Mail } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/auth/use-user";
import { useAuthActions } from "@/lib/hooks/auth/use-auth-actions";
import { useState } from "react";
import { GoogleColorLessLogo, GoogleLogo } from "@/lib/logos";

export default function AuthPage() {
  const { data: session, status } = useSession();
  const email = session?.user?.email;

  const { data: user } = useCurrentUser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px] min-h-[400px] transition-all duration-800 flex flex-col items-center py-0">
        {status === "loading" ? (
          <Spinner />
        ) : email ? (
          <SignedIn />
        ) : (
          <SignInForm />
        )}
      </Card>
    </div>
  );
}

const Spinner = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );
};

const SignedIn = () => {
  const { data: user, isLoading } = useCurrentUser();
  const { signOutUser } = useAuthActions();

  return (
    <>
      <CardHeader className="text-center w-full mt-8">
        <CardTitle className="flex flex-row items-center justify-center gap-3 text-xl">
          <span className="">🎬</span>
          <span className="bg-gradient-to-r from-primary to-blue-800 font-semibold bg-clip-text text-transparent">
            Magical CX
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full flex-1 flex flex-col items-center justify-center gap-4 ">
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.photoUrl} alt={user?.name} />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="w-full gap-4 mb-6 ">
        <Button
          className="flex-1"
          onClick={() => (window.location.href = "/workspaces")}
        >
          Go to Workspaces
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => signOutUser.mutate()}
        >
          Sign Out
        </Button>
      </CardFooter>
    </>
  );
};

const SignInForm = () => {
  const { sendLoginEmail, signInGoogle } = useAuthActions();
  const [email, setEmail] = useState("");

  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleGoogleSignIn = () => {
    signInGoogle.mutate();
  };

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendLoginEmail.mutateAsync(email);
    setIsEmailSent(true);
  };

  if (isEmailSent) {
    return <VerifyRequest email={email} />;
  }

  return (
    <>
      <CardHeader className="text-center w-full mt-16 gap-0">
        <CardTitle className="flex flex-col items-center justify-center gap-2 text-2xl">
          <div className="relative w-16 h-16 mx-auto">
            <img
              // src="/temp-logo-filled.jpg"
              src="https://firebasestorage.googleapis.com/v0/b/supercx-ai.firebasestorage.app/o/w%2Fe846a44e-988d-492a-ac46-629fd479ae5b%2Fagents%2F94fbefb7-df52-438c-8a86-de1ef901ff49%2Flogo?alt=media&token=7c7a28ec-362e-4a54-a64b-6adcec4a07e6"
              alt=""
              className="h-full w-full object-cover rounded-md"
            />
          </div>
          <span className="bg-gradient-to-r from-neutral-800 to-blue-800 bg-clip-text text-transparent font-bold text-2xl">
            Magical CX
          </span>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Turn questions into profit
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full mt-4">
        <Button
          variant="default"
          type="button"
          className="w-full gap-2"
          disabled={signInGoogle.isPending}
          onClick={handleGoogleSignIn}
          size={"lg"}
        >
          {signInGoogle.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <GoogleColorLessLogo className="" />
          )}
          Sign in with Google
        </Button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-50 px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              disabled={sendLoginEmail.isPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={sendLoginEmail.isPending}
            variant={"outline"}
            size={"lg"}
          >
            {sendLoginEmail.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            Send Sign In Link
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center mb-6">
        <p className="text-xs max-w-[250px] text-center text-muted-foreground">
          By signing in, a new account will be created automatically if you
          don't have one yet
        </p>
      </CardFooter>
    </>
  );
};

function VerifyRequest({ email }: { email: string }) {
  return (
    <div className="flex-1 rounded-xl flex-col flex items-center justify-center p-6 md:p-8 md:pb-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 animate-in fade-in slide-in-from-bottom-4 duration-400">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="rounded-full bg-green-100 dark:bg-green-900/50 p-3">
            <div className="rounded-full bg-green-500 dark:bg-green-500 p-2">
              <Mail className="h-5 w-5 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="text-base text-muted-foreground">
            We have sent a sign-in link to{" "}
            <span className="font-medium">{email}</span>
          </p>
        </div>
      </div>
      <div className="border-t pt-4 mb-6 flex flex-col gap-1 text-sm text-center text-muted-foreground">
        <p>Click the link in the email to sign in to your account.</p>
        <p className="flex items-center justify-center gap-1.5">
          The link expires in 1 hour.
        </p>
      </div>
    </div>
  );
}
