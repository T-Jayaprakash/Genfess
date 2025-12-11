# 🎓 College Email Verification System

## Overview

LastBench now requires users to sign up with verified college email addresses, similar to how UNIDAYS authenticates students. This ensures only genuine college students can access the platform.

## Features

✅ **College Email Validation** - Only allowed college domains can sign up  
✅ **Real-time Validation** - Instant feedback on email validity  
✅ **Auto-College Detection** - Automatically detects college from email  
✅ **Visual Feedback** - Green checkmark for valid emails, red error for invalid  
✅ **Seamless Onboarding** - College field auto-populated during onboarding  

---

## How It Works

### 1. Sign Up Flow

```
User enters email → Email validation → Domain check → College detection
                          ↓
                   Valid college email?
                    ↙           ↘
                  YES            NO
                   ↓              ↓
            Allow signup    Show error message
```

### 2. Allowed Domains

The system maintains a whitelist of allowed college email domains in:
```
services/emailVerificationService.ts
```

**Example Domains:**
- `iitm.ac.in` → IIT Madras
- `bits-pilani.ac.in` → BITS Pilani
- `vit.ac.in` → VIT
- `student.college.edu` → College Name

---

## Adding New College Domains

### Option 1: Manually Add to Code (Recommended for Now)

Edit `services/emailVerificationService.ts`:

```typescript
const ALLOWED_COLLEGE_DOMAINS: string[] = [
    // Add your college domain here
    'yourcollege.edu',
    'student.yourcollege.ac.in',
    // ... existing domains
];

export const DOMAIN_TO_COLLEGE_MAP: { [domain: string]: string } = {
    'yourcollege.edu': 'Your College Name',
    'student.yourcollege.ac.in': 'Your College Name',
    // ... existing mappings
};
```

### Option 2: Database-Driven (Future Enhancement)

Create a `allowed_domains` table in Supabase:

```sql
CREATE TABLE allowed_domains (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain text UNIQUE NOT NULL,
    college_name text NOT NULL,
    approved boolean DEFAULT false,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- Enable RLS
ALTER TABLE allowed_domains ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read allowed_domains"
ON allowed_domains FOR SELECT
USING (approved = true);

-- Only admins can insert/update
CREATE POLICY "Allow admin insert allowed_domains"
ON allowed_domains FOR INSERT
WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));
```

---

## User Experience

### Sign Up Page

**Before entering email:**
```
┌──────────────────────────────────────┐
│  🎓 Only college students can join   │
└──────────────────────────────────────┘

Email: [_________________________]
       Use your college-provided email address
```

**Valid college email detected:**
```
Email: [student@iitm.ac.in      ]
       ✓ IIT Madras email detected
       (green border)
```

**Invalid email entered:**
```
Email: [user@gmail.com          ]
       Sorry, gmail.com is not a recognized 
       college email domain.
       (red border)
```

### Onboarding Flow

After successful signup, the onboarding automatically:
1. Detects college from email domain
2. Pre-fills the college dropdown
3. User only needs to select department

**Example:**
```
Email: student@vit.ac.in
→ Auto-detected: ✓ VIT

College: [VIT                    ▼]  (auto-selected)
Department: [Select department    ▼]  (user selects)
```

---

## API Reference

### Email Verification Service

#### `isCollegeEmail(email: string): boolean`
Checks if email domain is from an allowed college.

```typescript
import { isCollegeEmail } from '../services/emailVerificationService';

const valid = isCollegeEmail('student@iitm.ac.in');  // true
const invalid = isCollegeEmail('user@gmail.com');    // false
```

#### `getCollegeFromEmail(email: string): string | null`
Extracts college name from email domain.

```typescript
import { getCollegeFromEmail } from '../services/emailVerificationService';

const college = getCollegeFromEmail('student@iitm.ac.in');
console.log(college);  // "IIT Madras"
```

#### `getEmailValidationError(email: string): string | null`
Returns user-friendly error message or null if valid.

```typescript
import { getEmailValidationError } from '../services/emailVerificationService';

const error = getEmailValidationError('user@gmail.com');
console.log(error);
// "Sorry, gmail.com is not a recognized college email domain..."
```

---

## Testing

### Test Valid College Emails

```javascript
// In browser console or test file
import { isCollegeEmail, getCollegeFromEmail } from './services/emailVerificationService';

// Should return true
console.log(isCollegeEmail('student@iitm.ac.in'));

// Should return "IIT Madras"
console.log(getCollegeFromEmail('student@iitm.ac.in'));
```

### Test Invalid Emails

```javascript
// Should return false
console.log(isCollegeEmail('user@gmail.com'));

// Should return error message
import { getEmailValidationError } from './services/emailVerificationService';
console.log(getEmailValidationError('user@hotmail.com'));
```

### Integration Testing

1. **Try signing up with valid college email**
   - Email: `student@iitm.ac.in`
   - Expected: ✓ Green checkmark, "IIT Madras email detected"
   - Expected: Sign up button enabled

2. **Try signing up with invalid email**
   - Email: `user@gmail.com`
   - Expected: ❌ Red border, error message
   - Expected: Sign up button disabled

3. **Check onboarding auto-fill**
   - Sign up with: `student@vit.ac.in`
   - Expected: College dropdown shows "VIT" pre-selected

---

## Security Considerations

### ⚠️ Important Notes

1. **Email Verification**
   - Currently, we validate the domain but don't send verification emails
   - Supabase handles email verification via magic links
   - Users must click the Supabase confirmation link in their inbox

2. **Domain Spoofing Prevention**
   - Anyone can technically enter a college email
   - **Recommended**: Enable Supabase email verification
   - Go to Supabase Dashboard → Authentication → Settings
   - Enable "Confirm email"

3. **Rate Limiting**
   - Supabase automatically rate limits auth endpoints
   - Prevents spam account creation

### Enable Email Verification in Supabase

```sql
-- In Supabase SQL Editor
-- Already enabled by default, but to verify:

-- Check email confirmation setting
SELECT * FROM auth.config WHERE key = 'email_confirmation_required';

-- If not enabled, enable it in Dashboard:
-- Authentication → Settings → Email Auth → "Confirm email" = ON
```

---

## Troubleshooting

### Issue: "Email not recognized" for valid college email

**Solution 1:** Add the domain to allowed list
```typescript
// services/emailVerificationService.ts
const ALLOWED_COLLEGE_DOMAINS = [
    'yourcollegedomain.edu',  // Add here
    // ... rest
];
```

**Solution 2:** Check for subdomains
```typescript
// If email is student.college.edu but only college.edu is whitelisted
// Either add the full subdomain OR the validation will check parent domain
```

### Issue: College not auto-detected in onboarding

**Check:**
1. Domain is in `DOMAIN_TO_COLLEGE_MAP`
2. Supabase auth user email is accessible
3. Check browser console for errors

**Fix:**
```typescript
// Add mapping in emailVerificationService.ts
export const DOMAIN_TO_COLLEGE_MAP = {
    'yourcollegedomain.edu': 'Your College Name',
    // ... rest
};
```

### Issue: Can't sign up even with valid email

**Possible causes:**
1. Supabase auth not configured
2. RLS policies blocking
3. Network error

**Debug:**
```javascript
// Check in browser console
const { isCollegeEmail, getEmailValidationError } = 
    await import('./services/emailVerificationService');

console.log(isCollegeEmail('your@email.edu'));
console.log(getEmailValidationError('your@email.edu'));
```

---

## Future Enhancements

### Planned Features

1. **Database-Driven Domains**
   - Store allowed domains in Supabase
   - Admin panel to approve new domains
   - Automatic college name mapping

2. **Email Verification Flow**
   - Send custom verification code to college email
   - 6-digit OTP verification
   - Resend code option

3. **Student ID Verification**
   - Optional: Upload student ID
   - Manual admin approval for edge cases

4. **Multi-Email Support**
   - Allow users to verify multiple college emails
   - Switch between different college feeds

5. **College Admin Dashboard**
   - College admins can manage their students
   - Approve/reject users from their domain

---

## API Endpoints (Future)

### Verify Email with OTP
```typescript
POST /api/verify-email
Body: {
  email: "student@college.edu",
  otp: "123456"
}
```

### Request New College Domain
```typescript
POST /api/request-domain
Body: {
  domain: "newcollege.edu",
  collegeName: "New College",
  proof: "fileUrl"  // Student ID or enrollment letter
}
```

---

## Migration from Anonymous to Verified Users

If you have existing anonymous users, you'll need a migration strategy:

### Option 1: Grandfather Existing Users
```typescript
// In userService.ts, check if user was created before cutoff date
const VERIFICATION_CUTOFF_DATE = new Date('2025-01-01');

if (user.createdAt < VERIFICATION_CUTOFF_DATE) {
    // Allow without verification
}
```

### Option 2: Request Verification
```typescript
// Show modal to existing users
if (!user.emailVerified && !user.isGrandfathered) {
    showEmailVerificationModal();
}
```

---

## Support

For issues or feature requests:
1. Check this documentation first
2. Review `services/emailVerificationService.ts` code
3. Test in browser console
4. Check Supabase authentication logs

---

**Last Updated:** December 2025  
**Version:** 1.0.0
