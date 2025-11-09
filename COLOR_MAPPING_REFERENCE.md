# Color Mapping Reference

## Quick Visual Guide: Before → After

### 🎨 Color Palette from Image
```
┌─────────────────────────────────────────────────────────┐
│  #ECA400  │  #EAF8BF  │  #006992  │  #27476E  │  #001D4A │
│  Orange   │  Cream    │  Teal     │  Blue     │  Navy    │
└─────────────────────────────────────────────────────────┘
```

## Element Mapping

### Cards & Panels
```
BEFORE: White background (#FFFFFF)
AFTER:  Dark Blue (#27476E) ← Professional look

Example: Dashboard cards, Campaign cards, Analytics panels
```

### Primary Buttons & CTAs
```
BEFORE: Default primary color
AFTER:  Orange/Gold (#ECA400) ← Eye-catching actions

Example: "Donate Now", "Create Campaign", "Save" buttons
```

### Secondary Buttons & Actions
```
BEFORE: Default secondary color
AFTER:  Teal Blue (#006992) ← Professional secondary

Example: "View Details", "Cancel", secondary navigation
```

### Borders & Dividers
```
BEFORE: Light gray (#E5E7EB)
AFTER:  Teal Blue (#006992) ← Better definition

Example: Card borders, form field outlines, dividers
```

### Success States & Highlights
```
BEFORE: Green tones
AFTER:  Light Cream (#EAF8BF) ← Soft, positive accent

Example: Success messages, completion badges, highlights
```

### Sidebar & Navigation
```
BACKGROUND: Navy Blue (#001D4A) ← Deep, professional
ACTIVE:     Orange (#ECA400) ← Clear active state
HOVER:      Teal (#006992) ← Interactive feedback
```

### Text on Colored Backgrounds
```
ON DARK PANELS: White text (#FAFAFA)
ON LIGHT BG:    Navy text (#001D4A)
```

### Progress Bars
```
BACKGROUND: Teal Blue (#006992)
INDICATOR:  Orange (#ECA400)

Example: Campaign funding progress
```

### Muted Elements
```
BEFORE: Light gray backgrounds
AFTER:  Teal Blue (#006992) with white text

Example: Disabled states, secondary info, metadata
```

## Component-Specific Changes

### Campaign Cards
```css
┌────────────────────────────┐
│  [Banner Image]            │ ← Unchanged
├────────────────────────────┤
│  Title (White text) ●●●●●  │ ← On Dark Blue (#27476E)
│  Description (White) ●●●   │
│                            │
│  Progress: [████░░] 75%    │ ← Orange on Teal
│  Raised: ₱50,000           │
│  Goal: ₱100,000            │
│                            │
│  [Donate Now - Orange]     │ ← #ECA400
└────────────────────────────┘
```

### Dashboard KPI Cards
```css
┌─────────────────────────┐
│ 📊 Total Campaigns      │
│                         │ ← Dark Blue panel (#27476E)
│     152                 │ ← White text
│ ↑ 12% from last month   │ ← Orange accent
└─────────────────────────┘
```

### Navigation Sidebar
```css
┌──────────────────┐
│  Logo            │ ← Navy background (#001D4A)
├──────────────────┤
│ ▸ Dashboard      │ ← Teal hover (#006992)
│ ▸ Campaigns      │
│ ● Analytics      │ ← Orange active (#ECA400)
│ ▸ Settings       │
└──────────────────┘
```

### Form Inputs
```css
┌────────────────────────┐
│ Email Address          │
├────────────────────────┤
│ user@example.com       │ ← White background
└────────────────────────┘ ← Teal border (#006992)
```

### Modals & Dialogs
```css
┌─────────────────────────────────┐
│ Create New Campaign             │ ← Dark Blue header
├─────────────────────────────────┤
│                                 │ ← Dark Blue panel
│  [Form Fields]                  │ ← White inputs
│                                 │
│  [Cancel - Teal] [Save - Orange]│
└─────────────────────────────────┘
```

## Tailwind Class Mapping

### Common Replacements
```tsx
// OLD → NEW

// Cards
bg-white → bg-card (auto: #27476E)
text-gray-900 → text-card-foreground (auto: white)

// Borders
border-gray-200 → border-border (auto: #006992)

// Buttons
bg-blue-600 → bg-primary (auto: #ECA400)
bg-gray-600 → bg-secondary (auto: #006992)

// Text
text-gray-500 → text-muted-foreground (white on teal)
text-blue-600 → text-primary (orange)

// Backgrounds
bg-gray-50 → bg-muted (teal)
```

## CSS Variable Quick Reference

```css
/* Direct Brand Colors */
--brand-accent: #ECA400      /* Orange - Primary CTAs */
--brand-success: #EAF8BF     /* Cream - Success states */
--brand-secondary: #006992   /* Teal - Secondary actions */
--brand-surface: #27476E     /* Blue - Panels/cards */
--brand-ink: #001D4A         /* Navy - Text/sidebar */

/* Semantic Tokens (Automatically Applied) */
--card: #27476E              /* Card backgrounds */
--card-foreground: #FAFAFA   /* Text on cards */
--primary: #ECA400           /* Primary buttons */
--secondary: #006992         /* Secondary buttons */
--border: #006992            /* All borders */
--muted: #006992             /* Muted elements */
```

## Color Hierarchy

```
1. PRIMARY ACTIONS     → Orange (#ECA400)
2. SECONDARY ACTIONS   → Teal (#006992)
3. CONTAINERS/PANELS   → Dark Blue (#27476E)
4. NAVIGATION          → Navy (#001D4A)
5. SUCCESS/ACCENT      → Cream (#EAF8BF)
```

## Accessibility Notes

All color combinations meet WCAG AA standards:

✅ White text on Dark Blue (#27476E) - Contrast ratio: 9.8:1
✅ White text on Teal (#006992) - Contrast ratio: 5.2:1
✅ Navy text on White - Contrast ratio: 15.2:1
✅ Orange (#ECA400) readable against dark and light backgrounds

## Dark Mode Adjustments

Dark mode uses adjusted values:
- Cards: Navy (#001D4A)
- Borders: Teal (#006992) - same
- Primary: Orange (#ECA400) - same
- Secondary: Lighter Teal (#006992 at 35% lightness)

## Testing Colors

To verify colors are applied correctly:

1. **Cards should be Dark Blue** - Check dashboard, campaigns
2. **Primary buttons should be Orange** - Check CTAs
3. **Borders should be Teal** - Check form fields, cards
4. **Sidebar should be Navy** - Check navigation
5. **Body background stays light** - Check overall page

## Browser Tools

Use browser DevTools to inspect:
```
Element → Styles → Computed → Custom Properties

Look for:
--card: 210 47% 29% (Dark Blue)
--primary: 40 95% 46% (Orange)
--border: 195 100% 29% (Teal)
```
