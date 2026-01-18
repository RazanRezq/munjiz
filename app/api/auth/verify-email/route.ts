import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User/userSchema";
import { getVerificationTokenByToken, deleteVerificationToken } from "@/lib/tokens";

/**
 * Email Verification API Route
 * Verifies a user's email address using a verification token
 *
 * POST /api/auth/verify-email
 * Body: { token: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Missing verification token" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get and validate the verification token
    const verificationToken = await getVerificationTokenByToken(token);

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await User.findOne({ email: verificationToken.email });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if email is already verified
    if (user.emailVerified) {
      // Delete the token since it's no longer needed
      await deleteVerificationToken(token);

      return NextResponse.json(
        {
          success: true,
          message: "Email already verified. You can sign in now."
        },
        { status: 200 }
      );
    }

    // Update user's emailVerified field
    user.emailVerified = new Date();
    await user.save();

    // Delete the verification token after successful verification
    await deleteVerificationToken(token);

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully! You can now sign in to your account.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong during verification" },
      { status: 500 }
    );
  }
}
