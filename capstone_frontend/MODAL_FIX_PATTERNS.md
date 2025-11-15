# Modal Sizing Fix Patterns

## Standard Responsive Modal Sizes

### Small Modal (forms, confirmations)
```tsx
<DialogContent className="w-[90vw] max-w-[95vw] sm:w-full sm:max-w-md">
```

### Medium Modal (default, most cases)
```tsx
<DialogContent className="w-[90vw] max-w-[95vw] sm:w-full sm:max-w-lg">
```

### Large Modal (detailed views, settings)
```tsx
<DialogContent className="w-[90vw] max-w-[95vw] sm:w-full sm:max-w-2xl">
```

### Extra Large Modal (tables, complex forms)
```tsx
<DialogContent className="w-[90vw] max-w-[95vw] sm:w-full sm:max-w-4xl max-h-[85vh] sm:max-h-[90vh]">
```

### Maximum Width Modal (data tables, dashboards)
```tsx
<DialogContent className="w-[90vw] max-w-[95vw] sm:w-full sm:max-w-6xl max-h-[85vh] sm:max-h-[90vh]">
```

## Replace Patterns

### Old → New
```
max-w-md → w-[90vw] max-w-[95vw] sm:w-full sm:max-w-md
max-w-lg → w-[90vw] max-w-[95vw] sm:w-full sm:max-w-lg
max-w-xl → w-[90vw] max-w-[95vw] sm:w-full sm:max-w-xl
max-w-2xl → w-[90vw] max-w-[95vw] sm:w-full sm:max-w-2xl
max-w-3xl → w-[90vw] max-w-[95vw] sm:w-full sm:max-w-3xl
max-w-4xl → w-[90vw] max-w-[95vw] sm:w-full sm:max-w-4xl
max-w-6xl → w-[90vw] max-w-[95vw] sm:w-full sm:max-w-6xl
max-h-[90vh] → max-h-[85vh] sm:max-h-[90vh]
overflow-y-auto → (remove, handled by base component)
overflow-hidden flex flex-col → (keep if needed for layout)
```

## Mobile-Specific Adjustments

### Responsive Text
```tsx
// Title
<DialogTitle className="text-base sm:text-lg lg:text-xl">
// Description  
<DialogDescription className="text-xs sm:text-sm">
```

### Responsive Spacing
```tsx
// Padding
p-4 sm:p-6
// Gap
gap-2 sm:gap-4
// Grid
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
```

### Responsive Buttons
```tsx
// Footer buttons
<DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
  <Button className="w-full sm:w-auto">Cancel</Button>
  <Button className="w-full sm:w-auto">Confirm</Button>
</DialogFooter>
```
