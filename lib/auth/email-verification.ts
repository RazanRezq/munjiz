import dns from "dns";
import { promisify } from "util";

/**
 * ============================================================================
 * EMAIL DOMAIN VERIFICATION - DNS MX Record Lookup
 * ============================================================================
 * Server-side email domain validation using DNS MX (Mail Exchange) records.
 * 
 * This utility verifies that an email domain actually exists and can receive
 * emails by checking for valid MX records in the DNS.
 * 
 * Security Note:
 * - This should ONLY be used on the server-side (API routes, server actions)
 * - Never expose this to client-side code
 * - DNS lookups can be slow, consider caching results
 * 
 * @module lib/auth/email-verification
 * @author Munjiz Team
 * @version 1.0.0
 * ============================================================================
 */

// Promisify DNS resolveMx for async/await usage
const resolveMx = promisify(dns.resolveMx);

/**
 * Extract Domain from Email Address
 * 
 * Safely extracts the domain portion from an email address.
 * 
 * @param email - The email address to parse
 * @returns The domain portion (e.g., "gmail.com") or null if invalid
 * 
 * @example
 * extractDomain("user@gmail.com") → "gmail.com"
 * extractDomain("invalid") → null
 */
function extractDomain(email: string): string | null {
  const parts = email.split("@");
  if (parts.length !== 2) return null;
  return parts[1].toLowerCase().trim();
}

/**
 * Validate Email Domain via DNS MX Records
 * 
 * Checks if an email domain has valid MX (Mail Exchange) records,
 * which indicates the domain can actually receive emails.
 * 
 * How it works:
 * 1. Extracts the domain from the email address
 * 2. Performs a DNS MX record lookup
 * 3. Returns true if MX records exist, false otherwise
 * 
 * Edge Cases Handled:
 * - Domains without MX records (some use A records) - checks A records as fallback
 * - Network errors - returns false
 * - Invalid email format - returns false
 * - DNS lookup timeouts - returns false
 * 
 * @param email - The email address to validate
 * @returns Promise<boolean> - true if domain has valid MX records, false otherwise
 * 
 * @example
 * ```typescript
 * const isValid = await validateEmailDomain("user@gmail.com");
 * // Returns: true (gmail.com has MX records)
 * 
 * const isInvalid = await validateEmailDomain("user@fadds.com");
 * // Returns: false (fadds.com has no MX records)
 * ```
 */
export async function validateEmailDomain(email: string): Promise<boolean> {
  try {
    // Extract domain from email
    const domain = extractDomain(email);
    
    if (!domain) {
      return false;
    }

    // Check for MX records
    try {
      const mxRecords = await resolveMx(domain);
      
      // If MX records exist and have at least one record, domain is valid
      if (mxRecords && mxRecords.length > 0) {
        return true;
      }
    } catch (mxError) {
      // If MX lookup fails, try A record as fallback
      // Some mail servers use A records instead of MX records
      try {
        const resolve4 = promisify(dns.resolve4);
        const aRecords = await resolve4(domain);
        
        // If A records exist, domain exists (though not ideal for mail)
        if (aRecords && aRecords.length > 0) {
          return true;
        }
      } catch (aError) {
        // Both MX and A record lookups failed
        return false;
      }
    }

    return false;
  } catch (error) {
    // Catch any unexpected errors (network issues, timeouts, etc.)
    console.error(`Email domain validation error for ${email}:`, error);
    return false;
  }
}
