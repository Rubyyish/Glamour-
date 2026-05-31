# 🚨 IMMEDIATE FIX - Wardrobe Not Working

## The Problem
Your authentication token has **EXPIRED**. That's why you see "session expired please log in again".

## ✅ THE SOLUTION (Takes 1 Minute)

### Option 1: Use the Fix Tool (Easiest)
1. Open this URL in your browser:
   ```
   http://localhost:5173/fix-auth.html
   ```
2. Click "Clear Storage & Reload"
3. You'll be redirected to login
4. Log in with your credentials
5. Go to wardrobe - **IT WILL WORK!** ✅

### Option 2: Manual Fix (Quick)
1. Open your browser console (Press F12)
2. Paste this code and press Enter:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   window.location.href = '/login';
   ```
3. Log in with your credentials
4. Go to wardrobe - **IT WILL WORK!** ✅

### Option 3: Use the App
1. Click "Sign Out" button in your app
2. Log in again with your email and password
3. Go to wardrobe - **IT WILL WORK!** ✅

## 🔍 Why This Happens

JWT tokens expire after 7 days for security. Your token expired, so you need a fresh one.

## 📋 Step-by-Step (Most Detailed)

### Step 1: Clear Your Old Token
Open browser console (F12) and run:
```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
console.log('✅ Cleared old token');
```

### Step 2: Go to Login
```javascript
window.location.href = '/login';
```

### Step 3: Log In
- Enter your email
- Enter your password  
- Click "Login"

### Step 4: Test Wardrobe
- Go to Wardrobe page
- Click on any wardrobe
- **Should work perfectly!** ✅

## 🎯 What You'll See

### Before Fix:
```
Click wardrobe → "Session expired" → Redirect to login
```

### After Fix:
```
Click wardrobe → Wardrobe loads → You can see all items ✅
```

## 💡 Quick Commands

### Check if Token Exists
```javascript
console.log('Token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
```

### Check if Token is Expired
```javascript
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expired = Date.now() > payload.exp * 1000;
  console.log('Expired:', expired ? 'YES ❌' : 'NO ✅');
}
```

### Clear Everything
```javascript
localStorage.clear();
sessionStorage.clear();
console.log('✅ All cleared!');
```

## 🚀 FASTEST FIX (Copy & Paste)

**Just paste this in browser console (F12) and press Enter:**

```javascript
// Clear old auth data
localStorage.clear();
sessionStorage.clear();

// Show message
alert('✅ Cleared! Now logging you out...');

// Go to login
window.location.href = '/login';
```

Then log in again and wardrobe will work!

## ❓ FAQ

### Q: Why do I need to log in again?
**A:** Your token expired (happens after 7 days). You need a fresh token.

### Q: Will I lose my data?
**A:** No! Your wardrobes and items are safe in the database. You just need a new login token.

### Q: How often will this happen?
**A:** Every 7 days. Just log in again when it happens.

### Q: Can I make tokens last longer?
**A:** Yes, but 7 days is secure. You can change it in backend code if needed.

## 🔧 If Still Not Working

### Check 1: Is Backend Running?
Open: `http://localhost:3001`
Should see something (not "can't connect")

### Check 2: Is Frontend Running?
Open: `http://localhost:5173`
Should see your app

### Check 3: Can You Log In?
Try logging in with your credentials
Should work and redirect to home

### Check 4: Check Console
Press F12 → Console tab
Look for red errors
Share them if you see any

## 📞 Emergency Reset

If nothing works, do this:

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
indexedDB.deleteDatabase('firebaseLocalStorageDb');
location.reload();
```

Then:
1. Close ALL browser tabs
2. Open new tab
3. Go to `http://localhost:5173`
4. Log in
5. Try wardrobe

## ✅ Success Checklist

After logging in again, you should be able to:
- [ ] Access wardrobe page
- [ ] See list of wardrobes
- [ ] Click on any wardrobe
- [ ] See wardrobe details
- [ ] Add/edit/delete items
- [ ] Everything works!

---

## 🎉 BOTTOM LINE

**Your token expired. Just log in again and it will work!**

**Fastest way:**
1. Open console (F12)
2. Run: `localStorage.clear(); window.location.href = '/login';`
3. Log in
4. Done! ✅

---

**Created:** May 31, 2026
**Status:** This is normal behavior - tokens expire for security
