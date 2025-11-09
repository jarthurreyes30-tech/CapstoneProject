# 🚨 ERROR PAGES - QUICK REFERENCE

## 📍 **ROUTES**

```
/404          → Page Not Found
/500          → Internal Server Error  
/503          → Maintenance Mode
/maintenance  → Maintenance Mode (alias)
/*            → 404 (catch-all)
```

---

## 🎨 **COMPONENTS**

### **Import:**
```typescript
import { Error404, Error500, Error503, ErrorBoundary } from '@/pages/errors';
```

### **Usage:**
```typescript
// In routes
<Route path="/404" element={<Error404 />} />
<Route path="/500" element={<Error500 />} />
<Route path="/503" element={<Error503 />} />

// Wrap app
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## 🔄 **NAVIGATION**

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Go to error page
navigate('/404');
navigate('/500');
navigate('/503');
```

---

## ⚠️ **ERROR BOUNDARY**

```typescript
import { useErrorHandler } from '@/pages/errors';

const throwError = useErrorHandler();

try {
  await riskyOperation();
} catch (error) {
  throwError(error); // Triggers ErrorBoundary → shows 500 page
}
```

---

## 🔌 **BACKEND API RESPONSES**

### **404 Not Found:**
```json
{
  "error": "Not Found",
  "message": "The requested resource could not be found.",
  "status": 404
}
```

### **500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred. Our team has been notified.",
  "status": 500
}
```

---

## 🎯 **TESTING**

```bash
# Test 404
http://localhost:5173/nonexistent

# Test 503
http://localhost:5173/maintenance

# Test API errors
curl http://localhost:8000/api/nonexistent
```

---

## 📦 **FILES**

```
Frontend:
└── src/pages/errors/
    ├── ErrorLayout.tsx
    ├── Error404.tsx
    ├── Error500.tsx
    ├── Error503.tsx
    ├── ErrorBoundary.tsx
    └── index.ts

Backend:
└── bootstrap/app.php (withExceptions)
```

---

## ✅ **FEATURES**

✅ 100vh viewport (no scrolling)  
✅ Dark/light mode support  
✅ Framer Motion animations  
✅ Consistent layout across all pages  
✅ Responsive design  
✅ Error logging  
✅ Backend integration  

---

## 🎨 **CUSTOMIZATION**

### **Change support email:**
```typescript
// In ErrorLayout.tsx
const handleReport = () => {
  window.location.href = 'mailto:your-email@example.com';
};
```

### **Adjust animations:**
```typescript
// In Error404.tsx, Error500.tsx, or Error503.tsx
animate={{ y: [0, -10, 0] }}
transition={{ duration: 2.5 }} // Adjust duration
```

---

## 📊 **STATUS CODES**

- **404** - Not Found
- **500** - Internal Server Error
- **503** - Service Unavailable / Maintenance

---

**Full Documentation:** `ERROR_HANDLING_SYSTEM_COMPLETE.md`
