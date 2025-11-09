# Testing Guide - OCR & Analytics Features

## 🧪 Testing the Merged Features

### Prerequisites
- Backend server running on `http://localhost:8000`
- Frontend server running on `http://localhost:5173`
- Test user account (donor role)
- Sample receipt images

---

## 1. Testing OCR Receipt Scanner 🔍

### Test Case 1: GCash Receipt Upload
**Steps**:
1. Login as a donor
2. Navigate to any active campaign
3. Click "Donate" or "Support This Campaign"
4. In the donation form, look for "Upload Proof of Payment" section
5. Click the upload area or use the file input
6. Select a GCash receipt image

**Expected Results**:
- ✅ "Initializing OCR engine..." message appears briefly
- ✅ Progress bar shows OCR processing (0% → 100%)
- ✅ Receipt image preview displays
- ✅ OCR confidence score appears (e.g., "85%")
- ✅ Template detected shows "🏦 GCASH"
- ✅ Form fields auto-populate:
  - Reference Number field
  - Amount field
  - Date field (if available)
- ✅ High confidence message: "🛡️ High confidence extraction..."

### Test Case 2: Low Quality Image
**Steps**:
1. Upload a blurry or low-quality receipt
2. Wait for OCR processing

**Expected Results**:
- ✅ Low confidence warning appears (< 60%)
- ✅ Warning message: "⚠️ Low confidence detected..."
- ✅ Fields may not auto-populate
- ✅ Manual entry still works

### Test Case 3: Different Receipt Types
**Test with**:
- BPI receipt
- Maya/PayMaya receipt
- BDO receipt
- PayPal receipt

**Expected Results**:
- ✅ Correct template detected for each
- ✅ Different extraction patterns work
- ✅ Confidence scores vary based on image quality

### Test Case 4: Manual Override
**Steps**:
1. Upload receipt with OCR
2. Manually edit auto-populated fields
3. Submit donation

**Expected Results**:
- ✅ Can edit all fields even after OCR
- ✅ Changes persist
- ✅ Submission works with manual values

---

## 2. Testing Donor Analytics 📊

### Test Case 1: View Analytics Dashboard
**Steps**:
1. Login as a donor who has made donations
2. Navigate to Analytics page (usually `/donor/analytics`)

**Expected Results**:
- ✅ Page loads without errors
- ✅ Four stat cards display:
  - Total Donated (₱)
  - Total Donations (count)
  - Average Donation (₱)
  - Pending Amount (₱)
- ✅ Impact summary card shows personalized message
- ✅ All values are accurate

### Test Case 2: Donations by Type Chart
**Steps**:
1. Click on "By Type" tab
2. View pie chart

**Expected Results**:
- ✅ Pie chart displays with colors
- ✅ Each slice shows campaign type and amount
- ✅ Legend appears below chart
- ✅ Grid below shows detailed breakdown
- ✅ Tooltips work on hover

### Test Case 3: Timeline Chart
**Steps**:
1. Click on "Timeline" tab
2. View line chart

**Expected Results**:
- ✅ Line chart shows last 12 months
- ✅ Two lines: Amount (₱) and Count
- ✅ Dual Y-axis (left for amount, right for count)
- ✅ Last 6 months summary cards display
- ✅ Hover tooltips show exact values

### Test Case 4: Top Charities Chart
**Steps**:
1. Click on "Top Charities" tab
2. View bar chart

**Expected Results**:
- ✅ Horizontal bar chart displays
- ✅ Top 10 charities shown
- ✅ Ranked by total donated
- ✅ Detailed list below chart
- ✅ Shows donation count per charity

### Test Case 5: Recent Donations
**Steps**:
1. Click on "Recent" tab
2. View donation list

**Expected Results**:
- ✅ List of recent donations
- ✅ Each shows: campaign, charity, amount, date, status
- ✅ Status badges (completed, pending, rejected)
- ✅ Proper date formatting
- ✅ Campaign types displayed

### Test Case 6: No Data State
**Steps**:
1. Login as new donor with no donations
2. View Analytics page

**Expected Results**:
- ✅ Empty state message: "Start making a difference today!"
- ✅ No errors or crashes
- ✅ Helpful icons and messages
- ✅ Encouragement to donate

---

## 3. Integration Testing

### Test Case 1: End-to-End Donation Flow
**Steps**:
1. Browse campaigns
2. Select a campaign
3. Click donate
4. Upload receipt (OCR extracts data)
5. Verify auto-filled fields
6. Submit donation
7. Wait for charity approval
8. Check analytics page

**Expected Results**:
- ✅ OCR works correctly
- ✅ Donation submits successfully
- ✅ Appears in donation history
- ✅ Analytics update after approval
- ✅ Charts reflect new donation

### Test Case 2: Multiple Donations
**Steps**:
1. Make 5+ donations to different campaigns
2. Use different payment methods
3. Upload different receipt types
4. Check analytics

**Expected Results**:
- ✅ All donations tracked
- ✅ Charts show distribution
- ✅ Statistics accurate
- ✅ Timeline shows trend

---

## 4. Error Handling Testing

### Test Case 1: Network Error During OCR
**Steps**:
1. Disable internet briefly
2. Upload receipt
3. Re-enable internet

**Expected Results**:
- ✅ Graceful error handling
- ✅ User can retry
- ✅ No app crash

### Test Case 2: Invalid File Upload
**Steps**:
1. Try uploading non-image file
2. Try uploading file > 2MB

**Expected Results**:
- ✅ Error message appears
- ✅ Upload rejected
- ✅ Clear instructions provided

### Test Case 3: API Failure
**Steps**:
1. Stop backend server
2. Try to view analytics

**Expected Results**:
- ✅ Error toast notification
- ✅ Loading state ends
- ✅ Helpful error message

---

## 5. Performance Testing

### Test Case 1: OCR Speed
**Measure**:
- Time from upload to OCR completion
- First load vs subsequent loads

**Expected**:
- ✅ First load: 2-5 seconds (worker initialization)
- ✅ Subsequent: 1-3 seconds
- ✅ Progress indicator shows activity

### Test Case 2: Analytics Load Time
**Measure**:
- Time to load analytics page
- Chart rendering time

**Expected**:
- ✅ Page loads in < 2 seconds
- ✅ Charts render smoothly
- ✅ No lag on interactions

---

## 6. Browser Compatibility

### Test On:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Safari (latest)

### Mobile Testing:
- ✅ Chrome Mobile
- ✅ Safari iOS
- ✅ Responsive design works
- ✅ OCR works on mobile uploads

---

## 7. Accessibility Testing

### Test Cases:
- ✅ Keyboard navigation works
- ✅ Screen reader compatible
- ✅ Color contrast sufficient
- ✅ Focus indicators visible
- ✅ Error messages announced

---

## 🐛 Common Issues & Solutions

### Issue 1: OCR Not Working
**Symptoms**: Upload works but no OCR processing
**Solution**:
- Check browser console for errors
- Verify tesseract.js loaded
- Clear cache and reload
- Check internet connection

### Issue 2: Charts Not Displaying
**Symptoms**: Analytics page shows but charts missing
**Solution**:
- Check if recharts is installed
- Verify API returns data
- Check browser console
- Ensure data format is correct

### Issue 3: Auto-Fill Not Working
**Symptoms**: OCR runs but fields don't populate
**Solution**:
- Check OCR confidence score
- Verify receipt template detected
- Check console for extraction logs
- Try clearer image

### Issue 4: Analytics Shows Wrong Data
**Symptoms**: Numbers don't match donation history
**Solution**:
- Check API endpoint response
- Verify database data
- Clear browser cache
- Check date filters

---

## ✅ Test Checklist

### OCR Features:
- [ ] Upload receipt image
- [ ] OCR processes successfully
- [ ] Template detected correctly
- [ ] Confidence score displays
- [ ] Fields auto-populate
- [ ] Manual override works
- [ ] High/low confidence warnings
- [ ] Image preview shows
- [ ] Multiple receipt types work
- [ ] Error handling works

### Analytics Features:
- [ ] Page loads correctly
- [ ] All stat cards display
- [ ] Pie chart renders
- [ ] Line chart renders
- [ ] Bar chart renders
- [ ] Recent donations list
- [ ] Empty states work
- [ ] Tooltips functional
- [ ] Responsive design
- [ ] Dark mode compatible

### Integration:
- [ ] End-to-end flow works
- [ ] Data persists correctly
- [ ] Charts update after donations
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Mobile compatible
- [ ] Cross-browser compatible

---

## 📊 Test Results Template

```markdown
## Test Session: [Date]
**Tester**: [Name]
**Browser**: [Browser + Version]
**Environment**: [Dev/Staging/Prod]

### OCR Tests:
- GCash Receipt: ✅/❌
- BPI Receipt: ✅/❌
- Low Quality Image: ✅/❌
- Auto-Fill: ✅/❌

### Analytics Tests:
- Dashboard Load: ✅/❌
- Pie Chart: ✅/❌
- Line Chart: ✅/❌
- Bar Chart: ✅/❌
- Recent List: ✅/❌

### Issues Found:
1. [Issue description]
2. [Issue description]

### Notes:
[Additional observations]
```

---

**Last Updated**: November 2, 2025  
**Version**: 1.0  
**Status**: Ready for Testing
