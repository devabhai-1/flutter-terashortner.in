# GitHub Push Helper Script
# Ye script GitHub repository URL leke automatically push kar dega

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GitHub Upload Helper Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if already has remote
$currentRemote = git remote -v 2>$null
if ($currentRemote) {
    Write-Host "⚠️  Remote already exists:" -ForegroundColor Yellow
    Write-Host $currentRemote
    Write-Host ""
    $remove = Read-Host "Kya aap existing remote remove karna chahte hain? (y/n)"
    if ($remove -eq "y" -or $remove -eq "Y") {
        git remote remove origin
        Write-Host "✅ Existing remote removed" -ForegroundColor Green
    } else {
        Write-Host "❌ Cancelled. Existing remote use karein." -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "📝 GitHub Repository URL enter karein:" -ForegroundColor Yellow
Write-Host "   Format: https://github.com/USERNAME/REPO_NAME.git" -ForegroundColor Gray
Write-Host "   Example: https://github.com/yourusername/terashortner.git" -ForegroundColor Gray
Write-Host ""
$repoUrl = Read-Host "Repository URL"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "❌ URL required hai!" -ForegroundColor Red
    exit
}

# Validate URL format
if (-not $repoUrl.StartsWith("https://github.com/") -and -not $repoUrl.StartsWith("git@github.com:")) {
    Write-Host "❌ Invalid GitHub URL format!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🔄 Remote add kar raha hoon..." -ForegroundColor Yellow
git remote add origin $repoUrl

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Remote add karne mein error!" -ForegroundColor Red
    exit
}

Write-Host "✅ Remote added successfully" -ForegroundColor Green

Write-Host ""
Write-Host "🔍 Remote verify kar raha hoon..." -ForegroundColor Yellow
git remote -v

Write-Host ""
Write-Host "📤 Code push kar raha hoon..." -ForegroundColor Yellow
Write-Host "   (Agar authentication prompt aaye, to GitHub username aur Personal Access Token use karein)" -ForegroundColor Gray
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Aapka code ab GitHub par hai!" -ForegroundColor Cyan
    Write-Host "   Repository: $repoUrl" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ Push failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solutions:" -ForegroundColor Yellow
    Write-Host "   1. GitHub repository create karein (agar nahi kiya)" -ForegroundColor Gray
    Write-Host "   2. Personal Access Token use karein (password nahi)" -ForegroundColor Gray
    Write-Host "   3. Repository URL verify karein" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   GitHub Token: Settings → Developer settings → Personal access tokens" -ForegroundColor Gray
}

