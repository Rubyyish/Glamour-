# 🚨 START YOUR BACKEND SERVER

## The Problem
Your backend server is NOT running! That's why you're getting 401 errors.

## ✅ Solution: Start the Backend

### Option 1: Using Command Prompt
1. Open a NEW command prompt window
2. Navigate to backend folder:
```cmd
cd c:\Users\Isha\FinalYearProject\backend
```
3. Start the server:
```cmd
npm start
```
OR
```cmd
node server.js
```

### Option 2: Using VS Code Terminal
1. Open VS Code
2. Open a new terminal (Ctrl + `)
3. Navigate to backend:
```cmd
cd backend
```
4. Start server:
```cmd
npm start
```

## ✅ You'll Know It's Working When You See:
```
Server running on port 3001
MongoDB connected successfully
```

## 🎯 After Starting Backend

1. **Keep the backend terminal open** (don't close it!)
2. **Go back to your browser**
3. **Refresh the page** (F5)
4. **Log in** with your credentials
5. **Try creating wardrobe** - it will work! ✅

## 📋 Quick Checklist

- [ ] Backend terminal is open
- [ ] You see "Server running on port 3001"
- [ ] You see "MongoDB connected"
- [ ] Frontend is running (http://localhost:5173)
- [ ] You're logged in
- [ ] Try creating wardrobe

## 🔍 Troubleshooting

### If you see "Port 3001 already in use"
```cmd
# Kill the process on port 3001
npx kill-port 3001

# Then start again
npm start
```

### If you see "MongoDB connection error"
- Make sure MongoDB is running
- Check your MONGODB_URI in backend/.env

### If you see "Cannot find module"
```cmd
# Install dependencies
npm install

# Then start
npm start
```

## 💡 Pro Tip

Keep TWO terminals open:
1. **Terminal 1**: Backend (in `backend` folder) - `npm start`
2. **Terminal 2**: Frontend (in `frontend` folder) - `npm run dev`

Both need to be running for the app to work!

---

**BOTTOM LINE: Start your backend server first, then everything will work!** 🚀
