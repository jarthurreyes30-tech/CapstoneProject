# 🎨 Quick Color Reference Card

## The 5 Brand Colors

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  🟧 #ECA400  Orange/Gold   →  Primary Actions & Highlights  │
│  🟨 #EAF8BF  Light Cream   →  Success States & Accents      │
│  🟦 #006992  Teal Blue     →  Secondary Actions & Borders   │
│  🟦 #27476E  Dark Blue     →  Cards & Panels                │
│  🟦 #001D4A  Navy Blue     →  Text & Sidebar                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Quick Class Reference

### Most Common Uses

```tsx
// Cards automatically use Dark Blue
<Card>
  <CardHeader>
    <CardTitle>My Card</CardTitle>  {/* White text */}
  </CardHeader>
  <CardContent>
    Content here                    {/* White text */}
  </CardContent>
</Card>

// Primary Button = Orange
<Button>Donate Now</Button>

// Secondary Button = Teal
<Button variant="secondary">View Details</Button>

// All borders = Teal
<div className="border">Bordered content</div>

// Progress bars
<Progress value={75} /> {/* Orange bar on Teal background */}
```

## What Changed

- ✅ **Cards**: White → Dark Blue (#27476E)
- ✅ **Buttons**: Default → Orange (#ECA400)
- ✅ **Borders**: Gray → Teal (#006992)
- ✅ **Sidebar**: Default → Navy (#001D4A)
- ❌ **Body**: UNCHANGED (still light gray)

## Start Testing

```bash
cd capstone_frontend
npm run dev
```

Then check:
1. Dashboard cards → Dark blue? ✓
2. Primary buttons → Orange? ✓
3. Borders → Teal? ✓
4. Sidebar → Navy? ✓
5. Body background → Still light? ✓

## Docs Location

- `COLOR_SCHEME_UPDATE.md` - Full documentation
- `COLOR_MAPPING_REFERENCE.md` - Detailed mappings
- `COLOR_SCHEME_COMPLETE.md` - Implementation summary
- `QUICK_COLOR_REFERENCE.md` - This file (quick ref)

---

**Status**: ✅ Ready to Test
**Files Modified**: 3 (CSS + 2 pages)
**Components Updated**: Auto (100+)
