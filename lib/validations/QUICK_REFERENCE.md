# Validation Quick Reference

## 🚀 Import Statements

```typescript
// Schemas
import { signInSchema, signUpSchema, registerSchema } from "@/lib/validations/auth";

// Types
import type { SignInInput, SignUpInput, RegisterInput } from "@/lib/validations/auth";

// Constants
import { PASSWORD_REQUIREMENTS, ERROR_MESSAGES, VALIDATION_RULES } from "@/lib/validations/auth";

// Zod
import { ZodError } from "zod";
```

---

## 📋 Password Requirements

```typescript
✅ Minimum: 8 characters
✅ Maximum: 100 characters
✅ One uppercase (A-Z)
✅ One lowercase (a-z)
✅ One number (0-9)
✅ One special (!@#$%^&*...)
```

**Valid Examples:**
- `MySecure123!`
- `Pa$$w0rd2024`
- `Admin@2024`

**Invalid Examples:**
- `short` → Too short
- `alllowercase123!` → No uppercase
- `ALLUPPERCASE123!` → No lowercase
- `NoNumbers!` → No number
- `NoSpecial123` → No special char

---

## 📧 Email Rules

```typescript
✅ Auto-lowercase: "USER@EXAMPLE.COM" → "user@example.com"
✅ Auto-trim: "  user@example.com  " → "user@example.com"
✅ Max length: 254 characters (RFC 5321)
✅ Valid format required
✅ Typo detection: "user@gamil.com" → Error: "Did you mean user@gmail.com?"
```

### **Email Typo Detection** 🎯

**Caught typos:**
```typescript
❌ "user@gamil.com"    → Suggests: "user@gmail.com"
❌ "user@yaho.com"     → Suggests: "user@yahoo.com"
❌ "user@hotmial.com"  → Suggests: "user@hotmail.com"
❌ "user@outlok.com"   → Suggests: "user@outlook.com"
❌ "user@icould.com"   → Suggests: "user@icloud.com"
❌ "user@gmail.con"    → Suggests: "user@gmail.com"
```

**Supported providers:** Gmail, Yahoo, Hotmail, Outlook, iCloud, ProtonMail

---

## 👤 Name Rules

```typescript
✅ Min: 2 characters
✅ Max: 50 characters
✅ Auto-trim and normalize spaces
✅ Supports ALL languages (Unicode)
✅ Blocks XSS: < > / \ { } [ ] ` |
```

**Valid Examples:**
- `John Doe`
- `María García`
- `محمد علي` (Arabic)
- `李明` (Chinese)
- `O'Reilly`
- `Jean-Claude`

**Invalid Examples:**
- `<script>` → XSS attempt
- `User{admin}` → Injection attempt
- `A` → Too short

---

## 🎨 Client-Side Usage

```typescript
"use client";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";
import { ZodError } from "zod";

const [errors, setErrors] = useState<Partial<Record<keyof SignUpInput, string>>>({});

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrors({});

  try {
    const data = signUpSchema.parse({ name, email, password, confirmPassword });
    // ✅ Data is validated & sanitized
    await submit(data);
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
```

---

## 🔧 Server-Side Usage

```typescript
import { registerSchema } from "@/lib/validations/auth";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);
    // ✅ Validated & type-safe
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        error: "Validation failed",
        details: error.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

---

## 🎯 Inline Field Validation

```typescript
// Clear error when user starts typing
<input
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    setErrors(prev => ({ ...prev, email: undefined }));
  }}
  className={errors.email ? "border-red-500" : "border-gray-300"}
/>

{errors.email && (
  <p className="text-red-500 text-sm">{errors.email}</p>
)}
```

---

## 🌍 International Name Support

```typescript
// ✅ All these are valid:
"John Doe"           // English
"María García"       // Spanish
"محمد علي"           // Arabic
"李明"                // Chinese
"Иван Иванов"        // Russian
"Müller Schmidt"     // German
"François Lefèvre"   // French
"田中太郎"            // Japanese
```

---

## 🔒 Security Checklist

```typescript
✅ Strong password enforcement
✅ XSS character blocking
✅ Email normalization
✅ Email typo detection (NEW!)
✅ Input sanitization (.trim())
✅ Length limits (DoS prevention)
✅ Server-side validation (always!)
✅ Type-safe error handling
✅ Password matching validation
```

---

## 💡 Pro Tips

### 1. Use `safeParse()` for non-throwing validation
```typescript
const result = signUpSchema.safeParse(data);
if (result.success) {
  // result.data is validated
} else {
  // result.error contains issues
}
```

### 2. Build password strength indicators
```typescript
import { PASSWORD_REQUIREMENTS } from "@/lib/validations/auth";

const checks = {
  length: password.length >= PASSWORD_REQUIREMENTS.minLength,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password),
  special: /[!@#$%^&*]/.test(password),
};

const strength = Object.values(checks).filter(Boolean).length;
```

### 3. Display helpful placeholders
```typescript
<input
  type="password"
  placeholder="Min. 8 chars, uppercase, lowercase, number, special"
/>
```

### 4. Show password requirements upfront
```typescript
<ul className="text-sm text-gray-600">
  <li>✓ At least 8 characters</li>
  <li>✓ One uppercase letter</li>
  <li>✓ One lowercase letter</li>
  <li>✓ One number</li>
  <li>✓ One special character</li>
</ul>
```

---

## 🐛 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Passwords do not match" | confirmPassword ≠ password | Ensure both fields match exactly |
| "Email address is required" | Empty email field | Add validation check |
| "Password must include..." | Weak password | Follow requirements above |
| "Name contains invalid characters" | XSS attempt | Remove < > / \ { } [ ] \` \| |
| Type errors | Missing type import | Import `SignUpInput` or `SignInInput` |

---

## 📊 Validation Flow

```
User Input
    ↓
Client-Side Validation (Zod)
    ↓
    ├─ Valid? → Send to API
    └─ Invalid? → Show field errors
              ↓
         User fixes errors
              ↓
         Submit again
              ↓
Server-Side Validation (Zod)
    ↓
    ├─ Valid? → Process & save
    └─ Invalid? → Return 400 error
```

---

## 🎓 Best Practices

1. **Always validate on both client AND server**
2. **Clear errors when user starts typing**
3. **Show helpful error messages**
4. **Use type-safe error handling**
5. **Don't block legitimate international names**
6. **Display password requirements upfront**
7. **Test with various languages and scripts**
8. **Never trust client-side validation alone**

---

## 📞 Need Help?

- **Documentation:** `lib/validations/README.md`
- **Types:** Hover over schemas in VS Code
- **Examples:** See usage in sign-in/sign-up pages
- **Team:** Contact the Munjiz development team

---

**Last Updated:** 2026-01-14
