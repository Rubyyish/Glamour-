# 🚨 FIX SESSION EXPIRED ERROR NOW

## Your token expired. Here's the 30-second fix:

### Method 1: Use the Fix Script (Easiest)
1. **Double-click** `fix-session-expired.bat`
2. Click **"Clear All Auth Data"** in the browser
3. Click **"Go to Login Page"**
4. Log in
5. ✅ **DONE!**

---

### Method 2: Manual Fix (If script doesn't work)
1. Press **F12** (open browser console)
2. Click **Console** tab
3. **Copy and paste** this:
   ```javascript
   localStorage.clear(); sessionStorage.clear(); alert('Auth cleared! Redirecting to login...'); setTimeout(() => location.href='/login', 1000);
   ```
4. Press **Enter**
5. Log in when redirected
6. ✅ **DONE!**

---

### Method 3: DevTools UI
1. Press **F12**
2. Click **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** → `http://localhost:5173`
4. Right-click → **Clear**
5. Go to http://localhost:5173/login
6. Log in
7. ✅ **DONE!**

---

## ⚠️ Before You Start

Make sure backend is running:
```bash
cd backend
npm start
```

---

## 🎯 After Fixing

Try these to verify it works:
1. Go to http://localhost:5173/wardrobe
2. Click "New Wardrobe"
3. Create a wardrobe
4. Should work without "session expired" error!

---

## 📚 More Info

- **Complete Guide**: Read `SESSION_EXPIRED_COMPLETE_SOLUTION.md`
- **Diagnostic Tool**: http://localhost:5173/auth-diagnostic.html
- **Why This Happens**: Tokens expire after 7 days for security

---

## 🆘 Still Not Working?

1. **Check backend is running** on port 5001
2. **Clear browser cache** completely (Ctrl+Shift+Delete)
3. **Close all browser tabs** and open a new window
4. **Try a different browser** (Chrome, Firefox, Edge)
5. **Read the complete guide**: `SESSION_EXPIRED_COMPLETE_SOLUTION.md`

---

**This is normal behavior!** Tokens expire for security. Just log in again every 7 days.
