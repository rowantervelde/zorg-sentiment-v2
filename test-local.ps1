# Test script for local development (PowerShell version)
# Run with: .\test-local.ps1

Write-Host "Testing Zorg Sentiment v2 locally..." -ForegroundColor Cyan
Write-Host ""

# Check if netlify dev is running
try {
    $null = Invoke-WebRequest -Uri "http://localhost:8888" -UseBasicParsing -ErrorAction Stop
    Write-Host "[OK] Netlify dev is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] netlify dev is not running" -ForegroundColor Red
    Write-Host "Start it with: netlify dev" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 1: Collect sentiment data
Write-Host "Test 1: Collecting sentiment data..." -ForegroundColor Yellow
Write-Host "Note: Using netlify functions:invoke" -ForegroundColor Gray

try {
    # Use netlify CLI to invoke the function
    $payload = @{ next_run = "2025-10-25T15:00:00Z" } | ConvertTo-Json -Compress
    $collectOutput = netlify functions:invoke collect-sentiment --payload $payload 2>&1
    
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host $collectOutput
    Write-Host ""
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Tip: Make sure netlify dev is running and the function exists" -ForegroundColor Yellow
    Write-Host ""
}

# Wait a moment for data to be saved
Start-Sleep -Seconds 2

# Test 2: Fetch current sentiment
Write-Host "Test 2: Fetching current sentiment..." -ForegroundColor Yellow
try {
    $sentimentResponse = Invoke-RestMethod -Uri "http://localhost:8888/api/sentiment"
    Write-Host "Response:" -ForegroundColor Gray
    $sentimentResponse | ConvertTo-Json -Depth 5
    Write-Host ""
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Fetch with trend
Write-Host "Test 3: Fetching sentiment with trend..." -ForegroundColor Yellow
try {
    $trendResponse = Invoke-RestMethod -Uri "http://localhost:8888/api/sentiment?include=trend"
    Write-Host "Response:" -ForegroundColor Gray
    $trendResponse | ConvertTo-Json -Depth 5
    Write-Host ""
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Test rate limiting
Write-Host "Test 4: Testing rate limiting (21 requests)..." -ForegroundColor Yellow
$rateLimitHit = $false
for ($i = 1; $i -le 21; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8888/api/sentiment" -UseBasicParsing -ErrorAction Stop
        if ($i -eq 21) {
            Write-Host "[WARN] Expected 429, got $($response.StatusCode) on request $i" -ForegroundColor Yellow
        }
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 429 -and $i -eq 21) {
            Write-Host "[OK] Rate limiting working! Got 429 on request $i" -ForegroundColor Green
            $rateLimitHit = $true
        }
    }
}
Write-Host ""

Write-Host "[OK] All tests complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Open the app in browser:" -ForegroundColor Cyan
Write-Host "   http://localhost:8888" -ForegroundColor White
Write-Host ""
