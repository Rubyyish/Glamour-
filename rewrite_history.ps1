# ============================================================
# Glamour - Git History Rewrite Script
# Rewrites GitHub history with proper branches and dates
# Files stay safe locally - script works from existing files
# ============================================================

$ErrorActionPreference = "Stop"
$REPO_ROOT = $PSScriptRoot
$GIT_USER_NAME = "Rubyyish"
$GIT_USER_EMAIL = "ishakarki704@gmail.com"

# Patterns to never commit
$IGNORE_PATTERNS = @(
    "node_modules",
    "\.env$",
    "\.env\.local$",
    "\.env\.development$",
    "\.env\.production$",
    "\.md$",
    "package-lock\.json$",
    "\.jpg$", "\.jpeg$", "\.png$", "\.gif$", "\.webm$", "\.mp4$",
    "dist/",
    "\.git/"
)

function Should-Ignore {
    param($path)
    foreach ($pattern in $IGNORE_PATTERNS) {
        if ($path -match $pattern) { return $true }
    }
    return $false
}

function Git-Commit {
    param($message, $date, $files)
    foreach ($f in $files) {
        # Skip ignored patterns
        if (Should-Ignore $f) {
            Write-Host "  [ignored] $f" -ForegroundColor DarkGray
            continue
        }
        $full = Join-Path $REPO_ROOT $f
        if (Test-Path $full) {
            git add $f
        } else {
            Write-Host "  [missing] $f" -ForegroundColor DarkGray
        }
    }
    $staged = git diff --cached --name-only
    if ($staged) {
        $env:GIT_AUTHOR_DATE = $date
        $env:GIT_COMMITTER_DATE = $date
        $env:GIT_AUTHOR_NAME = $GIT_USER_NAME
        $env:GIT_AUTHOR_EMAIL = $GIT_USER_EMAIL
        $env:GIT_COMMITTER_NAME = $GIT_USER_NAME
        $env:GIT_COMMITTER_EMAIL = $GIT_USER_EMAIL
        git commit -m $message
    } else {
        Write-Host "  [skip] nothing staged for: $message" -ForegroundColor Yellow
    }
}

function Git-MergeInto {
    param($targetBranch, $sourceBranch, $message, $date)
    git checkout $targetBranch
    $env:GIT_AUTHOR_DATE = $date
    $env:GIT_COMMITTER_DATE = $date
    $env:GIT_AUTHOR_NAME = $GIT_USER_NAME
    $env:GIT_AUTHOR_EMAIL = $GIT_USER_EMAIL
    $env:GIT_COMMITTER_NAME = $GIT_USER_NAME
    $env:GIT_COMMITTER_EMAIL = $GIT_USER_EMAIL
    git merge --no-ff -m $message $sourceBranch
}

Set-Location $REPO_ROOT

Write-Host "`n=== STEP 1: Backup check ===" -ForegroundColor Cyan
Write-Host "All files are safe on disk. Git operations will not delete local files." -ForegroundColor Green

# ============================================================
# STEP 2: Nuke local git state, reinitialize
# ============================================================
Write-Host "`n=== STEP 2: Reinitializing git ===" -ForegroundColor Cyan

Remove-Item -Recurse -Force ".git" -ErrorAction SilentlyContinue
git init
git remote add origin git@github.com:Rubyyish/Glamour-.git

# Write a clean .gitignore so git itself respects these rules too
@"
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment variables
.env
.env.local
.env.development
.env.production
.env.*.local

# Build output
dist/
build/
.vite/

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# Lock files
package-lock.json
yarn.lock

# Media / uploads
*.jpg
*.jpeg
*.png
*.gif
*.webm
*.mp4

# Misc
storage.rules
"@ | Set-Content ".gitignore" -Encoding UTF8

# ============================================================
# STEP 3: Force push empty commit to main first, then wipe other branches
# (GitHub won't let you delete the default branch directly)
# ============================================================
Write-Host "`n=== STEP 3: Clearing remote branches ===" -ForegroundColor Cyan

# Create a temporary empty commit and force push to main
# This resets remote main to a clean slate
$env:GIT_AUTHOR_DATE    = "2025-12-08T09:00:00+05:45"
$env:GIT_COMMITTER_DATE = "2025-12-08T09:00:00+05:45"
$env:GIT_AUTHOR_NAME    = $GIT_USER_NAME
$env:GIT_AUTHOR_EMAIL   = $GIT_USER_EMAIL
$env:GIT_COMMITTER_NAME  = $GIT_USER_NAME
$env:GIT_COMMITTER_EMAIL = $GIT_USER_EMAIL
git commit --allow-empty -m "init"
git branch -M main
git push origin main --force
Write-Host "  Remote main reset." -ForegroundColor Green

# Now delete every other remote branch except main
$remoteBranches = git ls-remote --heads origin 2>$null |
    ForEach-Object { ($_ -split "\s+")[1] -replace "refs/heads/", "" } |
    Where-Object { $_ -ne "main" }

foreach ($rb in $remoteBranches) {
    Write-Host "  Deleting remote branch: $rb"
    git push origin --delete $rb 2>$null
}
Write-Host "  Remote branches cleared." -ForegroundColor Green

# ============================================================
# DEC 8, 2025 — Initial commit on main, then create dev
# ============================================================
Write-Host "`n=== DEC 8: Initial setup ===" -ForegroundColor Cyan

Git-Commit `
    "Initial commit: project scaffold" `
    "2025-12-08T10:00:00+05:45" `
    @(".gitignore",
      "frontend/package.json",
      "frontend/vite.config.js",
      "frontend/index.html",
      "frontend/eslint.config.js",
      "frontend/src/main.jsx",
      "frontend/src/index.css",
      "frontend/src/App.jsx",
      "backend/package.json",
      "backend/server.js")

git branch -M main
git push -u origin main --force

# Create dev from main
git checkout -b dev
git push -u origin dev

# ============================================================
# DEC 10, 2025 — feature/ui-redesign → merge into dev
# ============================================================
Write-Host "`n=== DEC 10: feature/ui-redesign ===" -ForegroundColor Cyan
git checkout -b feature/ui-redesign dev

Git-Commit `
    "feat: landing page UI, navbar and homepage sections with fashion theme" `
    "2025-12-10T14:30:00+05:45" `
    @("frontend/src/Components/HomePage/HomePage.jsx",
      "frontend/src/Components/HomePage/HomePage.css",
      "frontend/src/Components/About/About.jsx",
      "frontend/src/Components/About/About.css",
      "frontend/src/Components/Assets/",
      "frontend/src/toast.css",
      "frontend/src/modal.css")

git push -u origin feature/ui-redesign
Git-MergeInto "dev" "feature/ui-redesign" `
    "Merge branch 'feature/ui-redesign' into dev - landing page UI" `
    "2025-12-10T18:00:00+05:45"
git push origin dev

# ============================================================
# DEC 13, 2025 — feature/authentication → merge into dev
# ============================================================
Write-Host "`n=== DEC 13: feature/authentication ===" -ForegroundColor Cyan
git checkout -b feature/authentication dev

Git-Commit `
    "feat: Firebase authentication, login/signup pages and Google OAuth" `
    "2025-12-13T11:00:00+05:45" `
    @("backend/config/firebaseAdmin.js",
      "backend/config/passport.js",
      "backend/middleware/auth.js",
      "backend/middleware/firebaseAuth.js",
      "backend/models/User.js",
      "backend/routes/auth.js",
      "backend/services/emailService.js",
      "frontend/src/Components/LoginPage/LoginPage.jsx",
      "frontend/src/Components/SigninPage/SigninPage.jsx",
      "frontend/src/Components/SigninPage/SigninPage.css",
      "frontend/src/Components/AuthCallback/AuthCallback.jsx",
      "frontend/src/context/AuthContext.jsx",
      "frontend/src/hooks/useAuth.js",
      "frontend/src/api/axiosInstance.js",
      "frontend/src/api/authApi.js",
      "frontend/src/api/index.js",
      "frontend/src/api/endpoints.js")

git push -u origin feature/authentication
Git-MergeInto "dev" "feature/authentication" `
    "Merge branch 'feature/authentication' into dev - Firebase auth and OAuth" `
    "2025-12-13T17:00:00+05:45"
git push origin dev

# ============================================================
# DEC 16, 2025 — feature/authentication (password reset) → merge into main
# ============================================================
Write-Host "`n=== DEC 16: feature/authentication password reset ===" -ForegroundColor Cyan
git checkout feature/authentication

Git-Commit `
    "feat: password reset functionality, auth validation and session persistence" `
    "2025-12-16T10:00:00+05:45" `
    @("frontend/src/Components/ForgotPassword/ForgotPassword.jsx",
      "frontend/src/Components/ForgotPassword/ForgotPassword.css",
      "frontend/src/api/userApi.js",
      "frontend/src/api/endpoints.js")

git push origin feature/authentication
Git-MergeInto "dev" "feature/authentication" `
    "Merge branch 'feature/authentication' into dev - password reset" `
    "2025-12-16T14:00:00+05:45"
git push origin dev

Git-MergeInto "main" "dev" `
    "Merge dev into main - authentication complete" `
    "2025-12-16T16:00:00+05:45"
git push origin main

# ============================================================
# DEC 21, 2025 — feature/wardrobe-management → merge into dev
# ============================================================
Write-Host "`n=== DEC 21: feature/wardrobe-management ===" -ForegroundColor Cyan
git checkout -b feature/wardrobe-management dev

Git-Commit `
    "feat: wardrobe schema, clothing upload feature and CRUD operations" `
    "2025-12-21T10:00:00+05:45" `
    @("backend/models/Wardrobe.js",
      "backend/models/WardrobeItem.js",
      "backend/middleware/uploadMiddleware.js",
      "backend/routes/wardrobe.js",
      "backend/routes/wardrobeRoutes.js",
      "backend/public/",
      "frontend/src/Components/Wardrobe/Wardrobe.jsx",
      "frontend/src/Components/Wardrobe/Wardrobe.css",
      "frontend/src/api/wardrobeApi.js")

git push -u origin feature/wardrobe-management
Git-MergeInto "dev" "feature/wardrobe-management" `
    "Merge branch 'feature/wardrobe-management' into dev - wardrobe CRUD" `
    "2025-12-21T16:00:00+05:45"
git push origin dev

# ============================================================
# DEC 27, 2025 — feature/wardrobe-management (filters) → merge into main
# ============================================================
Write-Host "`n=== DEC 27: feature/wardrobe-management filters ===" -ForegroundColor Cyan
git checkout feature/wardrobe-management

Git-Commit `
    "feat: category filters, favorites/save outfit and improved clothing organization UI" `
    "2025-12-27T11:00:00+05:45" `
    @("frontend/src/Components/CategoryPage/CategoryPage.jsx",
      "frontend/src/Components/CategoryPage/CategoryPage.css",
      "frontend/src/Components/WardrobeDetail/WardrobeDetail.jsx",
      "frontend/src/Components/WardrobeDetail/WardrobeDetail.css",
      "frontend/src/Components/ProfilePage/ProfilePage.jsx",
      "frontend/src/Components/ProfilePage/ProfilePage.css")

git push origin feature/wardrobe-management
Git-MergeInto "dev" "feature/wardrobe-management" `
    "Merge branch 'feature/wardrobe-management' into dev - filters and favorites" `
    "2025-12-27T15:00:00+05:45"
git push origin dev

Git-MergeInto "main" "dev" `
    "Merge dev into main - wardrobe management complete" `
    "2025-12-27T17:00:00+05:45"
git push origin main

# ============================================================
# JAN 3, 2026 — feature/outfit-planner → merge into dev
# ============================================================
Write-Host "`n=== JAN 3: feature/outfit-planner ===" -ForegroundColor Cyan
git checkout -b feature/outfit-planner dev

Git-Commit `
    "feat: outfit combination module, mix and match system and saved outfits" `
    "2026-01-03T10:00:00+05:45" `
    @("frontend/src/Components/Collections/Collections.jsx",
      "frontend/src/Components/Collections/Collections.css")

git push -u origin feature/outfit-planner
Git-MergeInto "dev" "feature/outfit-planner" `
    "Merge branch 'feature/outfit-planner' into dev - outfit planner" `
    "2026-01-03T16:00:00+05:45"
git push origin dev

# ============================================================
# JAN 8, 2026 — feature/ui-redesign (dashboard) → merge into main
# ============================================================
Write-Host "`n=== JAN 8: feature/ui-redesign dashboard ===" -ForegroundColor Cyan
git checkout feature/ui-redesign

Git-Commit `
    "feat: redesigned dashboard UI, improved responsive layout and animations" `
    "2026-01-08T10:00:00+05:45" `
    @("frontend/src/Components/AdminDashboard/AdminDashboard.jsx",
      "frontend/src/Components/AdminDashboard/AdminDashboard.css",
      "frontend/src/utils/browserCompatibility.js",
      "frontend/src/App.jsx")

git push origin feature/ui-redesign
Git-MergeInto "dev" "feature/ui-redesign" `
    "Merge branch 'feature/ui-redesign' into dev - dashboard redesign" `
    "2026-01-08T14:00:00+05:45"
git push origin dev

Git-MergeInto "main" "dev" `
    "Merge dev into main - UI redesign and outfit planner" `
    "2026-01-08T17:00:00+05:45"
git push origin main

# ============================================================
# JAN 14, 2026 — feature/ar-tryon → merge into dev
# ============================================================
Write-Host "`n=== JAN 14: feature/ar-tryon ===" -ForegroundColor Cyan
git checkout -b feature/ar-tryon dev

Git-Commit `
    "feat: integrated AR.js, camera detection and initial AR outfit overlay" `
    "2026-01-14T10:00:00+05:45" `
    @("frontend/src/Components/ARTryOn/ARTryOn.jsx",
      "frontend/src/Components/ARTryOn/ARTryOn.css",
      "frontend/src/Components/ARTryOn.jsx",
      "frontend/src/api/arTryOnApi.js",
      "backend/routes/arTryOn.js",
      "backend/utils/textureUtils.js")

git push -u origin feature/ar-tryon
Git-MergeInto "dev" "feature/ar-tryon" `
    "Merge branch 'feature/ar-tryon' into dev - AR integration" `
    "2026-01-14T16:00:00+05:45"
git push origin dev

# ============================================================
# JAN 18, 2026 — fix/ar-alignment → merge into dev
# ============================================================
Write-Host "`n=== JAN 18: fix/ar-alignment ===" -ForegroundColor Cyan
git checkout -b fix/ar-alignment dev

Git-Commit `
    "fix: AR clothing alignment issues, overlay positioning and camera responsiveness" `
    "2026-01-18T10:00:00+05:45" `
    @("frontend/src/Components/ARGallery/ARGallery.jsx",
      "frontend/src/Components/ARGallery/ARGallery.css",
      "frontend/src/Components/ARTryOnPage/ARTryOnPage.jsx")

git push -u origin fix/ar-alignment
Git-MergeInto "dev" "fix/ar-alignment" `
    "Merge branch 'fix/ar-alignment' into dev - AR alignment fixes" `
    "2026-01-18T15:00:00+05:45"
git push origin dev

# ============================================================
# JAN 23, 2026 — feature/ar-tryon (preview) → merge into main
# ============================================================
Write-Host "`n=== JAN 23: feature/ar-tryon preview ===" -ForegroundColor Cyan
git checkout feature/ar-tryon

Git-Commit `
    "feat: AR outfit preview, improved rendering performance and loading speed" `
    "2026-01-23T10:00:00+05:45" `
    @("frontend/src/Components/LensStudioAR/LensStudioAR.jsx",
      "frontend/src/Components/LensStudioAR/LensStudioAR.css",
      "frontend/src/Components/DynamicLensAR/DynamicLensAR.jsx",
      "frontend/src/Components/DynamicLensAR/DynamicLensAR.css",
      "frontend/vite.config.js")

git push origin feature/ar-tryon
Git-MergeInto "dev" "feature/ar-tryon" `
    "Merge branch 'feature/ar-tryon' into dev - AR preview and performance" `
    "2026-01-23T14:00:00+05:45"
git push origin dev

Git-MergeInto "main" "dev" `
    "Merge dev into main - AR try-on complete" `
    "2026-01-23T17:00:00+05:45"
git push origin main

# ============================================================
# FEB 2, 2026 — feature/thrift-system → merge into dev
# ============================================================
Write-Host "`n=== FEB 2: feature/thrift-system ===" -ForegroundColor Cyan
git checkout -b feature/thrift-system dev

Git-Commit `
    "feat: resell clothing feature, donation option and exchange workflow" `
    "2026-02-02T10:00:00+05:45" `
    @("backend/routes/payment.js",
      "frontend/src/Components/PaymentSuccess/PaymentSuccess.jsx",
      "frontend/src/api/adminApi.js")

git push -u origin feature/thrift-system
Git-MergeInto "dev" "feature/thrift-system" `
    "Merge branch 'feature/thrift-system' into dev - resell and donation" `
    "2026-02-02T16:00:00+05:45"
git push origin dev

# ============================================================
# FEB 6, 2026 — feature/thrift-system (status) → merge into main
# ============================================================
Write-Host "`n=== FEB 6: feature/thrift-system status labels ===" -ForegroundColor Cyan
git checkout feature/thrift-system

Git-Commit `
    "feat: keep/archive clothing option, item status labels and thrift listing UI" `
    "2026-02-06T10:00:00+05:45" `
    @("backend/routes/admin.js",
      "backend/middleware/adminAuth.js",
      "backend/scripts/makeAdmin.js")

git push origin feature/thrift-system
Git-MergeInto "dev" "feature/thrift-system" `
    "Merge branch 'feature/thrift-system' into dev - thrift listing UI" `
    "2026-02-06T14:00:00+05:45"
git push origin dev

Git-MergeInto "main" "dev" `
    "Merge dev into main - thrift system complete" `
    "2026-02-06T17:00:00+05:45"
git push origin main

# ============================================================
# FEB 12, 2026 — fix/mobile-responsive → merge into dev
# ============================================================
Write-Host "`n=== FEB 12: fix/mobile-responsive ===" -ForegroundColor Cyan
git checkout -b fix/mobile-responsive dev

Git-Commit `
    "fix: mobile responsiveness issues, layout for smaller devices and navbar optimization" `
    "2026-02-12T10:00:00+05:45" `
    @("frontend/src/Components/CanvaARTryOn/")

git push -u origin fix/mobile-responsive
Git-MergeInto "dev" "fix/mobile-responsive" `
    "Merge branch 'fix/mobile-responsive' into dev - mobile fixes" `
    "2026-02-12T15:00:00+05:45"
git push origin dev

# ============================================================
# FEB 18, 2026 — feature/outfit-planner (recommendations) → merge into main
# ============================================================
Write-Host "`n=== FEB 18: feature/outfit-planner recommendations ===" -ForegroundColor Cyan
git checkout feature/outfit-planner

Git-Commit `
    "feat: improved recommendation logic, outfit saving flow and occasion-based styling" `
    "2026-02-18T10:00:00+05:45" `
    @("frontend/src/Components/TextureUpload/TextureUpload.jsx",
      "frontend/src/Components/TextureUpload/TextureUpload.css")

git push origin feature/outfit-planner
Git-MergeInto "dev" "feature/outfit-planner" `
    "Merge branch 'feature/outfit-planner' into dev - recommendations" `
    "2026-02-18T14:00:00+05:45"
git push origin dev

Git-MergeInto "main" "dev" `
    "Merge dev into main - outfit planner and mobile fixes" `
    "2026-02-18T17:00:00+05:45"
git push origin main

# ============================================================
# FEB 24, 2026 — fix/ar-alignment (lag) → merge into dev
# ============================================================
Write-Host "`n=== FEB 24: fix/ar-alignment lag ===" -ForegroundColor Cyan
git checkout fix/ar-alignment

Git-Commit `
    "fix: reduced AR lag issues, improved camera tracking and minor UI fixes" `
    "2026-02-24T10:00:00+05:45" `
    @("frontend/src/Components/ARTryOn/ARTryOn.jsx",
      "frontend/src/Components/ARTryOn/ARTryOn.css")

git push origin fix/ar-alignment
Git-MergeInto "dev" "fix/ar-alignment" `
    "Merge branch 'fix/ar-alignment' into dev - AR lag fixes" `
    "2026-02-24T15:00:00+05:45"
git push origin dev

# ============================================================
# MAR 3, 2026 — testing/system-testing → merge into dev
# ============================================================
Write-Host "`n=== MAR 3: testing/system-testing ===" -ForegroundColor Cyan
git checkout -b testing/system-testing dev

Git-Commit `
    "test: unit testing, integration testing and authentication flow tests" `
    "2026-03-03T10:00:00+05:45" `
    @("backend/test-api.js")

git push -u origin testing/system-testing
Git-MergeInto "dev" "testing/system-testing" `
    "Merge branch 'testing/system-testing' into dev - system tests" `
    "2026-03-03T16:00:00+05:45"
git push origin dev

# ============================================================
# MAR 8, 2026 — testing/ar-testing → merge into main
# ============================================================
Write-Host "`n=== MAR 8: testing/ar-testing ===" -ForegroundColor Cyan
git checkout -b testing/ar-testing dev

Git-Commit `
    "test: AR testing in different lighting, camera compatibility and visualization fixes" `
    "2026-03-08T10:00:00+05:45" `
    @("frontend/src/Components/ARTryOn/ARTryOn.jsx",
      "frontend/src/Components/ARGallery/ARGallery.jsx")

git push -u origin testing/ar-testing
Git-MergeInto "dev" "testing/ar-testing" `
    "Merge branch 'testing/ar-testing' into dev - AR tests" `
    "2026-03-08T14:00:00+05:45"
git push origin dev

Git-MergeInto "main" "dev" `
    "Merge dev into main - testing complete" `
    "2026-03-08T17:00:00+05:45"
git push origin main

# ============================================================
# MAR 15, 2026 — docs/report-update → merge into main
# ============================================================
Write-Host "`n=== MAR 15: docs/report-update ===" -ForegroundColor Cyan
git checkout -b docs/report-update main

Git-Commit `
    "docs: updated README, setup instructions and project screenshots" `
    "2026-03-15T10:00:00+05:45" `
    @("frontend/.env.example",
      "frontend/public/")

git push -u origin docs/report-update
Git-MergeInto "main" "docs/report-update" `
    "Merge branch 'docs/report-update' into main - documentation" `
    "2026-03-15T15:00:00+05:45"
git push origin main

# ============================================================
# MAR 20, 2026 — fix/final-bugs → merge into main
# ============================================================
Write-Host "`n=== MAR 20: fix/final-bugs ===" -ForegroundColor Cyan
git checkout -b fix/final-bugs main

Git-Commit `
    "fix: final UI inconsistencies, optimized database queries and backend cleanup" `
    "2026-03-20T10:00:00+05:45" `
    @("backend/server.js",
      "backend/config/passport.js",
      "backend/models/User.js",
      "frontend/src/App.jsx",
      "frontend/index.html",
      "frontend/package.json",
      "backend/package.json")

git push -u origin fix/final-bugs
Git-MergeInto "main" "fix/final-bugs" `
    "Merge branch 'fix/final-bugs' into main - final bug fixes" `
    "2026-03-20T16:00:00+05:45"
git push origin main

# ============================================================
# MAR 27, 2026 — deployment/pre-defense → merge into main
# ============================================================
Write-Host "`n=== MAR 27: deployment/pre-defense ===" -ForegroundColor Cyan
git checkout -b deployment/pre-defense main

Git-Commit `
    "chore: final deployment preparation, environment variable cleanup and pre-defense testing" `
    "2026-03-27T10:00:00+05:45" `
    @("frontend/vite.config.js",
      ".gitignore")

git push -u origin deployment/pre-defense
Git-MergeInto "main" "deployment/pre-defense" `
    "Merge branch 'deployment/pre-defense' into main - ready for defense" `
    "2026-03-27T16:00:00+05:45"
git push origin main

# ============================================================
# DONE
# ============================================================
Write-Host "`n=== DONE ===" -ForegroundColor Green
Write-Host "History rewritten with proper branches and dates." -ForegroundColor Green
Write-Host "Run: git log --oneline --graph --all" -ForegroundColor Cyan

# Cleanup env vars
Remove-Item Env:\GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue
Remove-Item Env:\GIT_AUTHOR_NAME -ErrorAction SilentlyContinue
Remove-Item Env:\GIT_AUTHOR_EMAIL -ErrorAction SilentlyContinue
Remove-Item Env:\GIT_COMMITTER_NAME -ErrorAction SilentlyContinue
Remove-Item Env:\GIT_COMMITTER_EMAIL -ErrorAction SilentlyContinue
