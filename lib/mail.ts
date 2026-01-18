import { Resend } from "resend";

/**
 * Initialize Resend client
 * Uses the RESEND_API_KEY from environment variables
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Get the application base URL
 * Uses NEXTAUTH_URL for consistency with auth configuration
 */
const getBaseUrl = () => {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

/**
 * Send Verification Email
 * Sends an email with a verification link to confirm the user's email address
 *
 * In development mode with Resend test domain, emails can only be sent to verified addresses.
 * If sending fails, the verification link is logged to console for testing.
 *
 * @param email - The recipient's email address
 * @param token - The verification token to include in the link
 *
 * @example
 * ```typescript
 * await sendVerificationEmail("user@example.com", "abc123token");
 * ```
 */
export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = getBaseUrl();
  const verificationLink = `${baseUrl}/new-verification?token=${token}`;

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === "development";

  try {
    const { data, error } = await resend.emails.send({
      from: "Munjiz <noreply@munjiz.app>",
      to: email,
      subject: "Verify your email address",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify your email</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">

                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                          Verify Your Email
                        </h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                          Hello,
                        </p>
                        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                          Thank you for signing up for <strong>Munjiz</strong>! To complete your registration and activate your account, please verify your email address by clicking the button below.
                        </p>

                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="${verificationLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                                Verify Email Address
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                          If the button doesn't work, you can copy and paste this link into your browser:
                        </p>
                        <p style="margin: 10px 0 0; color: #667eea; font-size: 13px; word-break: break-all; line-height: 1.6;">
                          ${verificationLink}
                        </p>

                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e5e5;">

                        <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                          This verification link will expire in <strong>1 hour</strong>. If you didn't create an account with Munjiz, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
                        <p style="margin: 0 0 10px; color: #666666; font-size: 13px;">
                          © ${new Date().getFullYear()} Munjiz. All rights reserved.
                        </p>
                        <p style="margin: 0; color: #999999; font-size: 12px;">
                          You're receiving this email because you registered for a Munjiz account.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending verification email:", error);

      // In development, if email fails (e.g., Resend test restrictions), log the link
      if (isDevelopment) {
        console.log("\n" + "=".repeat(80));
        console.log("📧 EMAIL DELIVERY FAILED - DEVELOPMENT MODE");
        console.log("=".repeat(80));
        console.log(`To: ${email}`);
        console.log(`Subject: Verify your email address`);
        console.log("\nVerification Link:");
        console.log(`\n🔗 ${verificationLink}\n`);
        console.log("=".repeat(80) + "\n");

        // Don't throw error in development - user can still verify via console link
        return { id: "dev-mode", message: "Verification link logged to console" };
      }

      throw new Error("Failed to send verification email");
    }

    console.log("Verification email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in sendVerificationEmail:", error);

    // In development, provide a fallback
    if (isDevelopment) {
      console.log("\n" + "=".repeat(80));
      console.log("📧 EMAIL SENDING ERROR - DEVELOPMENT MODE FALLBACK");
      console.log("=".repeat(80));
      console.log(`To: ${email}`);
      console.log("\nVerification Link:");
      console.log(`\n🔗 ${verificationLink}\n`);
      console.log("Copy this link to verify your email address.");
      console.log("=".repeat(80) + "\n");

      // Return success in development mode
      return { id: "dev-mode-fallback", message: "Verification link logged to console" };
    }

    throw error;
  }
}

/**
 * Send Password Reset Email
 * Sends an email with a link to reset the user's password
 *
 * @param email - The recipient's email address
 * @param token - The password reset token to include in the link
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = getBaseUrl();
  const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Munjiz <noreply@munjiz.app>",
      to: email,
      subject: "Reset your password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset your password</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">

                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                          Reset Your Password
                        </h1>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                          Hello,
                        </p>
                        <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                          We received a request to reset your password. Click the button below to choose a new password.
                        </p>

                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="${resetLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                          If the button doesn't work, you can copy and paste this link into your browser:
                        </p>
                        <p style="margin: 10px 0 0; color: #f5576c; font-size: 13px; word-break: break-all; line-height: 1.6;">
                          ${resetLink}
                        </p>

                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e5e5;">

                        <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                          This password reset link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
                        <p style="margin: 0 0 10px; color: #666666; font-size: 13px;">
                          © ${new Date().getFullYear()} Munjiz. All rights reserved.
                        </p>
                        <p style="margin: 0; color: #999999; font-size: 12px;">
                          This email was sent because a password reset was requested for your account.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Failed to send password reset email");
    }

    console.log("Password reset email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in sendPasswordResetEmail:", error);
    throw error;
  }
}
