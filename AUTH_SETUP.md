# Auth.js Setup Complete ✅

Your Munjiz project now has a complete authentication system using Auth.js (NextAuth.js v5).

## 🎉 What's Been Set Up

### 1. **Packages Installed**
- ✅ `next-auth@5.0.0-beta.30` - Auth.js v5
- ✅ `bcryptjs@3.0.3` - Password hashing
- ✅ `@types/bcryptjs@3.0.0` - TypeScript types
- ✅ `@auth/mongodb-adapter@3.11.1` - MongoDB adapter (already installed)

### 2. **Files Created**

#### Models
- **`models/User/userSchema.ts`** - User model with Mongoose
  - Stores user credentials, profile info, and role
  - Email uniqueness enforced
  - Password hashing support

#### Configuration (Split Config for Edge Compatibility)
- **`auth.config.ts`** - Edge-compatible Auth.js configuration
  - Used in middleware (Edge Runtime)
  - No database adapter (JWT only)
  - Providers configuration
  - Authorization callbacks

- **`auth.ts`** - Full Auth.js configuration with database
  - Extends `auth.config.ts`
  - Credentials provider with database access
  - Google OAuth provider
  - JWT session strategy
  - MongoDB adapter integration
  - Used in server components, API routes

#### API Routes
- **`app/api/auth/[...nextauth]/route.ts`** - Auth.js API handler
- **`app/api/register/route.ts`** - User registration endpoint
  - Password validation (min 6 characters)
  - Email uniqueness check
  - Password hashing with bcrypt

#### Middleware
- **`middleware.ts`** - Edge-compatible route protection
  - Uses `auth.config.ts` (no database)
  - Runs in Edge Runtime for better performance
  - Protects `/dashboard`, `/projects`, `/tasks`
  - Redirects unauthenticated users to sign-in
  - Redirects authenticated users away from auth pages
  - Uses JWT tokens only (no database queries)

#### Pages
- **`app/(auth)/sign-in/page.tsx`** - Sign-in page
  - Email/password authentication
  - Google OAuth button
  - Error handling
  - Auto-redirect to dashboard

- **`app/(auth)/sign-up/page.tsx`** - Sign-up page
  - User registration with name, email, password
  - Google OAuth button
  - Auto sign-in after registration
  - Form validation

- **`app/dashboard/page.tsx`** - Protected dashboard
  - Displays user info from session
  - Sign-out functionality
  - Server component with auth check

#### Types
- **`types/next-auth.d.ts`** - TypeScript declarations
  - Extends Auth.js types with custom fields

#### Updated Files
- **`lib/mongodb.ts`** - Added MongoDB client for Auth.js adapter
- **`models/index.ts`** - Exports User model
- **`app/layout.tsx`** - Added SessionProvider

## 🔐 Environment Variables Required

Create a `.env.local` file in the root directory with:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Auth.js Configuration (REQUIRED)
AUTH_SECRET=your_random_secret_here  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Optional - only if you want Google Sign-in)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### Generate AUTH_SECRET:
```bash
openssl rand -base64 32
```

## 🚀 How to Use

### 1. **Sign Up Flow**
- User visits `/sign-up`
- Fills in name, email, password
- Click "Create account"
- System creates user with hashed password
- Auto signs in and redirects to `/dashboard`

### 2. **Sign In Flow**
- User visits `/sign-in`
- Enters email and password
- Click "Sign in"
- Redirects to `/dashboard` on success

### 3. **Google OAuth**
- Click "Continue with Google" on sign-in or sign-up
- Redirected to Google for authentication
- Returns to `/dashboard` on success

### 4. **Protected Routes**
- Dashboard and other protected routes require authentication
- Middleware automatically redirects to `/sign-in` if not authenticated

### 5. **Sign Out**
- Click "Sign Out" button on dashboard
- Session cleared, redirected to `/sign-in`

## 🔑 Using Auth in Your Code

### Server Components (Recommended)
```typescript
import { auth } from "@/auth";

export default async function MyPage() {
  const session = await auth();
  
  if (!session?.user) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Hello {session.user.name}!</div>;
}
```

### Client Components
```typescript
"use client";
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return <div>Not authenticated</div>;
  }
  
  return <div>Hello {session.user.name}!</div>;
}
```

### API Routes
```typescript
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return Response.json({ user: session.user });
}
```

## 📊 Database Collections

Auth.js will create these MongoDB collections:
- **`users`** - User accounts
- **`accounts`** - OAuth provider accounts
- **`sessions`** - User sessions (when using database strategy)
- **`verification_tokens`** - Email verification tokens

## 🎨 Features Implemented

✅ Email/password authentication
✅ Google OAuth (configured, needs credentials)
✅ Password hashing with bcrypt
✅ JWT sessions
✅ Route protection with middleware
✅ Auto-redirect after authentication
✅ User registration API
✅ Sign out functionality
✅ TypeScript support
✅ Error handling
✅ Loading states

## 🔧 Next Steps

1. **Add your MongoDB URI** to `.env.local`
2. **Generate AUTH_SECRET** and add to `.env.local`
3. **(Optional) Set up Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project
   - Enable Google+ API
   - Create OAuth credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`

4. **Test the authentication:**
   ```bash
   bun dev
   ```
   - Visit `http://localhost:3000/sign-up`
   - Create an account
   - Try signing in and out

## 📝 Notes

- **Split Config Architecture**: Uses separate configs for edge (middleware) and Node.js (API routes)
- **Edge Compatible**: Middleware runs in Edge Runtime for better performance
- **JWT Sessions**: No database queries in middleware, only JWT validation
- Passwords are hashed with bcrypt (10 rounds)
- Minimum password length: 6 characters
- Email addresses are stored in lowercase
- Middleware protects routes automatically

## 🆘 Troubleshooting

### MongoDB Connection Issues
- Make sure `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (allow all: `0.0.0.0/0`)
- Verify database user has read/write permissions

### Google OAuth Not Working
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check authorized redirect URIs in Google Console
- Make sure `NEXTAUTH_URL` matches your domain

### Session Issues
- Make sure `AUTH_SECRET` is set
- Clear browser cookies and try again
- Check that middleware is running

## 📚 Resources

- [Auth.js Documentation](https://authjs.dev)
- [Next.js App Router Auth](https://authjs.dev/getting-started/installation?framework=next.js)
- [MongoDB Adapter](https://authjs.dev/reference/adapter/mongodb)
