Write-Host "🚀 Starting Deployment Process..." -ForegroundColor Cyan

# 1. Check for Node/NPM
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "✅ Node/NPM found." -ForegroundColor Green
} else {
    Write-Host "❌ NPM not found. Please install Node.js." -ForegroundColor Red
    exit
}

# 2. Check for Git
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "✅ Git found." -ForegroundColor Green
} else {
    Write-Host "❌ Git not found. Please install Git." -ForegroundColor Red
    exit
}

# 3. Build Project
Write-Host "`n📦 Building Project for Production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build Success!" -ForegroundColor Green
} else {
    Write-Host "❌ Build Failed. Check errors above." -ForegroundColor Red
    exit
}

# 4. Git Operations
Write-Host "`n🐙 Handling Git Operations..." -ForegroundColor Yellow
git status
git add .
git commit -m "Release: Production Build & Security Fixes (Admin/API Key)"

# 5. Push (Optional - checks if remote exists)
$remotes = git remote -v
if ($remotes) {
    Write-Host "🚀 Pushing to remote..." -ForegroundColor Cyan
    git push
    Write-Host "✅ Code pushed to remote repository." -ForegroundColor Green
} else {
    Write-Host "⚠️ No remote repository configured. Skipping push." -ForegroundColor Yellow
    Write-Host "   Run: git remote add origin <url>"
}

Write-Host "`n✨ Deployment Script Completed!" -ForegroundColor Magenta
Read-Host -Prompt "Press Enter to exit"
