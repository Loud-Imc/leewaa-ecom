# Backend Module Generation Script

# Run this PowerShell script to generate all remaining backend modules

Write-Host "Generating remaining backend modules..." -ForegroundColor Green

# Cart Module
Write-Host "`nGenerating Cart module..." -ForegroundColor Cyan
npx nest g module cart --no-spec
npx nest g service cart --no-spec
npx nest g controller cart --no-spec
New-Item -ItemType Directory -Force -Path "src\cart\dto"

# Wishlist Module
Write-Host "`nGenerating Wishlist module..." -ForegroundColor Cyan
npx nest g module wishlist --no-spec
npx nest g service wishlist --no-spec
npx nest g controller wishlist --no-spec

# Coupons Module
Write-Host "`nGenerating Coupons module..." -ForegroundColor Cyan
npx nest g module coupons --no-spec
npx nest g service coupons --no-spec
npx nest g controller coupons --no-spec
New-Item -ItemType Directory -Force -Path "src\coupons\dto"

# Referrals Module
Write-Host "`nGenerating Referrals module..." -ForegroundColor Cyan
npx nest g module referrals --no-spec
npx nest g service referrals --no-spec
npx nest g controller referrals --no-spec
New-Item -ItemType Directory -Force -Path "src\referrals\dto"

Write-Host "`nAll modules generated successfully!" -ForegroundColor Green
Write-Host "Next: Copy implementation code from BACKEND_MODULES_GUIDE.md" -ForegroundColor Yellow
