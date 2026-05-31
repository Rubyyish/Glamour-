# 🔐 Token Expired - Quick Fix Guide

## ⚠️ Problem
Clicking on any wardrobe redirects you to login page because your authentication token has expired.

## ✅ Immediate Solution (Takes 30 seconds)

### Step 1: Log Out
1. Click "Sign Out" button in your app
2. You'll be redirected to login page

### Step 2: Log In Again
1. Enter your email and password
2. Click "Login"
3. You'll get a fresh token valid for 7 days

### Step 3: Test
1. Go to Wardrobe page
2. Click on any wardrobe
3. Should work now! ✅

---

## 🔍 How to Check if Your Token is Expired

### Method 1: Use the Test Tool
1. Open: `http://localhost:5173/test-auth.html`
2. Click "Decode Token"
3. Check if it says "EXPIRED" or "Valid"

### Method 2: Browser Console
1. Press F12 to open console
2. Paste this code:
```javascript
const token = localStorage.getItem('token');
if (!token) {
  console.log('❌ No token found - Please log in');
} else {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = new Date(payload.exp * 1000);
    const now = new Date();
    const isExpired = now > expiresAt;
    
    console.log('Token Status:');
    console.log('Expires:', expiresAt.toLocaleString());
    console.log('Current:', now.toLocaleString());
    console.log('Status:', isExpired ? '❌ EXPIRED' : '✅ Valid');
    
    if (!isExpired) {
      const daysLeft = Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24));
      console.log('Days remaining:', daysLeft);
    }
  } catch (e) {
    console.log('❌ Invalid token format');
  }
}
```

---

## 🚨 Why This Happens

### Token Lifecycle
1. **Login** → Server creates token (valid for 7 days)
2. **Storage** → Token saved in browser localStorage
3. **Usage** → Token sent with every API request
4. **Expiration** → After 7 days, token becomes invalid
5. **Rejection** → Server returns 401 Unauthorized
6. **Auto-Logout** → App automatically logs you out

### Common Causes
- ✅ Token expired (most common - happens after 7 days)
- ✅ Backend restarted with different JWT_SECRET
- ✅ Token manually deleted from localStorage
- ✅ Browser cache cleared
- ✅ User account deleted from database

---

## 🛠️ Alternative Fixes

### Fix 1: Clear Storage and Re-login
```javascript
// In browser console (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```
Then log in again.

### Fix 2: Manual Token Refresh (Advanced)
If you have a valid token but it's not working:
1. Log out
2. Clear browser cache (Ctrl+Shift+Delete)
3. Close all browser tabs
4. Open app in new tab
5. Log in again

### Fix 3: Check Backend
Make sure backend is running:
1. Check if `http://localhost:3001` is accessible
2. Check backend console for errors
3. Verify JWT_SECRET is set in `.env`
4. Restart backend if needed

---

## 🎯 Prevention Tips

### For Users
1. **Log in regularly** - Tokens expire after 7 days
2. **Don't clear browser data** - This deletes your token
3. **Use one browser** - Tokens are per-browser
4. **Bookmark the app** - Easy access to re-login

### For Developers
1. **Implement token refresh** - Auto-renew before expiration
2. **Show expiration warning** - Alert user 1 day before
3. **Remember me option** - Longer token lifetime
4. **Better error messages** - Tell user why they were logged out

---

## 📋 Troubleshooting Checklist

If logging out and back in doesn't work:

- [ ] Backend server is running (`http://localhost:3001`)
- [ ] Frontend server is running (`http://localhost:5173`)
- [ ] No console errors in browser (F12)
- [ ] JWT_SECRET is set in backend `.env`
- [ ] MongoDB is connected
- [ ] User account exists in database
- [ ] Browser allows localStorage
- [ ] No browser extensions blocking requests
- [ ] Correct API URL in frontend `.env`

---

## 🔧 Quick Commands

### Check if Backend is Running
```bash
curl http://localhost:3001/api/auth/me
```
Should return 401 (expected without token)

### Check Token in Console
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### Clear Everything
```javascript
localStorage.clear();
sessionStorage.clear();
console.log('✅ Cleared all storage');
```

---

## 💡 Understanding the Error Flow

```
1. Click "View Wardrobe"
   ↓
2. Navigate to /wardrobe/:id
   ↓
3. WardrobeDetail component loads
   ↓
4. Calls API: GET /api/wardrobe/:id
   ↓
5. Backend checks token
   ↓
6. Token is expired/invalid
   ↓
7. Backend returns 401 Unauthorized
   ↓
8. Axios interceptor catches 401
   ↓
9. Clears localStorage
   ↓
10. Redirects to /login
```

---

## 🎉 Success Indicators

You'll know it's fixed when:
- ✅ Can click on wardrobe without redirect
- ✅ Wardrobe detail page loads
- ✅ Can see all items in wardrobe
- ✅ No 401 errors in Network tab
- ✅ No console errors

---

## 📞 Still Having Issues?

### Check These Files
1. `frontend/src/api/axiosInstance.js` - Response interceptor
2. `backend/middleware/auth.js` - Token validation
3. `backend/.env` - JWT_SECRET value

### Get Help
1. Check backend logs for auth errors
2. Check browser console for errors
3. Use test-auth.html tool to diagnose
4. Verify token with jwt.io

---

## 🚀 Quick Action Plan

**Right now, do this:**

1. **Log out** from the app
2. **Log in** again
3. **Test** wardrobe access
4. **Done!** ✅

If that doesn't work:
1. Open browser console (F12)
2. Run: `localStorage.clear()`
3. Refresh page
4. Log in again
5. Test wardrobe access

---

**Remember**: Tokens expire after 7 days. This is normal security behavior. Just log in again when it happens! 🔐

**Last Updated**: May 31, 2026
