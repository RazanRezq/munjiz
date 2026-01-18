import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import { clientPromise } from "@/lib/mongodb";
import User from "@/models/User/userSchema";
import dbConnect from "@/lib/mongodb";
import authConfig from "./auth.config";
import { signInSchema } from "@/lib/validations/auth";

/**
 * Full Auth.js configuration with database adapter
 * This is used in server components, API routes, etc.
 * NOT used in middleware (which uses auth.config.ts only)
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt", // Using JWT to avoid database calls in middleware
  },
  providers: [
    ...authConfig.providers,
    // Add Credentials provider with database access (not in auth.config.ts)
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("🔐 Authorize called with email:", credentials?.email);

          // Validate credentials with Zod
          const validatedCredentials = signInSchema.safeParse(credentials);
          
          if (!validatedCredentials.success) {
            console.log("❌ Invalid credentials format");
            return null;
          }

          await dbConnect();

          // Use validated and normalized email
          const email = validatedCredentials.data.email;
          const user = await User.findOne({ email });

          console.log("👤 User found:", user ? "Yes" : "No");

          if (!user || !user.password) {
            console.log("❌ User not found or no password");
            return null;
          }

          // Check if email is verified
          if (!user.emailVerified) {
            console.log("❌ Email not verified");
            throw new Error("EmailNotVerified");
          }

          const isPasswordValid = await bcrypt.compare(
            validatedCredentials.data.password,
            user.password
          );

          console.log("🔑 Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("❌ Invalid password");
            return null;
          }

          console.log("✅ Authentication successful");
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("❌ Authorize error:", error);
          return null;
        }
      },
    }),
  ],
});
