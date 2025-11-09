# 🔖 Bookmarks/Saved Items Feature - Complete Implementation Plan

## 📊 Current Status Analysis

### ✅ What EXISTS:
1. **Frontend Page:** `/donor/saved` - Only shows saved campaigns
2. **Backend Routes:** 
   - `GET /api/me/saved` ✅
   - `POST /api/me/saved` ✅ (campaign_id only)
   - `DELETE /api/me/saved/:id` ✅
3. **Model:** `SavedItem` - Only has `campaign_id` column
4. **Controller:** `SavedItemController` - Only handles campaigns

### ❌ What's MISSING:
1. **Polymorphic relationship** - No support for charities/posts
2. **Save buttons** on charity/campaign/post pages
3. **Grouped display** by type (charities, campaigns, posts)
4. **3-dot menu** with save option
5. **Database migration** for polymorphic columns

---

## 🎯 Implementation Steps

### Step 1: Backend - Database Migration
Create migration to add polymorphic columns:
- `savable_id` (replaces campaign_id)
- `savable_type` (stores 'App\Models\Campaign', 'App\Models\Charity', etc.)

### Step 2: Backend - Update SavedItem Model
- Add `morphTo` relationship for `savable`
- Remove campaign-specific relationship
- Add casts and fillable fields

### Step 3: Backend - Update SavedItemController
- Modify `store()` to accept `savable_id` and `savable_type`
- Update `index()` to return grouped results
- Add validation for all types
- Handle duplicates gracefully

### Step 4: Frontend - Update Saved.tsx Page
- Display 3 tabs: Charities, Campaigns, Posts
- Each tab shows respective saved items
- Add empty states for each type
- Responsive grid layout

### Step 5: Frontend - Add Save Buttons
- Charity pages: Heart/Bookmark icon button
- Campaign cards: 3-dot menu with "Save Campaign"
- Post cards: 3-dot menu with "Save Post"

### Step 6: Frontend - Create SaveButton Component
- Reusable component for all save actions
- Toggle between "Save" and "Saved" states
- Optimistic UI updates
- Toast notifications

### Step 7: Testing
- Test saving/removing each type
- Test API endpoints with Postman/curl
- Test UI state updates
- Test responsive design
- Test dark/light mode

---

## 📋 Files to Create/Modify

### Backend:
1. ✏️ Create: `database/migrations/xxxx_update_saved_items_to_polymorphic.php`
2. ✏️ Modify: `app/Models/SavedItem.php`
3. ✏️ Modify: `app/Http/Controllers/SavedItemController.php`

### Frontend:
1. ✏️ Modify: `src/pages/donor/Saved.tsx`
2. ✏️ Create: `src/components/SaveButton.tsx`
3. ✏️ Modify: `src/pages/donor/CharityProfile.tsx` (add save button)
4. ✏️ Modify: Campaign cards (add save option)
5. ✏️ Modify: Post cards (add save option)

---

## 🎨 UI Design

### Saved Page Layout:
```
┌────────────────────────────────────────┐
│  🔖 Saved Items                         │
│  Items you've bookmarked for later     │
├────────────────────────────────────────┤
│  [Charities (2)] [Campaigns (5)] [Posts (3)]│
├────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  │
│  │ Card 1 │  │ Card 2 │  │ Card 3 │  │
│  └────────┘  └────────┘  └────────┘  │
└────────────────────────────────────────┘
```

### Save Button States:
- **Not Saved:** Outline bookmark icon
- **Saved:** Filled bookmark icon (yellow/gold)
- **Hover:** Scale effect + tooltip

---

## 🚀 Ready to implement!
