# Push to GitHub PowerShell Helper
param(
    [string]$Token = ""
)

$gitCmd = "C:\Users\PRANETH\.gemini\antigravity\scratch\mingit\cmd\git.exe"
if (-not (Test-Path $gitCmd)) {
    $gitCmd = "git"
}

$repoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoDir

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Pushing to GitHub: Praneth010/car-parking-management-system" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrWhiteSpace($Token)) {
    $Token = Read-Host "Enter your GitHub Personal Access Token (or press ENTER to try standard credentials)"
}

if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Host "[INFO] Attempting standard push..." -ForegroundColor Yellow
    & $gitCmd push -u origin main
} else {
    Write-Host "[INFO] Pushing using Personal Access Token..." -ForegroundColor Yellow
    $remoteUrl = "https://Praneth010:$($Token)@github.com/Praneth010/car-parking-management-system.git"
    & $gitCmd push -u $remoteUrl main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Successfully pushed all files to GitHub!" -ForegroundColor Green
    Write-Host "Check your repository at: https://github.com/Praneth010/car-parking-management-system" -ForegroundColor Cyan
} else {
    Write-Host "`n[NOTICE] Push failed or authentication was required." -ForegroundColor Red
    Write-Host "Make sure:
1. The repository https://github.com/new is created named 'car-parking-management-system'
2. Your token has the 'repo' scope from https://github.com/settings/tokens" -ForegroundColor Yellow
}
