import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { MunjizLogo } from "@/components/munjiz-logo";

const SignUpPage = () => {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="pb-8 pt-0 px-0">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <MunjizLogo iconSize={40} textSize="md" />

          {/* Header Text */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Get started</h1>
            <p className="text-muted-foreground">Create your Munjiz account</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-0">
        {/* Google Sign In Button */}
        <Button variant="outline" className="w-full h-11 gap-3" type="button">
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="font-medium">Continue with Google</span>
        </Button>

        {/* Divider with improved styling */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground font-medium tracking-wide">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Form fields with improved spacing */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-semibold leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a strong password"
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Primary CTA with enhanced styling */}
        <Button
          variant="primary"
          className="w-full h-11 font-semibold text-base shadow-sm hover:shadow-md transition-all duration-200"
          type="submit"
        >
          Create account
        </Button>

        {/* Terms text with better styling */}
        <p className="text-xs text-center text-muted-foreground/80 leading-relaxed pt-2">
          By signing up, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary transition-colors font-medium"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary transition-colors font-medium"
          >
            Privacy Policy
          </Link>
        </p>
      </CardContent>

      <CardFooter className="flex-col space-y-2 text-center text-sm pb-0 pt-6 px-0 border-0">
        <div className="text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-primary hover:underline underline-offset-4 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SignUpPage;
