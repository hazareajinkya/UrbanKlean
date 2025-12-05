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
import { Loader2, Mail, Sparkles } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/user/use-user";
import { useAuthActions } from "@/lib/hooks/auth/use-auth-actions";
import { useState } from "react";
import { GoogleColorLessLogo, GoogleLogo } from "@/lib/logos";
import Link from "next/link";

export default function AuthPage() {
  const { data: session, status } = useSession();
  const email = session?.user?.email;

  return (
    <div className="min-h-screen grid lg:grid-cols-[40%_60%]">
      {/* Left Column - Dark Theme */}

      {/* Right Column - Auth Form */}
      <div className="flex items-center justify-center p-8 lg:p-12 bg-background">
        <div className="w-full max-w-[420px] flex flex-col">
          {status === "loading" ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <Spinner />
            </div>
          ) : email ? (
            <SignedIn />
          ) : (
            <SignInForm />
          )}
        </div>
      </div>
      <div className="hidden lg:flex flex-col justify-between bg-zinc-950 text-white p-12 relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          {/* logo want to come here */}
          <span className="font-medium text-xl tracking-tight text-white/90">
            Magical CX
          </span>
        </div>

        {/* Quote */}
        <div className="relative z-10 max-w-xl">
          <blockquote className="text-3xl font-serif leading-tight  italic text-white/90 drop-shadow-sm">
            "Customer care should feel human — simple, honest, and kind. When
            that happens, everyone wins."
          </blockquote>
        </div>

        {/* Footer */}
        <div className="z-10 text-sm text-zinc-500 flex justify-between items-center">
          <span>© {new Date().getFullYear()} Magical CX Inc.</span>
          <div className="flex gap-8">
            <Link
              href="#"
              className="hover:text-white transition-colors duration-200"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="hover:text-white transition-colors duration-200"
            >
              Terms
            </Link>
          </div>
        </div>

        {/* Background Gradient/Texture */}
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-40" />
        <div className="absolute -top-[20%] -right-[10%] w-[80%] h-[80%] bg-white/5 blur-[120px] rounded-full mix-blend-overlay" />
        <div className="absolute bottom-[10%] -left-[10%] w-[60%] h-[60%] bg-white/5 blur-[100px] rounded-full mix-blend-overlay" />
      </div>
    </div>
  );
}

const Spinner = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
};

const SignedIn = () => {
  const { data: user, isLoading } = useCurrentUser();
  const { signOutUser } = useAuthActions();

  return (
    <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
      <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-2 ring-1 ring-primary/10">
        <span className="text-4xl">👋</span>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-medium tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="text-muted-foreground text-base">
          You are currently signed in as
        </p>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex items-center gap-4 p-4 border border-border/50 rounded-xl w-full bg-secondary/30 shadow-sm">
          <Avatar className="w-12 h-12 border border-border">
            <AvatarImage src={user?.photoUrl} alt={user?.name} />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="text-left overflow-hidden">
            <h3 className="font-medium truncate text-foreground">
              {user?.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full pt-4">
        <Button
          className="w-full h-12 text-base font-medium shadow-sm hover:shadow-md transition-all"
          onClick={() => (window.location.href = "/workspaces")}
        >
          Go to Dashboard
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base hover:bg-secondary/50 transition-colors"
          onClick={() => signOutUser.mutate()}
        >
          Sign Out
        </Button>
      </div>
    </div>
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-3">
        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6 lg:hidden">
          {/* <Sparkles className="w-6 h-6 text-primary" /> */}
          <img src="/magical-cx-logo.png" alt="" />
        </div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-base text-muted-foreground">
          Sign in to your dashboard to continue
        </p>
      </div>

      <div className="space-y-5">
        <Button
          variant="outline"
          type="button"
          className="w-full h-12 gap-3 bg-white hover:bg-gray-50 text-black border-gray-200 shadow-sm hover:shadow transition-all text-base font-medium"
          disabled={signInGoogle.isPending}
          onClick={handleGoogleSignIn}
        >
          {signInGoogle.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <GoogleLogo className="w-5 h-5" />
          )}
          Sign In with Google
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-3 text-muted-foreground font-medium tracking-wider">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-semibold uppercase text-muted-foreground tracking-wide ml-1"
            >
              Work Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              required
              disabled={sendLoginEmail.isPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 px-4 bg-secondary/20  focus:bg-background transition-colors"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all text-base font-medium"
            disabled={sendLoginEmail.isPending}
          >
            {sendLoginEmail.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : null}
            Sign in with Email
          </Button>
        </form>
      </div>

      <p className="text-xs text-center text-muted-foreground px-6 leading-relaxed">
        By clicking continue, you agree to our{" "}
        <Link
          href="#"
          className="underline underline-offset-4 hover:text-primary transition-colors"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="#"
          className="underline underline-offset-4 hover:text-primary transition-colors"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
};

function VerifyRequest({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-5 ring-8 ring-green-50 dark:ring-green-900/10">
        <Mail className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-medium tracking-tight">
          Check your email
        </h1>
        <p className="text-muted-foreground max-w-xs mx-auto text-base">
          We have sent a sign-in link to{" "}
          <span className="font-medium text-foreground block mt-1">
            {email}
          </span>
        </p>
      </div>

      <div className="w-full border-t pt-8">
        <p className="text-sm text-muted-foreground mb-6">
          Click the link in the email to sign in.
        </p>
        <Button
          variant="ghost"
          className="text-sm hover:bg-secondary/50"
          onClick={() => window.location.reload()}
        >
          Back to sign in
        </Button>
      </div>
    </div>
  );
}
