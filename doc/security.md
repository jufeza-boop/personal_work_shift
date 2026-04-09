# Security Document - Personal Work Shift

## 1. Overview

This document defines the security architecture, policies, and practices for the Personal Work Shift application. Security is enforced at multiple layers: network, authentication, authorization, data, and application.

## 2. Authentication

### 2.1 Provider: Supabase Auth

- **Email/Password** registration with email verification
- Session management via **JWT tokens** (short-lived access + long-lived refresh)
- Tokens stored in **httpOnly cookies** (not localStorage) to prevent XSS token theft
- **PKCE flow** for OAuth if social login is added in the future
- Automatic session refresh handled by Supabase client

### 2.2 Password Policy

- Minimum 8 characters
- Must contain at least: 1 uppercase, 1 lowercase, 1 digit
- Passwords hashed with **bcrypt** (handled by Supabase Auth)

### 2.3 Session Security

- Access tokens expire after **1 hour**
- Refresh tokens expire after **7 days**
- On logout, both tokens are invalidated server-side
- Concurrent sessions allowed (multi-device support)

## 3. Authorization

### 3.1 Row-Level Security (RLS)

All data access is governed by PostgreSQL RLS policies. The application **never** bypasses RLS.

#### Users Table
```sql
-- Users can only read/update their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### Families Table
```sql
-- Only members of a family can see that family
CREATE POLICY "families_select_member" ON families
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = families.id
      AND family_members.user_id = auth.uid()
    )
  );
```

#### Events Table
```sql
-- Family members can read all events in their families
CREATE POLICY "events_select_family" ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = events.family_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Only event creator can insert/update/delete
CREATE POLICY "events_insert_own" ON events
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "events_update_own" ON events
  FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "events_delete_own" ON events
  FOR DELETE USING (auth.uid() = created_by);
```

#### Delegated Users
```sql
-- Delegated users inherit permissions from their parent
-- Implemented via a delegated_by column in family_members
CREATE POLICY "events_delegated_access" ON events
  FOR ALL USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.user_id = auth.uid()
      AND fm.role = 'delegated'
      AND fm.delegated_by = events.created_by
    )
  );
```

### 3.2 Application-Level Authorization

In addition to RLS, the application layer validates:

- **Event ownership**: Only the creator (or delegated user) can trigger edit/delete use cases
- **Family membership**: Family context is validated before any operation
- **Color uniqueness**: Enforced via UNIQUE constraint + application validation

## 4. Data Protection

### 4.1 Transport Security

- **TLS 1.3** enforced on all connections (Vercel + Supabase)
- **HSTS** headers configured with `max-age=31536000; includeSubDomains`
- No mixed content allowed

### 4.2 Data at Rest

- PostgreSQL data encrypted at rest by **Supabase** (AES-256)
- Backups encrypted with separate keys
- No sensitive data stored in client-side storage (localStorage/IndexedDB)

### 4.3 Data Minimization

- Only essential user data collected (email, display name)
- No tracking, analytics cookies, or third-party scripts
- Profile images stored in Supabase Storage with access policies

## 5. Application Security

### 5.1 Input Validation

- **Server-side validation** on all inputs using Zod schemas
- Event titles: max 200 characters, sanitized
- Family names: max 100 characters, sanitized
- Date/time inputs validated for logical consistency (end > start)
- All user inputs sanitized before rendering to prevent XSS

### 5.2 CSRF Protection

- Server Actions in Next.js include built-in CSRF protection
- State-changing operations require valid session cookie

### 5.3 Rate Limiting

- Authentication endpoints: **5 attempts per minute** per IP
- API endpoints: **100 requests per minute** per user
- Implemented via Vercel Edge Middleware or Supabase rate limiting

### 5.4 Security Headers

```typescript
// next.config.ts headers
{
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co;"
}
```

## 6. PWA Security

### 6.1 Service Worker

- Service Worker served over HTTPS only
- Cache entries scoped to same-origin resources
- No sensitive data cached in Service Worker storage
- Cache versioning to prevent stale security patches

### 6.2 Offline Mode

- Authentication state validated on reconnection
- Queued mutations replayed with fresh tokens after reconnection
- Conflicts resolved with **server-wins** strategy (last-write-wins for events)

## 7. Supabase Storage Security

- **Bucket policies** restrict access to authenticated users
- Profile images accessible only to family members of that user
- Upload size limited to **2MB** per file
- Allowed MIME types: `image/png`, `image/jpeg`, `image/webp`

## 8. Environment Variable Management

| Variable | Location | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | Supabase anonymous key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env (secret) | Admin operations only |
| `VAPID_PUBLIC_KEY` | `.env.local` | Web Push public key |
| `VAPID_PRIVATE_KEY` | Vercel env (secret) | Web Push private key |

- **Never** commit `.env.local` or secret keys to the repository
- `.gitignore` includes all env files
- Secrets managed via Vercel dashboard (encrypted at rest)

## 9. Incident Response

1. **Detection**: Monitor Supabase logs and Vercel analytics for anomalies
2. **Containment**: Revoke compromised sessions/tokens immediately
3. **Recovery**: Rotate affected keys, patch vulnerability, redeploy
4. **Communication**: Notify affected users if data breach occurs

## 10. Security Checklist for Development

- [ ] All inputs validated server-side with Zod
- [ ] RLS policies tested for every table
- [ ] No secrets in client-side code
- [ ] Security headers verified in production
- [ ] HTTPS enforced everywhere
- [ ] Dependencies audited with `npm audit` in CI/CD
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] Auth tokens in httpOnly cookies only
- [ ] Rate limiting active on auth endpoints
- [ ] Service Worker does not cache sensitive data
