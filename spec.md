# Focliy

## Current State
Focliy is a membership beauty platform on ICP using Internet Identity for auth. qrcode.react is imported in OnboardPage but missing from package.json causing build failures.

## Requested Changes (Diff)

### Add
- AuthPage.tsx: Sign In / Sign Up tabs with email + password
- useAuth.tsx: Custom auth context deriving Ed25519KeyIdentity from SHA-256(email:password)
- /auth route
- qrcode.react in package.json

### Modify
- useActor.ts, main.tsx, Header.tsx, LandingPage.tsx, OnboardPage.tsx, DashboardPage.tsx, AdminPage.tsx

### Remove
- Nothing

## Implementation Plan
1. Add qrcode.react to package.json
2. Create useAuth.tsx with AuthProvider
3. Create AuthPage.tsx
4. Update all pages and hooks to use new auth
5. Validate
