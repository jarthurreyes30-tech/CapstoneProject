# Report Review Dialog Improvements

## Changes Needed in Reports.tsx

Replace the Review Dialog section (lines 535-660) with this enhanced version:

### Key Improvements:
1. **More Information**: Shows reporter details, target entity, full description, evidence
2. **Admin Decides Severity**: Add severity selector (low, medium, high, critical)
3. **Better Organization**: Clear sections with icons and colors
4. **Detailed Layout**: Two-column layout with all relevant information
5. **Visual Hierarchy**: Cards for different information types

### Add State Variable:
```tsx
const [adminSeverity, setAdminSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
```

### Implementation Notes:
- Severity defaults to "pending" if not selected by reporter
- Admin MUST select final severity before approval
- Shows full report description and evidence links
- Displays reporter's complete information
- Clear visual sections for better decision-making

The dialog now provides ALL necessary information for admins to make informed decisions about reports.
