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
    <div className="h-dvh grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Left Column - Form Area */}
      <div className="relative flex flex-col items-center justify-center p-4 md:p-8 bg-gray-50 dark:bg-slate-900 lg:bg-background">
        {/* Top Glow Blob - Mobile Only */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none lg:hidden" />
        
        {/* Card Container - Mobile/Tablet Only */}
        <div className="relative w-full max-w-md bg-white dark:bg-background shadow-lg rounded-2xl p-6 md:p-8 lg:bg-transparent lg:shadow-none lg:p-0">
          {children}
        </div>
      </div>

      {/* Right Column - Showcase Area with Curved Edge */}
      <div
        className="hidden lg:flex flex-col items-center justify-center p-8 xl:p-12 text-center bg-linear-to-br from-primary/20 via-background to-secondary/20 dark:from-primary/10 dark:via-background dark:to-secondary/10 relative overflow-hidden"
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
          width={800}
          height={800}
          className="h-auto w-auto max-h-[40vh] lg:max-h-[50vh] object-contain mx-auto max-w-xl"
        />

        {/* Marketing Content */}
        <h2 className="text-2xl font-bold tracking-tight mt-6">{headline}</h2>
        <p className="text-muted-foreground text-base mt-3 max-w-md">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
