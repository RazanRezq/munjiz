# Authentication Validation System

## 📋 Overview

Professional, production-ready validation schemas for authentication built with **Zod v4**. This system implements industry best practices including OWASP password guidelines, internationalization support, and comprehensive security measures.

---

## 🎯 Features

### ✅ **Security**
- **OWASP-compliant password policies**
- **XSS/Injection protection** (blocks dangerous characters)
- **RFC 5321-compliant email validation**
- **Smart email typo detection** (catches common domain misspellings)
- **DoS attack prevention** (max length limits)
- **Server & client-side validation** (defense in depth)

### 🌍 **Internationalization (i18n)**
- **Unicode support** for all languages (Arabic, Chinese, Cyrillic, etc.)
- **No restrictive ASCII-only validation**
- **Cultural name format support** (spaces, hyphens, apostrophes)

### 🧹 **Data Sanitization**
- **Automatic email normalization** (lowercase, trim)
- **Whitespace normalization** (trim, collapse multiple spaces)
- **Input sanitization** (removes dangerous characters)

### 💡 **Developer Experience**
- **Type-safe** with TypeScript
- **Reusable schemas** and constants
- **User-friendly error messages**
- **Comprehensive JSDoc documentation**
- **Exported constants** for UI components

---

## 📦 Schemas

### 1. **Sign In Schema** (`signInSchema`)

**Purpose:** Validates user credentials for authentication.

**Fields:**
- `email` - Required, valid email, auto-lowercase
- `password` - Required (no complexity check on sign-in)

**Usage:**
```typescript
import { signInSchema } from "@/lib/validations/auth";

const result = signInSchema.safeParse({
  email: "  USER@EXAMPLE.COM  ",
  password: "myPassword123"
});

// result.data.email === "user@example.com"
```

---

### 2. **Sign Up Schema** (`signUpSchema`)

**Purpose:** Validates new user registration with password confirmation.

**Fields:**
- `name` - 2-50 chars, Unicode support, XSS protection
- `email` - Valid email, auto-lowercase, max 254 chars (RFC 5321)
- `password` - Strong password (see requirements below)
- `confirmPassword` - Must match password exactly

**Password Requirements:**
- ✅ Minimum 8 characters
- ✅ Maximum 100 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

**Usage:**
```typescript
import { signUpSchema } from "@/lib/validations/auth";

const result = signUpSchema.safeParse({
  name: "محمد علي",  // Arabic name supported!
  email: "muhammad@example.com",
  password: "SecurePass123!",
  confirmPassword: "SecurePass123!"
});

if (!result.success) {
  // Handle errors
  result.error.issues.forEach(issue => {
    console.log(`${issue.path}: ${issue.message}`);
  });
}
```

---

### 3. **Register Schema** (`registerSchema`)

**Purpose:** Server-side validation for registration API.

**Note:** Identical to `signUpSchema` for consistency. Always validate on the server even if client-side validation passes.

---

## 🔧 Exported Constants

### **PASSWORD_REQUIREMENTS**

Use in your UI to build password strength indicators:

```typescript
import { PASSWORD_REQUIREMENTS } from "@/lib/validations/auth";

console.log(PASSWORD_REQUIREMENTS);
// {
//   minLength: 8,
//   maxLength: 100,
//   requireUppercase: true,
//   requireLowercase: true,
//   requireNumber: true,
//   requireSpecial: true
// }
```

### **ERROR_MESSAGES**

All error messages in one place for consistency:

```typescript
import { ERROR_MESSAGES } from "@/lib/validations/auth";

console.log(ERROR_MESSAGES.PASSWORD.TOO_SHORT);
// "Password must be at least 8 characters long"
```

### **VALIDATION_RULES**

Access validation rules programmatically:

```typescript
import { VALIDATION_RULES } from "@/lib/validations/auth";

console.log(VALIDATION_RULES.PASSWORD.MIN_LENGTH); // 8
console.log(VALIDATION_RULES.NAME.MAX_LENGTH);     // 50
```

---

## 🛡️ Security Features

### 1. **XSS Protection**

Names are validated to block dangerous characters:

```typescript
// ❌ Blocked
"<script>alert('xss')</script>"  // Contains < >
"John{admin}"                    // Contains { }
"User|Root"                      // Contains |

// ✅ Allowed
"John O'Reilly"                  // Apostrophe OK
"María García-López"             // Hyphen and accents OK
"محمد علي"                       // Arabic OK
"李明"                            // Chinese OK
```

**Blocked characters:** `< > / \ { } [ ] ` | `

### 2. **Email Normalization**

Prevents duplicate accounts with case variations:

```typescript
Input:  "  USER@EXAMPLE.COM  "
Output: "user@example.com"
```

### 3. **Password Security**

- **No trimming** - Preserves exact user input (spaces are valid in passwords)
- **Length limits** - Prevents DoS attacks
- **Complexity requirements** - Forces strong passwords
- **Server-side hashing** - Never store plain text

### 4. **Email Typo Detection** 🎯

**NEW FEATURE:** Automatically detects and suggests corrections for common email domain typos.

**How it works:**
```typescript
// User types a common typo
Input: "user@gamil.com"
Error: "Did you mean user@gmail.com? Please check your email address."

// User types correctly
Input: "user@gmail.com"
Result: ✅ Valid
```

**Catches common typos for:**

| Provider | Common Typos Detected |
|----------|----------------------|
| **Gmail** | gamil.com, gmial.com, gmai.com, gmil.com, gmaill.com, gnail.com |
| **Yahoo** | yaho.com, yahooo.com, yhoo.com, yahhoo.com, yaboo.com |
| **Hotmail** | hotmial.com, hotmil.com, hotmal.com, hotmaii.com, hotmeil.com |
| **Outlook** | outlok.com, outloook.com, outluk.com, outllook.com |
| **iCloud** | icould.com, iclod.com, icloude.com, iclould.com |
| **ProtonMail** | protonmial.com, protonmai.com, protonmali.com |
| **TLD Typos** | .con instead of .com, .cpm instead of .com |

**Benefits:**
- ✅ Prevents user account creation with invalid emails
- ✅ Reduces support tickets for "I can't receive emails"
- ✅ Improves user experience with helpful suggestions
- ✅ Lightweight (no external dependencies)

**Example error message:**
```
❌ "user@gamil.com"
→ "Did you mean user@gmail.com? Please check your email address."
```

### 5. **DoS Prevention**

Maximum length limits prevent resource exhaustion:
- Email: 254 characters (RFC 5321 standard)
- Password: 100 characters
- Name: 50 characters

---

## 📝 Usage Examples

### Client-Side Form Validation

```typescript
"use client";

import { useState } from "react";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";
import { ZodError } from "zod";

export default function SignUpForm() {
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpInput, string>>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const formData = signUpSchema.parse({
        name: nameInput,
        email: emailInput,
        password: passwordInput,
        confirmPassword: confirmPasswordInput,
      });

      // Data is now validated and sanitized
      await registerUser(formData);
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Partial<Record<keyof SignUpInput, string>> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof SignUpInput] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };
}
```

### Server-Side API Validation

```typescript
import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate with Zod
    const validatedData = registerSchema.parse(body);
    
    // Data is now type-safe and sanitized
    // validatedData.email is guaranteed to be lowercase
    // validatedData.name is guaranteed to be trimmed
    
    await createUser(validatedData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: error.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## 🌍 Internationalization Examples

Our validation supports **ALL** languages and scripts:

### Supported Names

| Language | Example | Status |
|----------|---------|--------|
| English | John Doe | ✅ Valid |
| Spanish | María García | ✅ Valid |
| Arabic | محمد علي | ✅ Valid |
| Chinese | 李明 | ✅ Valid |
| Russian | Иван Иванов | ✅ Valid |
| Turkish | Erdoğan Yılmaz | ✅ Valid |
| French | François Lefèvre | ✅ Valid |
| German | Müller Schmidt | ✅ Valid |
| Japanese | 田中太郎 | ✅ Valid |
| Korean | 김민준 | ✅ Valid |

### Name Formatting

The system automatically:
- Removes leading/trailing spaces
- Collapses multiple spaces into one
- Preserves Unicode characters
- Blocks injection attempts

```typescript
Input:  "  John    Doe  "
Output: "John Doe"

Input:  "محمد   علي"
Output: "محمد علي"
```

---

## 🔍 Error Handling Best Practices

### 1. **User-Friendly Messages**

All error messages are clear and actionable:

```typescript
// ❌ Bad
"Invalid input"

// ✅ Good (Our implementation)
"Password must include at least one uppercase letter (A-Z)"
```

### 2. **Field-Specific Errors**

Errors are mapped to specific fields:

```typescript
{
  name: "Name must be at least 2 characters",
  email: undefined,
  password: "Password must include at least one number (0-9)",
  confirmPassword: undefined
}
```

### 3. **Progressive Disclosure**

Show errors **as the user types** for better UX:

```typescript
onChange={(e) => {
  setEmail(e.target.value);
  // Clear error for this field
  setErrors(prev => ({ ...prev, email: undefined }));
}}
```

---

## 🧪 Testing

### Valid Test Cases

```typescript
// Test 1: English name
signUpSchema.parse({
  name: "John Doe",
  email: "john@example.com",
  password: "SecurePass123!",
  confirmPassword: "SecurePass123!"
}); // ✅ Pass

// Test 2: International name
signUpSchema.parse({
  name: "محمد علي",
  email: "muhammad@example.com",
  password: "ArabicPass123!",
  confirmPassword: "ArabicPass123!"
}); // ✅ Pass

// Test 3: Email normalization
const result = signUpSchema.parse({
  name: "Test User",
  email: "  TEST@EXAMPLE.COM  ",
  password: "TestPass123!",
  confirmPassword: "TestPass123!"
});
console.log(result.email); // "test@example.com" ✅
```

### Invalid Test Cases

```typescript
// Test 1: Weak password
signUpSchema.parse({
  name: "John Doe",
  email: "john@example.com",
  password: "weak",
  confirmPassword: "weak"
}); // ❌ Throws: "Password must be at least 8 characters long"

// Test 2: Password mismatch
signUpSchema.parse({
  name: "John Doe",
  email: "john@example.com",
  password: "SecurePass123!",
  confirmPassword: "SecurePass123"
}); // ❌ Throws: "Passwords do not match. Please check and try again"

// Test 3: XSS attempt
signUpSchema.parse({
  name: "<script>alert('xss')</script>",
  email: "hacker@example.com",
  password: "HackPass123!",
  confirmPassword: "HackPass123!"
}); // ❌ Throws: "Name contains invalid characters..."
```

---

## 📚 References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [RFC 5321 - Email Address Specification](https://datatracker.ietf.org/doc/html/rfc5321)
- [Zod Documentation](https://zod.dev/)
- [Unicode in Passwords](https://www.unicode.org/reports/tr36/)

---

## 🔄 Version History

**v2.0.0** (Current)
- ✅ Professional-grade validation with OWASP compliance
- ✅ Full internationalization support
- ✅ Comprehensive security measures
- ✅ Improved error messages
- ✅ Exported constants for UI integration
- ✅ Complete TypeScript support

**v1.0.0**
- Basic validation with Zod
- English-only name support
- Simple password requirements

---

## 👥 Contributing

When adding new validation rules:

1. **Add constants** to `VALIDATION_RULES`
2. **Add error messages** to `ERROR_MESSAGES`
3. **Document with JSDoc**
4. **Add tests** for edge cases
5. **Update this README**

---

## 📞 Support

For questions or issues, contact the development team or open an issue in the project repository.

---

**Built with ❤️ by the Munjiz Team**
