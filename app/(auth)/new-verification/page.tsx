"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { MunjizLogo } from "@/components/munjiz-logo";

const NewVerificationPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token. Please check your email link.");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully! You can now sign in.");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. Please try again.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verifyEmail();
  }, [token]);

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  return (
    <Card className="border-0 shadow-none bg-transparent py-0 gap-0">
      <CardHeader className="p-0 pb-4 px-0">
        <div className="flex flex-col items-center space-y-1">
          {/* Logo */}
          <MunjizLogo iconSize={28} textSize="sm" />

          {/* Header Text */}
          <div className="text-center space-y-0.5">
            <h1 className="text-lg md:text-xl font-bold tracking-tight">
              Email Verification
            </h1>
            <p className="text-muted-foreground text-xs">
              Confirming your email address
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-0">
        {/* Loading State */}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Verifying your email address...
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-green-50 dark:bg-green-950/30 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold text-foreground">
                Email Verified!
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                {message}
              </p>
            </div>
            <Button
              onClick={handleSignIn}
              variant="primary"
              className="w-full max-w-xs h-9 font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-200 mt-4"
            >
              Continue to Sign In
            </Button>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold text-foreground">
                Verification Failed
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                {message}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs mt-4">
              <Button
                onClick={() => router.push("/sign-up")}
                variant="outline"
                className="flex-1 h-9 font-medium text-sm"
              >
                Try Again
              </Button>
              <Button
                onClick={() => router.push("/sign-in")}
                variant="primary"
                className="flex-1 h-9 font-semibold text-sm"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col text-center text-xs pt-4 px-0 border-0">
        <div className="text-muted-foreground">
          Need help?{" "}
          <Link
            href="/support"
            className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NewVerificationPage;
