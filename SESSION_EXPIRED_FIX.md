# 🔧 Session Expired Fix Guide

## Problem
You're seeing "Session expired. Please log in again" when trying to access wardrobes or create new wardrobes.

## Root Cause
Your JWT authentication token has expired. JWT tokens expire after 7 days for security reasons. Once expired, you need to log in again to get a fresh token.

---

## ✅ Quick Fix (3 Steps)

### Step 1: Open the Diagnostic Tool
1. Make sure your frontend dev server is running
2. Open your browser and go to: **http://localhost:5173/auth-diagnostic.html**
3. This tool will show you the current status of your authentication

### Step 2: Clear Auth Data
1. In the diagnostic tool, click the **"Clear All Auth Data"** button
2. Confirm when prompted
3. This removes the expired token from your browser

### Step 3: Log In Again
1. Click **"Go to Login Page"** in the diagnostic tool (or manually go to http://localhost:5173/login)
2. Enter your email and password
3. Click "Log in"
4. You should now have a fresh token that's valid for 7 days

### Step 4: Verify It Works
1. Go back to the diagnostic tool: http://localhost:5173/auth-diagnostic.html
2. Click **"Test Current Token"**
3. You should see "✓ Token is Valid!"
4. Now try accessing your wardrobes - it should work!

---

## 🔍 Manual Fix (If Diagnostic Tool Doesn't Work)

### Option A: Clear Browser Storage Manually

1. **Open Browser DevTools**
   - Press `F12` or right-click → Inspect

2. **Go to Application/Storage Tab**
   - Chrome/Edge: Click "Application" tab
   - Firefox: Click "Storage" tab

3. **Clear localStorage**
   - Find "Local Storage" in the left sidebar
   - Click on `http://localhost:5173`
   - Right-click → Clear
   - OR manually delete these keys:
     - `token`
     - `user`

4. **Clear sessionStorage**
   - Find "Session Storage" in the left sidebar
   - Click on `http://localhost:5173`
   - Right-click → Clear

5. **Refresh the page** (F5 or Ctrl+R)

6. **Log in again** at http://localhost:5173/login

### Option B: Use Browser Console

1. **Open Browser Console**
   - Press `F12` → Click "Console" tab

2. **Run these commands:**
   ```javascript
   localStorage.removeItem('token');
   localStorage.removeItem('user');
   sessionStorage.clear();
   console.log('Auth data cleared!');
   ```

3. **Refresh the page** and log in again

---

## 🚀 Verify Backend is Running

Before logging in, make sure your backend is running:

### Check if Backend is Running
1. Open a new terminal/command prompt
2. Run: `netstat -ano | findstr :5001`
3. If you see output, backend is running ✓
4. If no output, start the backend:
   ```bash
   cd backend
   npm start
   ```

### Test Backend Directly
Open your browser and go to: http://localhost:5001/api/auth/me

- If you see `{"message":"No token provided"}` → Backend is running ✓
- If you see "Cannot connect" → Backend is not running ✗

---

## 📊 Understanding the Issue

### What is a JWT Token?
- JWT (JSON Web Token) is used for authentication
- It's like a temporary pass that proves you're logged in
- Stored in your browser's localStorage

### Why Do Tokens Expire?
- **Security**: Prevents old tokens from being used forever
- **Your token expires after 7 days**
- After expiration, you must log in again to get a new token

### What Happens When Token Expires?
1. You try to access a protected page (like wardrobes)
2. Frontend sends the expired token to backend
3. Backend checks the token and sees it's expired
4. Backend returns 401 Unauthorized error
5. Frontend shows "Session expired" message

---

## 🔧 Technical Details

### Token Structure
Your JWT token has 3 parts:
```
header.payload.signature
```

The payload contains:
- `userId`: Your user ID
- `iat`: Issued at (timestamp)
- `exp`: Expires at (timestamp)

### Token Validation Flow
```
Frontend → Sends token → Backend
Backend → Checks expiry → Valid/Expired
If expired → 401 error → "Session expired"
If valid → Process request → Return data
```

### Where Tokens Are Stored
- **localStorage.token**: The JWT token string
- **localStorage.user**: Your user info (name, email, etc.)

---

## 🎯 Prevention Tips

### To Avoid This Issue in the Future:

1. **Log in regularly** (at least once a week)
2. **Don't clear browser data** unless necessary
3. **Use "Remember Me"** if available (future feature)
4. **Check token expiry** in the diagnostic tool

### For Development:
If you're testing and don't want tokens to expire quickly, you can:
1. Open `backend/routes/auth.js`
2. Find the line: `expiresIn: '7d'`
3. Change to: `expiresIn: '30d'` (30 days)
4. Restart backend server

---

## ❓ Troubleshooting

### Issue: "Cannot connect to backend"
**Solution:**
```bash
cd backend
npm start
```
Wait for "Server running on port 5001"

### Issue: "Login fails with 'Invalid credentials'"
**Solution:**
- Double-check your email and password
- Make sure you're using the correct account
- Try the "Forgot Password" link if needed

### Issue: "Token still shows as expired after login"
**Solution:**
1. Clear browser cache completely (Ctrl+Shift+Delete)
2. Close all browser tabs
3. Open a new browser window
4. Go to login page and log in again

### Issue: "Diagnostic tool doesn't load"
**Solution:**
- Make sure frontend dev server is running: `npm run dev`
- Check the URL: http://localhost:5173/auth-diagnostic.html
- Try accessing directly: `frontend/public/auth-diagnostic.html`

---

## 📞 Still Having Issues?

If you're still experiencing problems:

1. **Check the browser console** (F12 → Console tab)
   - Look for error messages
   - Share any red error messages

2. **Check the backend logs**
   - Look at the terminal where backend is running
   - Look for error messages

3. **Verify environment variables**
   - Check `backend/.env` has `JWT_SECRET`
   - Check `frontend/.env` has `VITE_API_URL=http://localhost:5001`

4. **Try a different browser**
   - Sometimes browser extensions interfere
   - Try Chrome Incognito or Firefox Private mode

---

## 🎉 Success Checklist

After following this guide, you should be able to:
- ✅ Access the diagnostic tool
- ✅ See your token status (valid/expired)
- ✅ Clear expired auth data
- ✅ Log in successfully
- ✅ Access wardrobes without "session expired" error
- ✅ Create new wardrobes
- ✅ Add items to wardrobes

---

## 📝 Quick Reference Commands

### Start Backend
```bash
cd backend
npm start
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Check Backend Status
```bash
netstat -ano | findstr :5001
```

### Clear Auth Data (Browser Console)
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 🔗 Useful Links

- **Diagnostic Tool**: http://localhost:5173/auth-diagnostic.html
- **Login Page**: http://localhost:5173/login
- **Home Page**: http://localhost:5173/home
- **Wardrobes**: http://localhost:5173/wardrobe

---

**Last Updated**: May 31, 2026
**Version**: 1.0
