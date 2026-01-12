import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define protected routes
// Any route starting with /dashboard, /admin, or /forum will be protected
// (.*) acts as a wildcard for any sub-paths
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/forum(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. Check the request
  // If the route is within the defined protected areas...
  if (isProtectedRoute(req)) {
    // ... force authentication (redirect to sign-in if not logged in)
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
