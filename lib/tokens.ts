import { randomBytes } from "crypto";
import dbConnect from "@/lib/mongodb";
import VerificationToken from "@/models/VerificationToken/verificationTokenSchema";

/**
 * Generate a secure random token
 * Uses Node's crypto module to generate a cryptographically secure random token
 *
 * @returns A secure random token (32 bytes = 64 hex characters)
 */
function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Generate Verification Token
 * Creates a new verification token for email verification during registration
 *
 * How it works:
 * 1. Generates a secure random token using crypto
 * 2. Sets expiration time (1 hour from now)
 * 3. Deletes any existing tokens for this email
 * 4. Saves the new token to the database
 * 5. Returns the token object
 *
 * @param email - The email address to generate a verification token for
 * @returns The generated verification token object with email, token, and expires fields
 *
 * @example
 * ```typescript
 * const verificationToken = await generateVerificationToken("user@example.com");
 * // Send email with: verificationToken.token
 * ```
 */
export async function generateVerificationToken(email: string) {
  try {
    await dbConnect();

    // Generate secure random token
    const token = generateSecureToken();

    // Set expiration time (1 hour from now)
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour in milliseconds

    // Delete any existing tokens for this email to avoid duplicates
    await VerificationToken.deleteMany({ email: email.toLowerCase().trim() });

    // Create and save the new token
    const verificationToken = await VerificationToken.create({
      email: email.toLowerCase().trim(),
      token,
      expires,
    });

    return {
      email: verificationToken.email,
      token: verificationToken.token,
      expires: verificationToken.expires,
    };
  } catch (error) {
    console.error("Error generating verification token:", error);
    throw new Error("Failed to generate verification token");
  }
}

/**
 * Get Verification Token by Token String
 * Retrieves a verification token from the database and checks if it's valid
 *
 * @param token - The token string to look up
 * @returns The verification token if valid, null if not found or expired
 *
 * @example
 * ```typescript
 * const tokenData = await getVerificationTokenByToken(token);
 * if (!tokenData) {
 *   return { error: "Invalid or expired token" };
 * }
 * ```
 */
export async function getVerificationTokenByToken(token: string) {
  try {
    await dbConnect();

    const verificationToken = await VerificationToken.findOne({ token });

    if (!verificationToken) {
      return null;
    }

    // Check if token has expired
    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await VerificationToken.deleteOne({ _id: verificationToken._id });
      return null;
    }

    return {
      email: verificationToken.email,
      token: verificationToken.token,
      expires: verificationToken.expires,
    };
  } catch (error) {
    console.error("Error getting verification token:", error);
    return null;
  }
}

/**
 * Get Verification Token by Email
 * Retrieves the most recent verification token for an email address
 *
 * @param email - The email address to look up
 * @returns The verification token if found and valid, null otherwise
 */
export async function getVerificationTokenByEmail(email: string) {
  try {
    await dbConnect();

    const verificationToken = await VerificationToken.findOne({
      email: email.toLowerCase().trim(),
    }).sort({ createdAt: -1 }); // Get most recent token

    if (!verificationToken) {
      return null;
    }

    // Check if token has expired
    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await VerificationToken.deleteOne({ _id: verificationToken._id });
      return null;
    }

    return {
      email: verificationToken.email,
      token: verificationToken.token,
      expires: verificationToken.expires,
    };
  } catch (error) {
    console.error("Error getting verification token by email:", error);
    return null;
  }
}

/**
 * Delete Verification Token
 * Removes a verification token from the database after it's been used
 *
 * @param token - The token string to delete
 */
export async function deleteVerificationToken(token: string) {
  try {
    await dbConnect();
    await VerificationToken.deleteOne({ token });
  } catch (error) {
    console.error("Error deleting verification token:", error);
  }
}
