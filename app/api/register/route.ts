import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User/userSchema";
import dbConnect from "@/lib/mongodb";
import { registerSchema } from "@/lib/validations/auth";
import { ZodError } from "zod";
import { validateEmailDomain } from "@/lib/auth/email-verification";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body with Zod
    const validatedData = registerSchema.parse(body);

    // Validate email domain
    const isDomainValid = await validateEmailDomain(validatedData.email);
    if (!isDomainValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: [
            {
              field: "email",
              message: "This email domain does not exist or cannot receive emails. Please use a valid email provider."
            }
          ]
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user (email not verified yet)
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: "user",
      emailVerified: null, // Will be set when user verifies email
    });

    // Generate verification token
    const verificationToken = await generateVerificationToken(validatedData.email);

    // Send verification email
    await sendVerificationEmail(validatedData.email, verificationToken.token);

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful! Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      // Return detailed validation errors
      const fieldErrors = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: fieldErrors 
        },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong during registration" },
      { status: 500 }
    );
  }
}
