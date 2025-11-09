# 🎨 Theme-Responsive Color Cheatsheet

## Quick Reference for Theme-Aware Development

---

## ✅ Always Use These (Theme-Responsive)

### Backgrounds
```tsx
bg-background        // Page/body background (light gray → dark navy)
bg-card              // Cards & panels (white → dark navy)
bg-popover           // Dropdowns & popovers (white → dark navy)
bg-muted             // Muted sections (light gray → dark gray)
bg-primary           // Primary buttons (orange - same in both modes)
bg-secondary         // Secondary buttons (teal - adjusts for visibility)
```

### Text Colors
```tsx
text-foreground           // Main text (dark → light)
text-card-foreground      // Text on cards (dark → light)
text-muted-foreground     // Secondary text (medium gray - adapts)
text-primary              // Primary colored text (orange)
text-secondary            // Secondary colored text (teal)
```

### Borders
```tsx
border-border        // Standard borders (light gray → dark gray)
border-input         // Input borders (light gray → dark gray)
```

---

## 🎯 Common Use Cases

### Standard Card
```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-4">
  <h3 className="text-foreground font-bold">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```
**Result**: White card in light mode, dark navy in dark mode ✅

### Button Group
```tsx
<div className="flex gap-2">
  <button className="bg-primary text-primary-foreground">
    Primary Action
  </button>
  <button className="bg-secondary text-secondary-foreground">
    Secondary
  </button>
  <button className="bg-card text-card-foreground border border-border">
    Outlined
  </button>
</div>
```
**Result**: Proper contrast in both modes ✅

### Form Input
```tsx
<input 
  className="bg-background text-foreground border border-input rounded-md px-3 py-2"
  placeholder="Enter text..."
/>
```
**Result**: Readable in both modes ✅

### Section with Muted Background
```tsx
<div className="bg-muted text-muted-foreground rounded-lg p-4">
  <p>Secondary information</p>
</div>
```
**Result**: Subtle background adapts to theme ✅

---

## ❌ Avoid These (Not Theme-Responsive)

### Don't Use Hardcoded Colors
```tsx
// ❌ BAD - Doesn't adapt to theme
bg-white
bg-gray-100
text-gray-900
text-blue-600
border-gray-200

// ❌ BAD - Manual theme management
bg-white dark:bg-gray-900
text-gray-900 dark:text-white
border-gray-200 dark:border-gray-700
```

### Use Semantic Tokens Instead
```tsx
// ✅ GOOD - Automatically adapts
bg-card
bg-muted
text-foreground
text-primary
border-border
```

---

## 🌈 Special Cases

### Colored Panels (Professional Branding)
When you need the brand's dark blue or teal panels:

```tsx
// Dark blue professional panel
<div className="panel-professional">
  Content with brand colors
</div>

// Teal accent panel  
<div className="panel-accent">
  Highlighted content
</div>

// Professional badge
<span className="badge-professional">Featured</span>
```

### Status Colors (Non-Semantic)
For status indicators that should stay the same color:

```tsx
// Success (keep green)
text-green-600 dark:text-green-500

// Warning (keep yellow)
text-yellow-600 dark:text-yellow-500

// Error (keep red)  
text-red-600 dark:text-red-500

// These are OK because they convey meaning through color
```

---

## 🔄 Migration Examples

### Example 1: Card Component

**Before (Theme-Unaware)**:
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
  <h3 className="text-blue-600 dark:text-blue-400">Title</h3>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

**After (Theme-Responsive)**:
```tsx
<div className="bg-card text-card-foreground border-border">
  <h3 className="text-primary">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

### Example 2: Button

**Before**:
```tsx
<button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">
  Click Me
</button>
```

**After**:
```tsx
<button className="bg-primary hover:bg-primary/90 text-primary-foreground">
  Click Me
</button>
```

### Example 3: Input Field

**Before**:
```tsx
<input className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" />
```

**After**:
```tsx
<input className="bg-background text-foreground border-input" />
```

---

## 📊 Complete Token Reference

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `bg-background` | Light gray (#FAFAFA) | Dark navy | Page background |
| `bg-card` | White (#FFFFFF) | Navy (#001D4A) | Cards, panels |
| `bg-muted` | Light gray-blue | Dark gray | Muted sections |
| `bg-primary` | Orange (#ECA400) | Orange (same) | Primary actions |
| `bg-secondary` | Teal (#006992) | Lighter teal | Secondary actions |
| `text-foreground` | Dark navy | Light gray | Main text |
| `text-card-foreground` | Dark navy | Light gray | Text on cards |
| `text-muted-foreground` | Medium gray | Medium light | Secondary text |
| `text-primary` | Orange | Orange | Primary colored text |
| `text-secondary` | Teal | Teal | Secondary colored text |
| `border-border` | Light gray | Dark gray | Borders |

---

## 🧪 Testing Your Changes

### 1. Visual Check
```
1. View component in light mode
2. Toggle to dark mode
3. Verify:
   ✅ Text is readable
   ✅ Buttons have contrast
   ✅ Borders are visible
   ✅ No color "flash"
```

### 2. Contrast Check
```
Light Mode:
- Text on cards should be dark
- Backgrounds should be light
- Borders should be subtle

Dark Mode:
- Text on cards should be light
- Backgrounds should be dark
- Borders should be visible but not harsh
```

---

## 🚀 Pro Tips

### 1. Start with Semantic Tokens
Always try semantic tokens first before reaching for hardcoded colors.

### 2. Use Opacity for Hover States
```tsx
// Good pattern for hover states
bg-card hover:bg-card/90
bg-primary hover:bg-primary/90
```

### 3. Let the System Work
Don't add `dark:` modifiers when using semantic tokens - they already adapt!

### 4. Check Both Modes
Always test your changes in both light and dark mode before committing.

---

## 🔍 Quick Audit Commands

### Find Remaining Issues
```powershell
# Run the audit script
.\find-hardcoded-colors.ps1

# Or manually search:
grep -r "bg-white" src/
grep -r "text-gray-" src/
grep -r "dark:bg-gray-" src/
```

---

## 📚 More Resources

- **`THEME_RESPONSIVE_COLORS_FIXED.md`** - Complete implementation guide
- **`COLOR_SCHEME_UPDATE.md`** - Brand color documentation
- **`COLOR_MAPPING_REFERENCE.md`** - Detailed mappings

---

## ⚡ Remember

> "Use semantic tokens, not hardcoded colors. Let the theme system do the work!" 

🎨 **Happy theme-responsive coding!**
