# Test Notifications API
$baseUrl = "http://127.0.0.1:8000/api"

Write-Host "=== Testing Notifications API ===" -ForegroundColor Cyan

# Get first user token
Write-Host "`n1. Getting user token..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -Body (@{
        email = "donor@example.com"
        password = "password"
    } | ConvertTo-Json) -ContentType "application/json"
    
    $token = $loginResponse.token
    Write-Host "✓ Token obtained" -ForegroundColor Green
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Accept" = "application/json"
    }
    
    # Test 1: Get notifications
    Write-Host "`n2. Fetching notifications..." -ForegroundColor Yellow
    $notifications = Invoke-RestMethod -Uri "$baseUrl/me/notifications" -Method Get -Headers $headers
    Write-Host "✓ Notifications fetched: $($notifications.data.Count) notifications" -ForegroundColor Green
    
    if ($notifications.data.Count -gt 0) {
        Write-Host "`nSample notification:" -ForegroundColor Cyan
        $sample = $notifications.data[0]
        Write-Host "  ID: $($sample.id)"
        Write-Host "  Type: $($sample.type)"
        Write-Host "  Title: $($sample.title)"
        Write-Host "  Message: $($sample.message)"
        Write-Host "  Read: $($sample.read)"
    }
    
    # Test 2: Get unread count
    Write-Host "`n3. Getting unread count..." -ForegroundColor Yellow
    $unreadCount = Invoke-RestMethod -Uri "$baseUrl/notifications/unread-count" -Method Get -Headers $headers
    Write-Host "✓ Unread count: $($unreadCount.count)" -ForegroundColor Green
    
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
