# Quick setup script for Reddit API testing
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Reddit API Test Setup" -ForegroundColor Cyan
Write-Host "  Feature 003" -ForegroundColor Cyan  
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
$envExists = Test-Path .env

if (-not $envExists) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "You need to edit .env and add your Reddit credentials!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://www.reddit.com/prefs/apps"
    Write-Host "2. Create a new app (type: script)"
    Write-Host "3. Copy Client ID and Client Secret"
    Write-Host "4. Edit .env file and fill in credentials"
    Write-Host "5. Then run: node test-reddit-api.js"
    Write-Host ""
    notepad .env
    exit
}

Write-Host "Checking credentials..." -ForegroundColor Cyan
$envContent = Get-Content .env -Raw

$hasClientId = $envContent -match 'REDDIT_CLIENT_ID=(?!your_)(.+)'
$hasClientSecret = $envContent -match 'REDDIT_CLIENT_SECRET=(?!your_)(.+)'
$hasUserAgent = $envContent -match 'REDDIT_USER_AGENT=(?!.*YOUR_)(.+)'

if ($hasClientId -and $hasClientSecret -and $hasUserAgent) {
    Write-Host "Credentials configured!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Running test..." -ForegroundColor Cyan
    node test-reddit-api.js
}
else {
    Write-Host ""
    Write-Host "Reddit credentials not configured" -ForegroundColor Yellow
    Write-Host ""
    if (-not $hasClientId) { Write-Host "  Missing: REDDIT_CLIENT_ID" -ForegroundColor Red }
    if (-not $hasClientSecret) { Write-Host "  Missing: REDDIT_CLIENT_SECRET" -ForegroundColor Red }
    if (-not $hasUserAgent) { Write-Host "  Missing: REDDIT_USER_AGENT" -ForegroundColor Red }
    Write-Host ""
    Write-Host "See REDDIT_TEST_SETUP.md for instructions" -ForegroundColor Cyan
    notepad .env
}
