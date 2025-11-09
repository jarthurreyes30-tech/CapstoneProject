# API Endpoint Testing Script
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "API Endpoint Diagnostic Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$apiUrl = "http://localhost:8000/api"

# Test if backend is running
Write-Host "Testing backend connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/ping" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend is running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running or not accessible" -ForegroundColor Red
    Write-Host "   Please start the backend: php artisan serve" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Testing public endpoints..." -ForegroundColor Cyan

# Test public endpoints
$publicEndpoints = @(
    @{Method="GET"; Path="/charities"; Name="Get Charities"},
    @{Method="GET"; Path="/campaigns"; Name="Get Campaigns"}
)

foreach ($endpoint in $publicEndpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$apiUrl$($endpoint.Path)" -Method $endpoint.Method -TimeoutSec 5 -ErrorAction Stop
        Write-Host "  ✅ $($endpoint.Name) - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $($endpoint.Name) - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Authentication-required endpoints need a valid token to test." -ForegroundColor Yellow
Write-Host "To test authenticated endpoints, use Postman or login through the frontend." -ForegroundColor Yellow
