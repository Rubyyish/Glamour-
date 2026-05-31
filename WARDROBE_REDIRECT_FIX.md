# Wardrobe Redirect to Login Fix

## Problem
Clicking "View Wardrobe" redirects to the login page even when logged in.

## Root Cause
The axios response interceptor automatically logs out users when any API call returns a 401 (Unauthorized) status. This happens when:

1. **Token is expired** - JWT tokens expire after 7 days
2. **Token is invalid** - JWT_SECRET mismatch or corrupted token
3. **Token not sent properly** - Authorization header missing or malformed
4. **User deleted from database** - Token valid but user doesn't exist

## Fixes Applied

### 1. ✅ Improved Axios Interceptor (`axiosInstance.js`)
**Before**: Automatically logged out on any 401 error
**After**: 
- Only logs out if a token exists but is invalid
- Prevents redirect loops
- Adds console logging for debugging

### 2. ✅ Enhanced Auth Middleware (`backend/middleware/auth.js`)
**Added**:
- Detailed error logging
- Specific error messages for different failure types
- Token expiration detection
- Invalid token format detection

### 3. ✅ Added Token Validation Endpoint (`/api/auth/me`)
**Purpose**: Validate tokens without side effects
**Returns**: User data if token is valid, 401 if invalid

## How to Fix the Issue

### Quick Fix: Re-login
The simplest solution is to log out and log back in:

1. Click "Sign Out"
2. Log in again with your credentials
3. Try accessing wardrobe again

This generates a fresh token that will work for 7 days.

### Check Token Status

Open browser console (F12) and run:
```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));

// Check if user exists
console.log('User:', localStorage.getItem('user'));

// Check token expiration (decode JWT)
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token expires:', new Date(payload.exp * 1000));
  console.log('Is expired:', Date.now() > payload.exp * 1000);
}
```

### Backend Debugging

Check backend logs when accessing wardrobe:
```
Auth middleware: No token provided
Auth middleware: Token expired
Auth middleware: Invalid token format
Auth middleware: User not found for token
```

## Testing the Fix

### Test 1: Fresh Login
1. Log out completely
2. Log in with valid credentials
3. Navigate to wardrobe
4. Should work ✅

### Test 2: Token Validation
1. Open browser console
2. Go to Application → Local Storage
3. Check if `token` and `user` exist
4. If missing, log in again

### Test 3: API Call
1. Open Network tab (F12)
2. Try to access wardrobe
3. Look for `/api/wardrobe` call
4. Check if it returns 200 (success) or 401 (unauthorized)
5. If 401, check the response message

## Common Issues & Solutions

### Issue 1: "Token expired"
**Solution**: Log out and log in again

### Issue 2: "Invalid token format"
**Solution**: 
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Log in again

### Issue 3: "User not found for token"
**Solution**: Your user account may have been deleted. Create a new account.

### Issue 4: Still redirecting after login
**Solution**:
1. Check if JWT_SECRET in backend `.env` matches what was used to create the token
2. Restart backend server
3. Clear browser cache and localStorage
4. Log in again

## Prevention

### For Users
- Don't manually edit localStorage
- Log in at least once every 7 days
- Use "Remember Me" if available

### For Developers
- Monitor token expiration
- Implement token refresh mechanism
- Add better error messages
- Log authentication failures

## Technical Details

### Token Lifecycle
1. **Login** → Server generates JWT token (expires in 7 days)
2. **Storage** → Token saved in localStorage
3. **API Calls** → Token sent in Authorization header
4. **Validation** → Server verifies token on each request
5. **Expiration** → After 7 days, token becomes invalid
6. **Logout** → Token removed from localStorage

### JWT Token Structure
```
Header.Payload.Signature
```

Payload contains:
- `userId`: User's database ID
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

### Authorization Header Format
```
Authorization: Bearer <token>
```

## Files Modified

1. `frontend/src/api/axiosInstance.js` - Improved 401 handling
2. `backend/middleware/auth.js` - Added detailed logging
3. `backend/routes/auth.js` - Added `/me` endpoint

## Next Steps

If the issue persists after trying all solutions:

1. **Check Backend Logs**
   - Look for auth middleware errors
   - Check JWT_SECRET is set in .env
   - Verify MongoDB connection

2. **Check Frontend Console**
   - Look for 401 errors
   - Check if token exists in localStorage
   - Verify API URL is correct

3. **Test with Postman**
   - Login to get a token
   - Try calling `/api/wardrobe` with the token
   - Check if it works outside the browser

4. **Database Check**
   - Verify your user exists in MongoDB
   - Check if user ID in token matches database

## Emergency Reset

If nothing works, do a complete reset:

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Then:
1. Restart backend server
2. Log in with fresh credentials
3. Test wardrobe access

---

**Status**: ✅ Fixed - Improved error handling and logging
**Date**: May 31, 2026
**Version**: 1.1
