# 🎓 Quick Start: College Email Verification

## TL;DR - 3 Steps to Enable

### 1. Add Your College Domains

Edit `services/emailVerificationService.ts`:

```typescript
const ALLOWED_COLLEGE_DOMAINS: string[] = [
    'yourcollege.edu',      // ← Add your college domain
    'student.college.ac.in',// ← Add more domains
    // ... existing domains
];

export const DOMAIN_TO_COLLEGE_MAP: { [domain: string]: string } = {
    'yourcollege.edu': 'Your College Name',  // ← Map domain to college name
    'student.college.ac.in': 'Your College Name',
    // ... existing mappings
};
```

### 2. (Optional) Enable email confirmation in Supabase

Go to: **Supabase Dashboard → Authentication → Settings → Email**

Enable: ☑️ **Confirm email**

This sends a verification link to the user's inbox.

### 3. Test it!

```bash
npm run dev
```

Try signing up with:
- ✅ Valid email: `student@yourcollege.edu` → Should work
- ❌ Invalid email: `user@gmail.com` → Should show error

---

## What Happens Now?

### Sign Up Flow

1. **User enters email** → Real-time validation
   - Invalid domain → ❌ "Email not recognized"
   - Valid domain → ✅ "YourCollege email detected"

2. **User creates account** → Auto-detection
   - College field auto-populated based on email
   - User only selects department

3. **User confirms email** (if enabled in Supabase)
   - Clicks link in inbox
   - Account activated

### User Experience

**Sign Up Screen:**
```
┌──────────────────────────────────────┐
│  🎓 Only college students can join   │
└──────────────────────────────────────┘

Email: student@yourcollege.edu
       ✓ Your College Name email detected
       
[Continue] ← Button enabled only for valid emails
```

**Onboarding Screen:**
```
College: [Your College Name  ▼]  ← Auto-filled!
Department: [Select...       ▼]  ← User selects
```

---

## Common Domains to Add

### Indian Universities
```typescript
'iitm.ac.in',       // IIT Madras
'iitb.ac.in',       // IIT Bombay
'iitd.ac.in',       // IIT Delhi
'bits-pilani.ac.in',// BITS Pilani
'vit.ac.in',        // VIT
'annauniv.edu',     // Anna University
```

### US Universities
```typescript
'stanford.edu',     // Stanford
'berkeley.edu',     // UC Berkeley
'mit.edu',          // MIT
'student.harvard.edu', // Harvard (students use subdomain)
```

### Generic Patterns
```typescript
'college.edu',
'student.college.edu',
'mail.college.ac.in',
'collegeId.college.org',
```

---

## FAQ

### Q: What if my college uses multiple domains?

**A:** Add all of them!

```typescript
const ALLOWED_COLLEGE_DOMAINS = [
    'college.edu',           // Main domain
    'student.college.edu',   // Student subdomain
    'mail.college.edu',      // Alternate mail domain
];

// Map all to same college
export const DOMAIN_TO_COLLEGE_MAP = {
    'college.edu': 'My College',
    'student.college.edu': 'My College',
    'mail.college.edu': 'My College',
};
```

### Q: Can users still use personal emails?

**A:** No. Only college emails from `ALLOWED_COLLEGE_DOMAINS` are accepted.

If you want to allow anyone, remove the validation from `SignUpView.tsx`:

```typescript
// Comment out or remove:
const emailValidation = emailVerificationService.getEmailValidationError(email);
if (emailValidation) {
    setError(emailValidation);
    return;
}
```

### Q: How do I test without a college email?

**A:** Two options:

1. **Add a test domain:**
```typescript
const ALLOWED_COLLEGE_DOMAINS = [
    'test.com',  // For testing only
    // ... real domains
];
```

2. **Temporarily disable validation** (dev only):
```typescript
// In SignUpView.tsx, comment out validation:
// const emailValidation = emailVerificationService.getEmailValidationError(email);
```

### Q: Will existing users be affected?

**A:** No! Existing users can still login. Only new signups require college emails.

If you want to force existing users to verify:
- Add a migration in `userService.ts`
- Show verification modal on next login

---

## Next Steps

1. ✅ Add your college domains
2. ✅ Test signup flow
3. ✅ (Optional) Enable Supabase email confirmation
4. ⏭️ Read full docs: `docs/COLLEGE_EMAIL_VERIFICATION.md`

---

**That's it! Your app now only accepts verified college students 🎓**
