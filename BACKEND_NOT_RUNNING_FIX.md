# 🚨 BACKEND NOT RUNNING - THIS IS THE PROBLEM!

## The Real Issue
Your backend server is **NOT RUNNING**. That's why you're getting 401 errors and "session expired" messages.

## ✅ SOLUTION (Takes 1 Minute)

### Quick Fix - Use the Batch Script
1. **Double-click** this file: `start-servers.bat`
2. Two terminal windows will open (backend and frontend)
3. Wait 10 seconds for servers to start
4. Go to browser: `http://localhost:5173`
5. Log in
6. Everything will work! ✅

### Manual Fix - Start Backend
1. Open Command Prompt
2. Run these commands:
```cmd
cd c:\Users\Isha\FinalYearProject\backend
npm start
```
3. Keep this window open!
4. You should see:
```
Server running on port 3001
MongoDB connected successfully
```

## 🎯 After Starting Backend

1. **Go to your browser**
2. **Go to**: `http://localhost:5173`
3. **Log in** with your credentials
4. **Try wardrobe** - it will work now! ✅

## 📋 What You Need Running

### Two Servers Must Be Running:

#### 1. Backend Server (Port 3001)
```cmd
cd backend
npm start
```
**You'll see:**
- "Server running on port 3001"
- "MongoDB connected successfully"

#### 2. Frontend Server (Port 5173)
```cmd
cd frontend
npm run dev
```
**You'll see:**
- "VITE v... ready in ...ms"
- "Local: http://localhost:5173"

## 🔍 How to Check if Backend is Running

### Method 1: Check Terminal
- Look for a terminal window with "Server running on port 3001"
- If you don't see it, backend is NOT running

### Method 2: Test in Browser
- Open: `http://localhost:3001`
- Should see something (not "can't connect")

### Method 3: Check Task Manager
- Open Task Manager (Ctrl+Shift+Esc)
- Look for "node.exe" processes
- Should see at least 2 (backend + frontend)

## ⚠️ Common Mistakes

### Mistake 1: Only Frontend Running
- Frontend works but API calls fail
- Get 401 or connection errors
- **Fix**: Start backend too!

### Mistake 2: Closed Backend Terminal
- Backend was running but you closed the window
- **Fix**: Start backend again

### Mistake 3: Wrong Port
- Backend running on wrong port
- **Fix**: Check backend/.env has correct port

## 🚀 Complete Startup Procedure

### Step 1: Start Backend
```cmd
cd c:\Users\Isha\FinalYearProject\backend
npm start
```
**Wait for**: "Server running on port 3001"

### Step 2: Start Frontend (New Terminal)
```cmd
cd c:\Users\Isha\FinalYearProject\frontend
npm run dev
```
**Wait for**: "Local: http://localhost:5173"

### Step 3: Open Browser
- Go to: `http://localhost:5173`
- Log in
- Use the app!

## 💡 Pro Tips

### Tip 1: Use the Batch Script
- Just double-click `start-servers.bat`
- Starts both servers automatically
- Easiest way!

### Tip 2: Keep Terminals Open
- Don't close the terminal windows
- Minimize them if needed
- Both must stay running

### Tip 3: Check Logs
- Backend terminal shows API requests
- Frontend terminal shows build info
- Useful for debugging

## 🔧 Troubleshooting

### "Port 3001 already in use"
```cmd
npx kill-port 3001
npm start
```

### "MongoDB connection error"
- Make sure MongoDB is installed and running
- Check MONGODB_URI in backend/.env

### "Cannot find module"
```cmd
npm install
npm start
```

### "EADDRINUSE" error
- Port is already taken
- Kill the process or use different port

## ✅ Success Checklist

After starting backend, you should be able to:
- [ ] Access http://localhost:3001 (shows something)
- [ ] Access http://localhost:5173 (shows your app)
- [ ] Log in successfully
- [ ] Create wardrobes
- [ ] View wardrobes
- [ ] Add items
- [ ] Everything works!

## 🎉 Quick Start Command

**Easiest way - just run this:**
```cmd
start-servers.bat
```

Then:
1. Wait 10 seconds
2. Go to http://localhost:5173
3. Log in
4. Done! ✅

---

## 📞 Still Not Working?

### Check 1: Is Backend Running?
```cmd
curl http://localhost:3001
```
Should NOT say "connection refused"

### Check 2: Is MongoDB Running?
- Check if MongoDB service is running
- Or if using MongoDB Atlas, check connection string

### Check 3: Environment Variables
- Check backend/.env has:
  - MONGODB_URI
  - JWT_SECRET
  - PORT=3001

### Check 4: Dependencies Installed
```cmd
cd backend
npm install
```

---

## 🎯 BOTTOM LINE

**Your backend server is not running. Start it and everything will work!**

**Fastest way:**
1. Double-click `start-servers.bat`
2. Wait 10 seconds
3. Go to http://localhost:5173
4. Log in
5. Done! 🚀

---

**Created**: May 31, 2026
**Priority**: CRITICAL - Start backend first!
**Status**: Backend must be running for app to work
