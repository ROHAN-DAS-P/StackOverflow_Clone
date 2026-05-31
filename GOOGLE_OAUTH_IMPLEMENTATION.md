# Google OAuth Implementation Summary

## Overview

This document summarizes the Google OAuth authentication integration into the Stack Overflow clone. The implementation allows users to:
- Login with their Google account
- Sign up using Google OAuth
- Automatically create accounts on first Google login
- Link Google accounts to existing email-based accounts

## Changes Made

### Backend (Django)

#### 1. User Model Enhancements (`backend/src/models/__init__.py`)

Added three new fields to the `User` model:
- `auth_provider`: Tracks authentication method (email or google)
- `google_id`: Stores Google's unique user ID (indexed for fast lookups)
- `avatar`: Stores user's Google profile picture URL

Also added `AuthProvider` choices enum for consistency.

#### 2. Database Migration (`backend/src/migrations/0002_add_oauth_fields.py`)

Created migration to:
- Add `auth_provider` field with choices
- Add `google_id` field with unique constraint and index
- Add `avatar` URL field
- Make `email` field unique

#### 3. AuthService Enhancements (`backend/src/services/__init__.py`)

Added three new methods to `AuthService`:

**`verify_google_token(token)`**
- Verifies the Google OAuth token using `google.auth` library
- Validates token audience matches our Client ID
- Returns decoded token information

**`login_with_google(token)`**
- Verifies the Google token
- Extracts user info: google_id, email, name, picture
- Checks if user exists by google_id
- If exists: Updates last_active timestamp
- If new user: Creates account with auto-generated username
- If email exists: Links Google account to existing user
- Returns user and JWT tokens

#### 4. UserRepository Enhancement (`backend/src/repositories/__init__.py`)

Added `get_by_google_id(google_id)` method to retrieve users by their Google ID.

#### 5. AuthController Update (`backend/src/controllers/__init__.py`)

Added `google(request)` method to handle POST requests to `/api/auth/google/`

**Request format:**
```json
{
  "token": "google_access_token"
}
```

**Response format:**
```json
{
  "message": "Login successful",
  "user": { ... user data ... },
  "tokens": { ... JWT tokens ... },
  "auth_provider": "google"
}
```

#### 6. URL Routes (`backend/src/routes/urls.py`)

Added new route:
```
POST /api/auth/google/ → AuthController.google()
```

#### 7. Dependencies (`backend/requirements.txt`)

Added:
- `google-auth==2.25.2`
- `google-auth-oauthlib==1.2.0`
- `google-auth-httplib2==0.2.0`

#### 8. Configuration (`backend/.env.example`)

Added:
```
GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
```

### Frontend (React + Vite)

#### 1. GoogleAuthButton Component (`frontend/src/components/auth/GoogleAuthButton.jsx`)

New component featuring:
- Uses `@react-oauth/google` library's `useGoogleLogin` hook
- Implicit flow authentication
- Modern button styling with Google logo
- Loading state with spinner
- Error handling
- Responsive design
- Dark mode compatible

**Props:**
- `onSuccess`: Callback when authentication succeeds
- `onError`: Callback for error handling
- `isLoading`: External loading state flag

#### 2. Login Page Integration (`frontend/src/pages/auth/Login.jsx`)

Changes:
- Imported `GoogleAuthButton` component
- Added Google authentication button after email/password form
- Added divider with "OR" text
- Implemented `handleGoogleSuccess()` handler
- Implemented `handleGoogleError()` handler
- Error messages unified for both auth methods

#### 3. Register Page Integration (`frontend/src/pages/auth/Register.jsx`)

Changes:
- Imported `GoogleAuthButton` component
- Added Google authentication button after signup form
- Added divider with "OR" text
- Implemented `handleGoogleSuccess()` handler for signup flow
- Integrated with existing query cache invalidation
- Error messages unified for both auth methods

#### 4. Auth Service Enhancement (`frontend/src/services/authService.js`)

Added new method:

**`googleLogin(token)`**
- Takes Google access token
- Sends to backend `/api/auth/google/` endpoint
- Stores JWT tokens and user in localStorage
- Returns user data and tokens

#### 5. Main Entry Point (`frontend/src/main.jsx`)

Wrapped app with:
- `GoogleOAuthProvider` wrapper
- Uses `VITE_GOOGLE_OAUTH_CLIENT_ID` from environment

#### 6. Dependencies (`frontend/package.json`)

Added:
- `@react-oauth/google@^0.12.1`
- `jwt-decode@^4.0.0`

#### 7. Configuration Files

**`.env.example`**
```
VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
VITE_API_URL=http://localhost:8000/api
```

### Documentation

#### 1. Google OAuth Setup Guide (`GOOGLE_OAUTH_SETUP_GUIDE.md`)

Comprehensive guide including:
- Step-by-step Google Cloud Console setup
- How to get OAuth credentials
- Environment variable configuration
- Database migration instructions
- Testing procedures
- Authentication flow diagram
- Troubleshooting guide
- Security considerations
- Deployment guidelines

## Architecture

### Authentication Flow

```
User clicks "Continue with Google"
    ↓
GoogleOAuthProvider opens OAuth popup
    ↓
User authenticates with Google
    ↓
Frontend receives access_token
    ↓
Frontend sends access_token to /api/auth/google/
    ↓
Backend verifies token with Google
    ↓
Backend extracts: email, name, picture, google_id
    ↓
Check if user exists by google_id or email
    ↓
    ├─ New user → Create account
    ├─ Email exists → Link Google account
    └─ Google ID exists → Update last_active
    ↓
Generate JWT tokens
    ↓
Return tokens & user data
    ↓
Frontend stores tokens & redirects to home
```

## User Experience Features

1. **Seamless Authentication**
   - No page reloads required
   - Smooth popup-based flow
   - Instant redirect after login

2. **Automatic Account Creation**
   - First-time Google users get auto-created accounts
   - Username auto-generated from email
   - Profile picture fetched from Google

3. **Account Linking**
   - Users can link Google to existing email accounts
   - Same email recognized and linked automatically

4. **Visual Feedback**
   - Loading spinner during authentication
   - Error messages displayed clearly
   - Success state implicit via redirect

5. **Responsive Design**
   - Mobile-friendly buttons
   - Proper spacing and sizing
   - Touch-friendly on all devices

## Security Implementation

1. **Backend Token Verification**
   - Google tokens verified server-side only
   - Frontend tokens never trusted
   - Client ID validation ensures token is for our app

2. **Secure Storage**
   - JWT tokens stored in localStorage
   - Passwords hashed with Django's hasher for OAuth users
   - Google ID stored as unique, indexed field

3. **Error Handling**
   - Comprehensive error messages
   - No sensitive information leaked
   - Proper HTTP status codes

4. **CORS Protection**
   - Only authorized origins allowed
   - Configured in settings

## File Structure

```
backend/
├── src/
│   ├── models/__init__.py          (Updated User model)
│   ├── services/__init__.py         (Added Google methods)
│   ├── repositories/__init__.py     (Added google_id lookup)
│   ├── controllers/__init__.py      (Added google endpoint)
│   ├── migrations/
│   │   └── 0002_add_oauth_fields.py (New migration)
│   └── routes/urls.py               (New /api/auth/google/ route)
├── requirements.txt                 (Added google-auth libs)
└── .env.example                     (Added Google OAuth config)

frontend/
├── src/
│   ├── components/
│   │   └── auth/
│   │       └── GoogleAuthButton.jsx (New component)
│   ├── pages/
│   │   └── auth/
│   │       ├── Login.jsx           (Added Google button)
│   │       └── Register.jsx        (Added Google button)
│   ├── services/authService.js     (Added googleLogin method)
│   └── main.jsx                    (Added GoogleOAuthProvider)
├── package.json                    (Added dependencies)
└── .env.example                    (Added Google config)

root/
└── GOOGLE_OAUTH_SETUP_GUIDE.md    (Setup documentation)
```

## Integration Points

### Database
- User model extended with OAuth fields
- Migration handles schema changes
- Backward compatible with existing users

### Authentication Service
- AuthService handles both email and Google auth
- Unified token generation
- Consistent error handling

### API
- New endpoint: `POST /api/auth/google/`
- Same response format as email login
- JWT tokens returned for all auth methods

### Frontend State
- AuthStore unchanged
- Both auth methods use same token storage
- No breaking changes to existing logic

## Testing Checklist

- [ ] Create Google Cloud OAuth credentials
- [ ] Set environment variables (frontend & backend)
- [ ] Run database migrations
- [ ] Install dependencies on both sides
- [ ] Start backend: `python manage.py runserver`
- [ ] Start frontend: `npm run dev`
- [ ] Test Google login from Login page
- [ ] Test Google signup from Register page
- [ ] Verify user created with correct data
- [ ] Check avatar fetched from Google
- [ ] Test linking Google to existing email account
- [ ] Verify JWT tokens stored and used
- [ ] Test logout and re-login
- [ ] Test on mobile browser
- [ ] Test error handling (invalid token, network error)

## Environment Variables Required

### Backend
```
GOOGLE_OAUTH_CLIENT_ID=<from Google Cloud Console>
```

### Frontend  
```
VITE_GOOGLE_OAUTH_CLIENT_ID=<from Google Cloud Console>
VITE_API_URL=http://localhost:8000/api
```

## Performance Considerations

1. **Token Verification**: Happens server-side, may take 1-2 seconds
2. **User Lookup**: Indexed by google_id and email for fast retrieval
3. **Network**: Requires network call to Google (external dependency)
4. **Caching**: User data cached in localStorage after login

## Known Limitations

1. Only Google OAuth supported (can add GitHub, Microsoft later)
2. No refresh token auto-refresh yet
3. No account unlinking UI yet
4. No email verification for OAuth accounts

## Future Enhancements

1. Add GitHub OAuth provider
2. Add Microsoft OAuth provider
3. Account linking/unlinking UI
4. Auto-refresh JWT tokens
5. Two-factor authentication
6. OAuth scope customization
7. Profile image sync on login
8. Multiple account management

## Rollback Procedure

If you need to revert changes:

1. Reverse migration: `python manage.py migrate src 0001`
2. Remove User model fields
3. Revert frontend components
4. Restore package.json to previous state
5. Clear environment variables

## Support

For issues or questions:
1. Check `GOOGLE_OAUTH_SETUP_GUIDE.md` for detailed setup
2. Review error logs from both frontend and backend
3. Check Google OAuth documentation
4. Review Django logs: `backend/logs/`

