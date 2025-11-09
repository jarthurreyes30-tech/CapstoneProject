# Quick Troubleshooting Guide

## JSON Parse Errors Fixed ✅

The JSON parse errors on `/donor/charities` have been fixed with better error handling.

## Quick Checks

### 1. Is the Backend Running?
```powershell
# Terminal 1: Start backend
cd capstone_backend
php artisan serve
```
Should see: `Laravel development server started: http://127.0.0.1:8000`

### 2. Is the Frontend Running?
```powershell
# Terminal 2: Start frontend
cd capstone_frontend
npm run dev
```
Should see: `Local: http://localhost:8080/`

### 3. Are You Logged In?
- Visit `http://localhost:8080/auth/login`
- Log in as a donor user
- Then navigate to `/donor/charities`

### 4. Check Browser Console
Open DevTools (F12) and look for:
- ✅ **Good**: "No auth token, skipping..." (just means you're not logged in)
- ✅ **Good**: No errors
- ❌ **Bad**: "Failed to load charities" (backend not running)
- ❌ **Bad**: "500 Internal Server Error" (check Laravel logs)

### 5. Check Network Tab
Open DevTools → Network tab:
- Look for requests to `http://127.0.0.1:8000/api/charities`
- Check Status Code: Should be `200 OK`
- Check Response: Should be JSON, not HTML

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Failed to load charities" | Start backend: `php artisan serve` |
| "No auth token found" | Log in at `/auth/login` |
| "500 Internal Server Error" | Check `capstone_backend/storage/logs/laravel.log` |
| "401 Unauthorized" | Token expired, log in again |
| CORS errors | Check `capstone_backend/config/cors.php` includes your port |
| Database errors | Run `php artisan migrate` |

## Backend Health Check
```powershell
# Test if backend is responding
curl http://127.0.0.1:8000/api/ping
```
Should return: `{"ok":true,"time":"2024-..."}`

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://127.0.0.1:8000/api
```

### Backend (.env)
```
APP_URL=http://127.0.0.1:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

## Still Having Issues?

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Clear localStorage**: DevTools → Application → Local Storage → Clear
3. **Restart both servers**: Stop and start backend and frontend
4. **Check Laravel logs**: `capstone_backend/storage/logs/laravel.log`
5. **Check database**: Ensure MySQL/MariaDB is running
6. **Run migrations**: `php artisan migrate`
7. **Clear Laravel cache**: `php artisan cache:clear`

## Error Messages Explained

### "JSON.parse: unexpected character at line 1 column 1"
**Fixed!** This error no longer appears. The app now validates responses before parsing.

### "No auth token found, skipping..."
**Normal**: You're not logged in. This is not an error, just a warning.

### "Failed to load charities: 404"
**Issue**: API endpoint not found. Check backend routes.

### "Failed to load charities: 500"
**Issue**: Backend error. Check Laravel logs for details.

### "Server returned invalid response"
**Issue**: Backend returned HTML instead of JSON. Usually means PHP error or wrong endpoint.

## Need More Help?

See detailed documentation:
- `JSON_PARSE_ERRORS_FIXED.md` - What was fixed
- `DONOR_CHARITIES_PAGE_FIX.md` - Detailed diagnostic guide
