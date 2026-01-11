"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [isSignUp, setIsSignUp] = useState(false);

  // Defer pathname-dependent logic until after hydration to prevent mismatch
  useEffect(() => {
    setIsSignUp(pathname.includes("/sign-up"));
  }, [pathname]);

  // Dynamic content based on route
  const imageSrc = isSignUp ? "/signup.svg" : "/login.svg";
  const headline = isSignUp ? "Join Munjiz Today" : "Welcome Back to Munjiz";
  const subtitle = isSignUp
    ? "Create an account to start organizing your projects and collaborating with your team."
    : "Log in to continue managing your tasks and tracking progress efficiently.";

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column - Form Area */}
      <div className="flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right Column - Showcase Area with Curved Edge */}
      <div
        className="hidden lg:flex flex-col items-center justify-center p-12 text-center bg-linear-to-br from-primary/20 via-background to-secondary/20 dark:from-primary/10 dark:via-background dark:to-secondary/10 relative overflow-hidden"
        style={{
          clipPath: "polygon(8% 0%, 100% 0%, 100% 100%, 0% 100%, 3% 50%)",
        }}
      >
        {/* Soft Glowing Blobs */}
        {/* Top-Right Orb */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />

        {/* Bottom-Left Orb */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -z-10" />

        {/* Hero Illustration */}
        <Image
          src={imageSrc}
          alt="Munjiz Illustration"
          width={450}
          height={450}
          className="object-contain"
        />

        {/* Marketing Content */}
        <h2 className="text-3xl font-bold tracking-tight mt-8">
          {headline}
        </h2>
        <p className="text-muted-foreground text-lg mt-4 max-w-md">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
