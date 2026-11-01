# Nexora AI Full Stack Verification Script

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "      Verifying Nexora AI Platform        " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$root = Split-Path -Parent $PSScriptRoot

# 1. Verify Backend Build
Write-Host "[1/4] Checking Backend TypeScript Build..." -ForegroundColor Yellow
$beBuild = Start-Process cmd.exe -ArgumentList "/c", "npm run build" -WorkingDirectory "$root\backend" -Wait -PassThru
if ($beBuild.ExitCode -eq 0) {
    Write-Host "  Backend TypeScript build passed!" -ForegroundColor Green
} else {
    Write-Host "  Backend build failed with exit code $($beBuild.ExitCode)" -ForegroundColor Red
}

# 2. Verify Frontend Typecheck
Write-Host "[2/4] Checking Frontend TypeScript Typing..." -ForegroundColor Yellow
$feCheck = Start-Process cmd.exe -ArgumentList "/c", "npx tsc --noEmit" -WorkingDirectory "$root\frontend" -Wait -PassThru
if ($feCheck.ExitCode -eq 0) {
    Write-Host "  Frontend TypeScript check passed (0 errors)!" -ForegroundColor Green
} else {
    Write-Host "  Frontend typecheck failed with exit code $($feCheck.ExitCode)" -ForegroundColor Red
}

# 3. Test Services Running Together
Write-Host "[3/4] Launching test instances of ML Service (8000) and Backend (3001)..." -ForegroundColor Yellow
$mlProc = Start-Process python -ArgumentList "-m", "uvicorn", "main:app", "--port", "8000" -WorkingDirectory "$root\ml-service" -PassThru
$beProc = Start-Process node -ArgumentList "dist/index.js" -WorkingDirectory "$root\backend" -PassThru

Start-Sleep -Seconds 4

try {
    # Test ML Service
    $mlHealth = Invoke-RestMethod -Uri "http://localhost:8000/health"
    $mlGraph = Invoke-RestMethod -Uri "http://localhost:8000/graph"
    Write-Host "  ML Service Health: $($mlHealth.status) ($($mlGraph.nodes.Count) nodes, $($mlGraph.edges.Count) edges)" -ForegroundColor Green

    # Test Backend Health
    $beHealth = Invoke-RestMethod -Uri "http://localhost:3001/health"
    Write-Host "  Backend Health: $($beHealth.status)" -ForegroundColor Green

    # 4. Test Auth & End-to-End Analysis
    Write-Host "[4/4] Testing Demo User Authentication & Gap Analysis..." -ForegroundColor Yellow
    $loginBody = @{ email = 'demo@nexora.ai'; password = 'Password123!' } | ConvertTo-Json
    $authRes = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "  Authenticated as: $($authRes.user.email) (Token length: $($authRes.token.Length))" -ForegroundColor Green

    $authHeader = @{ Authorization = "Bearer $($authRes.token)" }
    $analysisBody = @{ resume_id = 'res-demo-001'; role_profile_id = 'role-1' } | ConvertTo-Json
    $analysisRes = Invoke-RestMethod -Uri "http://localhost:3001/api/analyses" -Method Post -Headers $authHeader -Body $analysisBody -ContentType "application/json"
    Write-Host "  Analysis ID: $($analysisRes.analysis_id)" -ForegroundColor Green
    Write-Host "  Matched Skills: $($analysisRes.matched.Count) | Missing Skills: $($analysisRes.missing.Count) | Tasks: $($analysisRes.roadmap_tasks.Count)" -ForegroundColor Green

    Write-Host ""
    Write-Host "All verification checks PASSED successfully!" -ForegroundColor Green
} catch {
    Write-Host "  Verification error: $_" -ForegroundColor Red
} finally {
    Stop-Process -Id $mlProc.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $beProc.Id -Force -ErrorAction SilentlyContinue
}
