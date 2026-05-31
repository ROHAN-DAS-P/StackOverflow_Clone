# Google OAuth Quick Start & Testing Guide

## Quick Start (5 minutes)

### 1. Get Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
4. Select "Web application"
5. Add authorized origins:
   - `http://localhost:3000`
   - `http://localhost:8000`
6. Copy the **Client ID**

### 2. Set Environment Variables

**Backend (`backend/.env`):**
```
GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID
```

**Frontend (`frontend/.env`):**
```
VITE_GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID
VITE_API_URL=http://localhost:8000/api
```

### 3. Install & Run

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### 4. Test It

- Go to http://localhost:3000/auth/login
- Click "Continue with Google"
- Authenticate with your Google account
- You should be logged in!

## Testing Scenarios

### Test 1: First-Time Google Login

**Objective**: Verify new user account creation

**Steps**:
1. Go to Login page
2. Click "Continue with Google"
3. Choose a Google account you haven't used before
4. Verify you're logged in

**Expected**:
- New user created in database
- Username auto-generated
- Redirected to home page
- User avatar displayed (if available)

**Verification**:
```bash
# Check database
python manage.py shell
from src.models import User
user = User.objects.filter(auth_provider='google').first()
print(f"Username: {user.username}")
print(f"Google ID: {user.google_id}")
print(f"Avatar: {user.avatar}")
```

### Test 2: Google Login (Existing User)

**Objective**: Verify existing user can login with Google

**Steps**:
1. Do Test 1 (create user)
2. Logout: Click profile > Logout
3. Login again with same Google account
4. Click "Continue with Google"

**Expected**:
- Logged in successfully
- Same user account used
- No duplicate account created

### Test 3: Email Account Linking

**Objective**: Verify Google account links to existing email account

**Steps**:
1. Sign up with email: `test@example.com`, password `test123`
2. Logout
3. Click "Continue with Google" with same email
4. Login succeeds

**Expected**:
- Same user account used
- `auth_provider` changed to 'google'
- `google_id` added to account
- No duplicate account

**Verification**:
```bash
python manage.py shell
from src.models import User
user = User.objects.get(email='test@example.com')
print(f"Auth Provider: {user.auth_provider}")
print(f"Google ID: {user.google_id}")
```

### Test 4: Google Signup

**Objective**: Verify signup via Google works

**Steps**:
1. Go to Register page
2. Click "Continue with Google"
3. Authenticate with new Google account

**Expected**:
- New account created
- Auto-logged in
- Redirected to home page

### Test 5: Error Handling

**Objective**: Verify error handling works

**Steps**:
1. Disable backend: Stop `python manage.py runserver`
2. Try to login with Google
3. Check error message

**Expected**:
- Clear error message displayed
- UI remains functional
- Can retry

### Test 6: Mobile Responsiveness

**Objective**: Verify works on mobile

**Steps**:
1. Open Chrome DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Select iPhone 12
4. Go to Login page
5. Click "Continue with Google"

**Expected**:
- Button properly sized
- Form responsive
- Google popup appears
- Login works on mobile

### Test 7: Logout & Relogin

**Objective**: Verify session persistence

**Steps**:
1. Login with Google
2. Refresh page - you should stay logged in
3. Logout
4. Refresh page - you should be logged out
5. Login again

**Expected**:
- Session persists on refresh
- Logout clears session
- Can re-login normally

## Debugging

### Check Browser Console

Open browser DevTools (F12) and check for errors:

```javascript
// Check if Google Auth loaded
console.log(google)

// Check environment variable
console.log(import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID)

// Check stored token
console.log(localStorage.getItem('access_token'))
```

### Check Backend Logs

```bash
# Watch logs
tail -f backend/logs/app.log

# Or check Django console output
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Google is not defined" | Check `@react-oauth/google` is installed |
| "Client ID is invalid" | Verify Client ID in .env matches Google Cloud |
| "Token verification failed" | Check backend `GOOGLE_OAUTH_CLIENT_ID` env var |
| "User not created" | Check migrations ran: `python manage.py migrate` |
| Button doesn't respond | Check browser console for JavaScript errors |
| Can't access Google Cloud | Login to https://console.cloud.google.com/ |

## API Testing (Manual)

### Test Google Auth Endpoint Directly

```bash
# Get access token from Google manually, then:
curl -X POST http://localhost:8000/api/auth/google/ \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_ACCESS_TOKEN"}'

# Expected response:
{
  "message": "Login successful",
  "user": {...},
  "tokens": {
    "access_token": "...",
    "refresh_token": "...",
    "token_type": "Bearer",
    "expires_in": 86400
  }
}
```

## Database Verification

### Check User Fields

```bash
python manage.py shell

from src.models import User

# Check Google users
google_users = User.objects.filter(auth_provider='google')
for user in google_users:
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"Google ID: {user.google_id}")
    print(f"Avatar: {user.avatar}")
    print("---")

# Check a specific user
user = User.objects.filter(google_id='123456789').first()
print(user)
```

## Performance Testing

### Measure Login Time

```javascript
// In browser console
const start = performance.now();
// Click "Continue with Google" and complete login
// When logged in, run:
const end = performance.now();
console.log(`Login took ${end - start}ms`);
```

## Security Testing

### Test Token Validation

1. Capture network request to `/api/auth/google/`
2. Modify the token in the request
3. Verify it's rejected
4. Check error message is generic (doesn't leak info)

### Test CORS

```javascript
// In browser console
fetch('http://localhost:8000/api/auth/google/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: 'invalid' })
}).then(r => r.json()).then(console.log);
// Should see response (CORS working)
```

## Checklist for Production Deployment

- [ ] Google OAuth credentials created for production domain
- [ ] Environment variables set on production servers
- [ ] HTTPS enabled for all auth endpoints
- [ ] Database migrations applied to production
- [ ] CORS configured for production domain
- [ ] Logs monitored for auth failures
- [ ] Error messages don't leak sensitive data
- [ ] Tokens stored securely (HttpOnly cookies preferred)
- [ ] Rate limiting applied to auth endpoint
- [ ] Backup & recovery plan for user data

## Next Steps

After testing:

1. Deploy to staging environment
2. Run full QA testing
3. Test with multiple Google accounts
4. Load test the auth endpoint
5. Monitor error rates
6. Get security review
7. Plan rollback procedure
8. Deploy to production
9. Monitor for issues
10. Gather user feedback

## Troubleshooting Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google Library](https://www.npmjs.com/package/@react-oauth/google)
- [Django REST Framework Auth](https://www.django-rest-framework.org/api-guide/authentication/)
- [Backend Logs](../backend/logs/)
- [Frontend Console](Browser DevTools > Console Tab)

## Support

Issues? Check:
1. Error message in browser console
2. Backend logs in `backend/logs/app.log`
3. Google Cloud Console for credential issues
4. Environment variables are set correctly
5. Database migrations completed

