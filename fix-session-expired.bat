@echo off
echo ========================================
echo   Session Expired Fix Tool
echo ========================================
echo.
echo This script will help you fix the "session expired" error.
echo.
echo What this does:
echo 1. Opens the diagnostic tool in your browser
echo 2. You can clear auth data and test your connection
echo.
pause
echo.
echo Opening diagnostic tool...
start http://localhost:5173/auth-diagnostic.html
echo.
echo ========================================
echo   Instructions:
echo ========================================
echo.
echo 1. In the browser window that just opened:
echo    - Click "Clear All Auth Data"
echo    - Click "Check Backend Status"
echo    - Click "Go to Login Page"
echo.
echo 2. Log in with your credentials
echo.
echo 3. Try accessing wardrobes again
echo.
echo ========================================
echo.
echo If the diagnostic tool doesn't load:
echo   Make sure frontend is running: npm run dev
echo.
echo If backend is not running:
echo   Open a new terminal and run: cd backend ^&^& npm start
echo.
echo ========================================
pause
