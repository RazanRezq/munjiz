# Edge Runtime Compatibility Fix ✅

## Problem Solved

**Error:** `The edge runtime does not support Node.js 'crypto' module`

This error occurred because Next.js middleware runs in Edge Runtime by default, but Auth.js with database adapters needs Node.js modules like `crypto` and `bcrypt`.

## Solution: Split Configuration

Following the [Auth.js Edge Compatibility Guide](https://authjs.dev/guides/edge-compatibility), we implemented a **split configuration** approach:

### Architecture

```
auth.config.ts (Edge Compatible)
    ↓
    Used by middleware.ts (Edge Runtime)
    Uses JWT only, no database
    ↓
auth.ts (Full Config with Database)
    ↓
    Used by server components, API routes (Node.js Runtime)
    Uses database adapter, bcrypt, etc.
```

### Files Created/Modified

1. **`auth.config.ts`** (NEW) - Edge-compatible configuration
   - No database adapter
   - No bcrypt or Node.js-specific modules
   - Just providers and callbacks
   - Can run in Edge Runtime

2. **`auth.ts`** (MODIFIED) - Full configuration
   - Extends `auth.config.ts`
   - Adds MongoDB adapter
   - Adds bcrypt for password hashing
   - Overrides Credentials provider with database access
   - Runs in Node.js runtime

3. **`middleware.ts`** (MODIFIED) - Edge-compatible middleware
   - Imports from `auth.config.ts` instead of `auth.ts`
   - Creates its own Auth.js instance without database
   - Runs in Edge Runtime (no more `runtime: "nodejs"` needed)
   - Uses JWT tokens only (no database queries)

4. **`models/User/userSchema.ts`** (FIXED)
   - Removed duplicate index declaration
   - Fixed Mongoose warning

## How It Works

### In Middleware (Edge Runtime)
```typescript
// middleware.ts
import NextAuth from "next-auth";
import authConfig from "./auth.config"; // No database!

export const { auth: middleware } = NextAuth(authConfig);
```
- Runs in Edge Runtime for better performance
- No database queries
- Only validates JWT tokens
- Fast route protection

### In Server Components/API Routes (Node.js Runtime)
```typescript
// Any server component or API route
import { auth } from "@/auth"; // Full config with database

const session = await auth();
```
- Runs in Node.js runtime
- Has database access
- Can query user info
- Can use bcrypt, crypto, etc.

## Benefits

✅ **Edge Runtime Compatibility** - Middleware can run in Edge Runtime
✅ **Better Performance** - Faster route protection without database queries
✅ **No Crypto Errors** - Edge Runtime doesn't need Node.js modules
✅ **JWT Sessions** - Fast token-based auth in middleware
✅ **Database Access** - Full access in server components and API routes

## What Changed

### Before (Broken)
- Single `auth.ts` config with database
- Middleware imported full config
- Tried to use database in Edge Runtime
- ❌ Edge Runtime error (no crypto module)

### After (Fixed)
- Split config: `auth.config.ts` (edge) + `auth.ts` (full)
- Middleware uses edge-compatible config
- Server components use full config
- ✅ Works perfectly in both runtimes

## Testing

1. **Sign Up** - Works ✅
   - Uses full config with database
   - Password hashing with bcrypt
   - User created in MongoDB

2. **Sign In** - Works ✅
   - Uses full config with database
   - Password verification with bcrypt
   - JWT token created

3. **Protected Routes** - Works ✅
   - Middleware validates JWT in Edge Runtime
   - No database queries needed
   - Fast redirects

4. **Session Access** - Works ✅
   - Server components use full config
   - Can query database if needed
   - User info available in session

## References

- [Auth.js Edge Compatibility Guide](https://authjs.dev/guides/edge-compatibility)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)
- [Auth.js Session Strategies](https://authjs.dev/concepts/session-strategies)

## Notes

- Middleware now runs in Edge Runtime (faster)
- JWT tokens are self-contained (no database lookups)
- Database queries only happen when explicitly needed
- Split config is the recommended approach for Next.js + Auth.js
