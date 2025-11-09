# Test Document Upload and Verification Flow
# This script tests the complete flow from upload to approval/rejection

Write-Host "=== Document Flow Test Script ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_URL = "http://localhost:8000/api"
$FRONTEND_URL = "http://localhost:5173"

Write-Host "Step 1: Checking database for document counts..." -ForegroundColor Yellow
Write-Host ""

# Run SQL query to check current state
$sqlQuery = @"
SELECT 
    c.id as charity_id,
    c.name as charity_name,
    c.verification_status as charity_status,
    COUNT(cd.id) as total_documents,
    SUM(CASE WHEN cd.verification_status = 'approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN cd.verification_status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN cd.verification_status = 'rejected' THEN 1 ELSE 0 END) as rejected
FROM charities c
LEFT JOIN charity_documents cd ON c.id = cd.charity_id
GROUP BY c.id, c.name, c.verification_status
ORDER BY c.id;
"@

Write-Host "SQL Query to run in your database:" -ForegroundColor Green
Write-Host $sqlQuery
Write-Host ""

Write-Host "Step 2: Test API Endpoints" -ForegroundColor Yellow
Write-Host ""

Write-Host "Available endpoints to test:" -ForegroundColor Green
Write-Host "  GET  $API_URL/charities/{charity_id}/documents" -ForegroundColor White
Write-Host "  POST $API_URL/charities/{charity_id}/documents" -ForegroundColor White
Write-Host "  PATCH $API_URL/admin/documents/{document_id}/approve" -ForegroundColor White
Write-Host "  PATCH $API_URL/admin/documents/{document_id}/reject" -ForegroundColor White
Write-Host ""

Write-Host "Step 3: Manual Testing Checklist" -ForegroundColor Yellow
Write-Host ""

$checklist = @(
    "[ ] Login as charity admin",
    "[ ] Navigate to Documents page ($FRONTEND_URL/charity/documents)",
    "[ ] Check statistics cards show correct counts",
    "[ ] Upload a new document",
    "[ ] Verify statistics update (Total +1, Pending +1)",
    "[ ] Login as admin",
    "[ ] Navigate to Charity Management",
    "[ ] Select a charity with pending documents",
    "[ ] Go to Documents tab",
    "[ ] Approve one document",
    "[ ] Verify document status changes to 'Approved'",
    "[ ] Reject one document with reason",
    "[ ] Verify document status changes to 'Rejected'",
    "[ ] Login back as charity admin",
    "[ ] Check Documents page shows red alert for rejected doc",
    "[ ] Verify statistics show correct counts",
    "[ ] Click 'Re-upload' on rejected document",
    "[ ] Verify rejection reason is displayed",
    "[ ] Upload corrected document",
    "[ ] Verify statistics update (Rejected -1, Pending +1)",
    "[ ] Login as admin again",
    "[ ] Verify re-uploaded document shows 'Pending Review'",
    "[ ] Approve the re-uploaded document",
    "[ ] Login as charity and verify all counts are correct"
)

foreach ($item in $checklist) {
    Write-Host "  $item" -ForegroundColor White
}

Write-Host ""
Write-Host "Step 4: Browser Console Checks" -ForegroundColor Yellow
Write-Host ""

Write-Host "Open browser console (F12) and look for these logs:" -ForegroundColor Green
Write-Host "  - 'Fetching documents for charity ID: X'" -ForegroundColor White
Write-Host "  - 'Raw API response: [...]'" -ForegroundColor White
Write-Host "  - 'Total documents: X'" -ForegroundColor White
Write-Host "  - 'Approved: X'" -ForegroundColor White
Write-Host "  - 'Pending: X'" -ForegroundColor White
Write-Host "  - 'Rejected: X'" -ForegroundColor White
Write-Host ""

Write-Host "Step 5: Expected Results" -ForegroundColor Yellow
Write-Host ""

Write-Host "If charity has 5 documents:" -ForegroundColor Green
Write-Host "  - 2 approved, 2 pending, 1 rejected" -ForegroundColor White
Write-Host ""
Write-Host "Statistics should show:" -ForegroundColor Green
Write-Host "  Total Submitted: 5" -ForegroundColor White
Write-Host "  Approved: 2" -ForegroundColor White
Write-Host "  Pending Review: 2" -ForegroundColor White
Write-Host "  Needs Revision: 1" -ForegroundColor White
Write-Host ""

Write-Host "Step 6: Troubleshooting" -ForegroundColor Yellow
Write-Host ""

Write-Host "If counts are wrong:" -ForegroundColor Red
Write-Host "  1. Check browser console for errors" -ForegroundColor White
Write-Host "  2. Check network tab for API response" -ForegroundColor White
Write-Host "  3. Run the SQL query above to verify database" -ForegroundColor White
Write-Host "  4. Check Laravel logs: storage/logs/laravel.log" -ForegroundColor White
Write-Host ""

Write-Host "Common Issues:" -ForegroundColor Red
Write-Host "  - Documents missing verification_status → Run fix_document_verification_status.sql" -ForegroundColor White
Write-Host "  - API not returning data → Check auth token" -ForegroundColor White
Write-Host "  - Frontend not updating → Clear browser cache" -ForegroundColor White
Write-Host "  - Duplicate documents → Check uploadDocument logic" -ForegroundColor White
Write-Host ""

Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
