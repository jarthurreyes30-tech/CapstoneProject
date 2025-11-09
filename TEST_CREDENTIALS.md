# Test Account Credentials

## Current Users in Database

| ID | Email | Role | Status | Password |
|----|-------|------|--------|----------|
| 1 | admin@example.com | admin | active | `password` |
| 5 | bagunuaeron16@gmail.com | donor | active | (check) |
| 6 | regondolajohnarthur51@gmail.com | charity_admin | active | (check) |
| 7 | aaron@donor.com | donor | active | (check) |
| 8 | saganaarondave33@gmail.com | charity_admin | active | (check) |
| 9 | contact@charity.org | charity_admin | active | (check) |
| 10 | regie@donor.com | donor | active | (check) |
| 11 | donor@example.com | donor | active | `password` |
| 12 | charity@example.com | charity_admin | active | `password` |
| 13 | charityadmin@example.com | charity_admin | active | `password` |
| 15 | j.arthurreyes30@gmail.com | donor | active | (check) |

## Confirmed Working Credentials

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `password`
- **Role**: admin

### Donor Account  
- **Email**: `donor@example.com`
- **Password**: `password`
- **Role**: donor

### Charity Admin Account
- **Email**: `charity@example.com`
- **Password**: `password`
- **Role**: charity_admin

## Login URL
- **Frontend**: http://localhost:8080/auth/login
- **API Endpoint**: http://127.0.0.1:8000/api/auth/login

## Troubleshooting

If you're getting a 401 error:
1. Make sure you're using the exact password (case-sensitive)
2. Ensure the backend is running: `php artisan serve`
3. Ensure the frontend is running: `npm run dev`
4. Check the browser console for CORS errors
5. Verify the API URL in `.env`: `VITE_API_URL=http://127.0.0.1:8000/api`

## How to Reset a Password

```bash
cd capstone_backend
php artisan tinker
```

Then in tinker:
```php
$user = User::where('email', 'admin@example.com')->first();
$user->password = Hash::make('your_new_password');
$user->save();
```
