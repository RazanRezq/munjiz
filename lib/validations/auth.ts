import { z } from "zod";

/**
 * ============================================================================
 * AUTH VALIDATION SCHEMAS
 * ============================================================================
 * Professional, production-ready validation schemas for authentication
 * 
 * Features:
 * - Strict password policies (OWASP compliant)
 * - Internationalization support (i18n)
 * - XSS/injection protection
 * - Email normalization
 * - Input sanitization
 * - Type-safe error handling
 * 
 * @module lib/validations/auth
 * @author Munjiz Team
 * @version 2.0.0
 * ============================================================================
 */

// ============================================================================
// CONSTANTS - Validation Rules
// ============================================================================

const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
    REGEX: {
      UPPERCASE: /[A-Z]/,
      LOWERCASE: /[a-z]/,
      NUMBER: /\d/,
      SPECIAL: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/,
    },
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    FORBIDDEN_CHARS: /[<>/\\{}[\]`|]/,
  },
  EMAIL: {
    MAX_LENGTH: 254, // RFC 5321 compliant
  },
} as const;

// ============================================================================
// ERROR MESSAGES - User-Friendly & Actionable
// ============================================================================

const ERROR_MESSAGES = {
  EMAIL: {
    REQUIRED: "Email address is required",
    INVALID: "Please enter a valid email address (e.g., user@example.com)",
    TOO_LONG: `Email address cannot exceed ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters`,
  },
  PASSWORD: {
    REQUIRED: "Password is required",
    TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long`,
    TOO_LONG: `Password cannot exceed ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`,
    NO_UPPERCASE: "Password must include at least one uppercase letter (A-Z)",
    NO_LOWERCASE: "Password must include at least one lowercase letter (a-z)",
    NO_NUMBER: "Password must include at least one number (0-9)",
    NO_SPECIAL: "Password must include at least one special character (!@#$%^&*...)",
    MISMATCH: "Passwords do not match. Please check and try again",
  },
  NAME: {
    REQUIRED: "Full name is required",
    TOO_SHORT: `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`,
    TOO_LONG: `Name cannot exceed ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`,
    INVALID_CHARS: "Name contains invalid characters. Please remove: < > / \\ { } [ ] ` |",
    EMPTY: "Name cannot be empty or consist only of spaces",
  },
  CONFIRM_PASSWORD: {
    REQUIRED: "Please confirm your password",
  },
} as const;

// ============================================================================
// EMAIL TYPO DETECTION - Common Domain Misspellings
// ============================================================================

/**
 * Domain Typo Correction Map
 * 
 * Maps common misspellings to their correct email provider domains.
 * This helps users avoid account creation with invalid email addresses.
 * 
 * @example
 * "gamil.com" → "gmail.com"
 * "yaho.com" → "yahoo.com"
 */
const DOMAIN_TYPO_MAP: Record<string, string> = {
  // Gmail variations
  "gamil.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmil.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmails.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmaul.com": "gmail.com",
  
  // Yahoo variations
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yhoo.com": "yahoo.com",
  "yahhoo.com": "yahoo.com",
  "yaboo.com": "yahoo.com",
  "yahou.com": "yahoo.com",
  
  // Hotmail variations
  "hotmial.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmaii.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "hotmeil.com": "hotmail.com",
  "hotmali.com": "hotmail.com",
  
  // Outlook variations
  "outlok.com": "outlook.com",
  "outloook.com": "outlook.com",
  "outluk.com": "outlook.com",
  "outllook.com": "outlook.com",
  "outtlook.com": "outlook.com",
  "outlouk.com": "outlook.com",
  
  // iCloud variations
  "icould.com": "icloud.com",
  "iclod.com": "icloud.com",
  "icloud.con": "icloud.com",
  "icloude.com": "icloud.com",
  "iclould.com": "icloud.com",
  
  // ProtonMail variations
  "protonmial.com": "protonmail.com",
  "protonmai.com": "protonmail.com",
  "protonmali.com": "protonmail.com",
  "protonmeil.com": "protonmail.com",
  
  // Common TLD typos
  "gmail.con": "gmail.com",
  "yahoo.con": "yahoo.com",
  "hotmail.con": "hotmail.com",
  "outlook.con": "outlook.com",
  "gmail.cpm": "gmail.com",
  "yahoo.cpm": "yahoo.com",
  "gmail.co": "gmail.com",
  "yahoo.co": "yahoo.com",
} as const;

/**
 * Extract Domain from Email
 * 
 * Safely extracts the domain portion of an email address.
 * 
 * @param email - The email address to parse
 * @returns The domain portion (e.g., "gmail.com") or null if invalid
 * 
 * @example
 * extractDomain("user@gmail.com") → "gmail.com"
 * extractDomain("invalid") → null
 */
const extractDomain = (email: string): string | null => {
  const parts = email.split("@");
  if (parts.length !== 2) return null;
  return parts[1].toLowerCase();
};

// ============================================================================
// REUSABLE VALIDATION SCHEMAS
// ============================================================================

/**
 * Email Schema with Typo Detection
 * 
 * Features:
 * - RFC 5321 compliant length validation
 * - Automatic trimming of whitespace
 * - Case normalization (lowercase)
 * - Domain validation via Zod's built-in email validator
 * - **Smart typo detection** for common email provider misspellings
 * - Helpful error messages with domain suggestions
 * 
 * Typo Detection:
 * - Catches common misspellings (e.g., gamil.com → gmail.com)
 * - Provides actionable error messages
 * - Prevents registration with invalid email addresses
 * 
 * @example
 * Input:  "  USER@EXAMPLE.COM  "
 * Output: "user@example.com" ✅
 * 
 * @example
 * Input:  "user@gamil.com"
 * Error:  "Did you mean user@gmail.com?" ❌
 */
const emailSchema = z
  .string()
  .trim()
  .min(1, ERROR_MESSAGES.EMAIL.REQUIRED)
  .max(VALIDATION_RULES.EMAIL.MAX_LENGTH, ERROR_MESSAGES.EMAIL.TOO_LONG)
  .email(ERROR_MESSAGES.EMAIL.INVALID)
  .toLowerCase()
  .transform((email) => email.trim())
  .superRefine((email, ctx) => {
    // Extract domain from email
    const domain = extractDomain(email);
    
    if (!domain) return; // Let the email() validator handle this
    
    // Check if domain is a known typo
    const correctDomain = DOMAIN_TYPO_MAP[domain];
    
    if (correctDomain) {
      // Extract username part
      const username = email.split("@")[0];
      const suggestedEmail = `${username}@${correctDomain}`;
      
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Did you mean ${suggestedEmail}? Please check your email address.`,
      });
    }
  });

/**
 * Name Schema - Internationalization (i18n) Friendly
 * 
 * Features:
 * - Supports Unicode (Arabic, Chinese, Cyrillic, etc.)
 * - XSS/injection protection
 * - Whitespace normalization
 * - No restrictive ASCII-only validation
 * 
 * Allowed:
 * - Any Unicode letters and numbers
 * - Spaces, hyphens, apostrophes, periods
 * - International characters (é, ñ, ü, 李, محمد, etc.)
 * 
 * Blocked (Security):
 * - HTML/XML tags: < > / \
 * - Code injection: { } [ ] ` |
 * 
 * @example
 * Valid: "John Doe", "María García", "李明", "محمد علي"
 * Invalid: "<script>", "John{test}", "User|Admin"
 */
const nameSchema = z
  .string()
  .trim()
  .min(1, ERROR_MESSAGES.NAME.REQUIRED)
  .min(VALIDATION_RULES.NAME.MIN_LENGTH, ERROR_MESSAGES.NAME.TOO_SHORT)
  .max(VALIDATION_RULES.NAME.MAX_LENGTH, ERROR_MESSAGES.NAME.TOO_LONG)
  .refine((name) => name.trim().length >= VALIDATION_RULES.NAME.MIN_LENGTH, {
    message: ERROR_MESSAGES.NAME.EMPTY,
  })
  .refine((name) => !VALIDATION_RULES.NAME.FORBIDDEN_CHARS.test(name), {
    message: ERROR_MESSAGES.NAME.INVALID_CHARS,
  })
  .transform((name) => name.trim().replace(/\s+/g, " ")); // Normalize multiple spaces

/**
 * Password Schema - OWASP Compliant
 * 
 * Implements OWASP password requirements:
 * - Minimum 8 characters (recommended minimum)
 * - Maximum 100 characters (prevents DoS attacks)
 * - Complexity requirements:
 *   ✓ At least one uppercase letter
 *   ✓ At least one lowercase letter
 *   ✓ At least one number
 *   ✓ At least one special character
 * 
 * Security Notes:
 * - No trim() to preserve exact user input
 * - No length normalization
 * - Validates strength before hashing
 * 
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
 */
const passwordSchema = z
  .string()
  .min(1, ERROR_MESSAGES.PASSWORD.REQUIRED)
  .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, ERROR_MESSAGES.PASSWORD.TOO_SHORT)
  .max(VALIDATION_RULES.PASSWORD.MAX_LENGTH, ERROR_MESSAGES.PASSWORD.TOO_LONG)
  .regex(VALIDATION_RULES.PASSWORD.REGEX.UPPERCASE, ERROR_MESSAGES.PASSWORD.NO_UPPERCASE)
  .regex(VALIDATION_RULES.PASSWORD.REGEX.LOWERCASE, ERROR_MESSAGES.PASSWORD.NO_LOWERCASE)
  .regex(VALIDATION_RULES.PASSWORD.REGEX.NUMBER, ERROR_MESSAGES.PASSWORD.NO_NUMBER)
  .regex(VALIDATION_RULES.PASSWORD.REGEX.SPECIAL, ERROR_MESSAGES.PASSWORD.NO_SPECIAL);

/**
 * Password Confirmation Schema
 * 
 * Simple string validation for password confirmation field.
 * Actual matching logic is handled in the parent schema's refine().
 */
const confirmPasswordSchema = z
  .string()
  .min(1, ERROR_MESSAGES.CONFIRM_PASSWORD.REQUIRED);

// ============================================================================
// PUBLIC SCHEMAS - Export for Use in Components
// ============================================================================

/**
 * Sign In Schema
 * 
 * Validates user credentials for authentication.
 * Password complexity is NOT validated on sign-in (only on registration).
 * 
 * @example
 * ```typescript
 * const result = signInSchema.safeParse({ email, password });
 * if (!result.success) {
 *   console.error(result.error.issues);
 * }
 * ```
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, ERROR_MESSAGES.PASSWORD.REQUIRED),
});

export type SignInInput = z.infer<typeof signInSchema>;

/**
 * Sign Up Schema
 * 
 * Validates new user registration with password confirmation.
 * Includes cross-field validation for password matching.
 * 
 * Features:
 * - Full name validation (i18n friendly)
 * - Email normalization and validation
 * - Strong password policy enforcement
 * - Password confirmation matching
 * - Type-safe error paths
 * 
 * @example
 * ```typescript
 * const result = signUpSchema.safeParse({
 *   name: "John Doe",
 *   email: "john@example.com",
 *   password: "MySecure123!",
 *   confirmPassword: "MySecure123!"
 * });
 * ```
 */
export const signUpSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ERROR_MESSAGES.PASSWORD.MISMATCH,
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * Register Schema (Server-Side)
 * 
 * Identical to signUpSchema for consistency between client and server.
 * Used in API routes to validate registration requests.
 * 
 * Security Note:
 * Always validate on the server even if client-side validation passes.
 * Client-side validation can be bypassed by malicious users.
 */
export const registerSchema = signUpSchema;

export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================================================
// EXPORTS - Constants for External Use
// ============================================================================

/**
 * Export validation rules for use in UI (e.g., password strength indicators)
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
  maxLength: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
} as const;

/**
 * Export error messages for consistent error handling
 */
export { ERROR_MESSAGES };

/**
 * Export validation rules for reference
 */
export { VALIDATION_RULES };
