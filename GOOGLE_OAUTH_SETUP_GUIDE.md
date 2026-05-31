# Google OAuth Integration Guide

This guide walks you through setting up Google OAuth authentication for the Stack Overflow clone.

## Prerequisites

- Google Cloud Project
- OAuth 2.0 credentials configured
- Both frontend and backend running locally or deployed

## Step 1: Get Your Google OAuth Client ID

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "StackOverflow Clone OAuth")
5. Click "Create"

### 1.2 Enable Google+ API

1. In the Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 1.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in required fields (App name, User support email, etc.)
   - Add scopes: `email`, `profile`, `openid`
   - Add yourself as a test user
4. For Application type, select "Web application"
5. Under "Authorized JavaScript origins", add:
   ```
   http://localhost:3000
   http://localhost:8000
   https://yourdomain.com  (if deployed)
   ```
6. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3000/auth/login
   http://localhost:3000/auth/register
   https://yourdomain.com/auth/login  (if deployed)
   https://yourdomain.com/auth/register  (if deployed)
   ```
7. Click "Create"
8. Copy your **Client ID**

## Step 2: Configure Environment Variables

### 2.1 Frontend Configuration (.env)

Create a `.env` file in the `frontend/` directory:

```env
# Google OAuth Configuration
VITE_GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID_FROM_GOOGLE

# API Configuration  
VITE_API_URL=http://localhost:8000/api
```

Replace `YOUR_CLIENT_ID_FROM_GOOGLE` with the Client ID you copied.

### 2.2 Backend Configuration (.env)

Create or update the `.env` file in the `backend/` directory:

```env
# Google OAuth Configuration
GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID_FROM_GOOGLE

# ... other existing configuration ...
```

## Step 3: Install Dependencies

### 3.1 Backend Dependencies

Install Google auth libraries:

```bash
cd backend
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

Or if using requirements.txt:

```bash
pip install -r requirements.txt
```

### 3.2 Frontend Dependencies

Install React OAuth library:

```bash
cd frontend
npm install @react-oauth/google jwt-decode
```

## Step 4: Database Migration

Run Django migrations to add OAuth fields to the User model:

```bash
cd backend
python manage.py migrate
```

This creates three new fields:
- `google_id`: Stores Google's unique user ID
- `avatar`: Stores the user's Google profile picture
- `auth_provider`: Tracks which authentication method was used

## Step 5: Test the Integration

### 5.1 Start the Services

```bash
# Terminal 1: Backend
cd backend
python manage.py runserver

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5.2 Test Google Login

1. Navigate to `http://localhost:3000/auth/login`
2. Click "Continue with Google"
3. You should see Google's authentication popup
4. After authenticating, you should be logged in and redirected to the home page

### 5.3 Test Google Signup

1. Navigate to `http://localhost:3000/auth/register`
2. Click "Continue with Google"
3. Follow the same process
4. A new account should be created automatically

## How It Works

### Authentication Flow

```
Frontend                          Google                          Backend
   |                                |                               |
   +-------- Click Google Login ----->                             |
   |                                |                               |
   |                          <------ Auth Popup                    |
   |                                |                               |
   |       <------ Access Token -----+                              |
   |                                                                |
   +------------- Access Token ---------------------------------->|
   |                                                                |
   |                                          Verify Token with Google
   |                                          Extract: email, name, picture
   |                                          Check if user exists
   |                                          Create or update user
   |                                                                |
   |<----------- JWT Access & Refresh Tokens ----------------------+
   |                                                                |
   +--- Store JWT in localStorage ---|
   |                                  |
   +--- Redirect to Home Page -------|
```

### Key Features

1. **Automatic User Creation**: If a user authenticates with Google for the first time, an account is automatically created
2. **Account Linking**: If a user signs up with email first, then later uses Google with the same email, the accounts are linked
3. **Secure Token Verification**: Google tokens are verified on the backend
4. **JWT Authentication**: After verification, JWT tokens are issued for session management
5. **User Profile Data**: Google profile picture is automatically fetched and stored

## Troubleshooting

### Google Popup Doesn't Appear

- **Issue**: "Google is not defined" or popup blocked
- **Solution**:
  - Make sure `@react-oauth/google` is installed
  - Check that `VITE_GOOGLE_OAUTH_CLIENT_ID` is set correctly
  - Ensure the frontend is wrapped with `GoogleOAuthProvider`

### "Token is not for this application"

- **Issue**: Google returns an error about the token audience
- **Solution**:
  - Verify `GOOGLE_OAUTH_CLIENT_ID` in backend .env matches your Google Client ID
  - Check that the Client ID is correct in Google Cloud Console

### Backend Getting 401 Unauthorized

- **Issue**: Google token verification fails
- **Solution**:
  - Ensure `google-auth` library is installed
  - Check logs for the actual error message
  - Verify the token is being sent correctly from frontend

### User Not Created After Google Auth

- **Issue**: Authentication succeeds but no user created
- **Solution**:
  - Check database migrations have run: `python manage.py migrate`
  - Check logs for validation errors
  - Verify `email` field is being extracted from Google token

## Security Considerations

1. **Token Verification**: Always verify Google tokens on the backend - never trust frontend tokens
2. **HTTPS in Production**: Use HTTPS for all authentication flows
3. **CORS Configuration**: Ensure CORS is properly configured to prevent unauthorized requests
4. **Environment Variables**: Never commit `.env` files with real credentials to version control
5. **Refresh Tokens**: Store JWT refresh tokens securely (HttpOnly cookies preferred)
6. **Password Handling**: OAuth users don't have passwords - `password` field is set to a random hash

## Deployment Considerations

When deploying to production:

1. Update Google Cloud Console with your production domain:
   - Add production domain to "Authorized JavaScript origins"
   - Add auth endpoints to "Authorized redirect URIs"

2. Update environment variables in your hosting platform:
   - Set `GOOGLE_OAUTH_CLIENT_ID` in backend environment
   - Set `VITE_GOOGLE_OAUTH_CLIENT_ID` in frontend environment

3. Ensure CORS headers are configured for your production domain

4. Use HTTPS for all requests

## API Endpoint Reference

### Google OAuth Login Endpoint

**POST** `/api/auth/google/`

**Request:**
```json
{
  "token": "access_token_from_google"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "auth_provider": "google",
    "avatar": "https://..."
  },
  "tokens": {
    "access_token": "jwt_token",
    "refresh_token": "jwt_refresh_token",
    "token_type": "Bearer",
    "expires_in": 86400
  },
  "auth_provider": "google"
}
```

## Next Steps

- Implement "Remember Me" functionality
- Add other OAuth providers (GitHub, Microsoft, etc.)
- Implement account linking UI
- Add email verification for non-OAuth accounts
- Set up two-factor authentication

## Support

For issues or questions:
1. Check the [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
2. Review the error logs from both backend and frontend
3. Check the GitHub issues in the repository

