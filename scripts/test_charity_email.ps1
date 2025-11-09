#!/usr/bin/env pwsh
# Test charity verification email sending

Write-Host "Testing Charity Verification Email Sending..." -ForegroundColor Cyan
Write-Host ""

Set-Location "$PSScriptRoot\..\capstone_backend"
php ..\scripts\test_charity_verification_email.php

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Green
