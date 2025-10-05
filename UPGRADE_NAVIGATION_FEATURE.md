# Upgrade Navigation Feature

## Overview

Implemented smooth navigation from the AssessmentLimitDialog to the Settings billing tab with automatic scrolling to the "Upgrade Your Plan" section.

## All Fixed Files

### 1. Main Page (`app/page.tsx`)

- Added `Suspense` import and `Loader2` icon
- Wrapped `SettingsPane` in `Suspense` boundary (required for `useSearchParams`)
- Updated URL cleanup logic to preserve `tab` and `subtab` parameters
- Now removes only `upgraded`, `purchase`, and `cancelled` params while keeping navigation params

### 2. Credits Display (`components/dashboard/CreditsDisplay.tsx`)

- Updated "Upgrade to Professional" link from `/settings?tab=billing` to `/?tab=settings&subtab=billing`
- Now uses the same navigation pattern as AssessmentLimitDialog

## Changes Made

### 1. BillingSection Component (`components/settings/BillingSection.tsx`)

- Added `id="upgrade-plan"` to the Upgrade Your Plan Card
- This provides a scroll target for the navigation feature

```tsx
<Card id="upgrade-plan">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-lg">
      <ArrowUpCircle className="h-5 w-5" />
      Upgrade Your Plan
    </CardTitle>
```

### 2. SettingsPane Component (`components/settings/SettingsPane.tsx`)

- Added `useSearchParams` import from `next/navigation`
- Added `activeTab` state to control the tab selection
- Added `useEffect` to check for `subtab=billing` URL parameter
- When `subtab=billing` is detected:
  - Switches to billing tab
  - Scrolls to `#upgrade-plan` section after 300ms delay
- Updated Tabs component from `defaultValue` to controlled `value` and `onValueChange`

```tsx
const [activeTab, setActiveTab] = useState("profile");

useEffect(() => {
  const subtab = searchParams.get("subtab");
  if (subtab === "billing") {
    setActiveTab("billing");
    setTimeout(() => {
      const upgradeSection = document.getElementById("upgrade-plan");
      if (upgradeSection) {
        upgradeSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 300);
  }
}, [searchParams]);
```

### 3. AssessmentLimitDialog Component (`components/assessment/AssessmentLimitDialog.tsx`)

- Updated `handleUpgrade` function to navigate to settings with billing subtab
- Simplified logic - just navigate, let SettingsPane handle the rest

```tsx
const handleUpgrade = () => {
  setIsNavigating(true);
  router.push("/?tab=settings&subtab=billing");
};
```

## User Flow

1. User has 0 assessment credits
2. User tries to create assessment
3. AssessmentLimitDialog appears with two options
4. User clicks "Upgrade to Professional" button
5. **Navigation happens:**
   - Navigates to `/?tab=settings&subtab=billing`
   - Settings tab opens
   - Billing subtab is selected
   - Page smoothly scrolls to "Upgrade Your Plan" section
   - Professional plan upgrade option is centered on screen

## Technical Details

### URL Parameters

- `tab=settings` - Opens the settings tab in main page
- `subtab=billing` - Tells SettingsPane to open billing and scroll to upgrade section

### Scroll Behavior

- Uses `scrollIntoView` with `behavior: "smooth"` for animated scroll
- Uses `block: "center"` to center the upgrade section on screen
- 300ms delay ensures DOM is fully rendered before scrolling

### Why Not Direct Navigation?

- Settings is embedded in the main page as a tab
- Need to coordinate between page navigation and tab selection
- Using URL params provides clean, bookmarkable state

## Testing

### Test 1: From Assessment Limit Dialog

1. Log in as BASIC user with 0 credits
2. Click "Create Assessment"
3. In the AssessmentLimitDialog, click "Upgrade to Professional"
4. Verify:
   - ✅ Settings tab opens
   - ✅ Billing subtab is selected
   - ✅ Page scrolls smoothly to "Upgrade Your Plan" section
   - ✅ Professional plan option is visible and centered

### Test 2: From Dashboard Credits Display

1. Log in as BASIC user with 0 credits
2. View the "Assessment Credits" card on dashboard
3. Click "Upgrade to Professional" button in the card
4. Verify:
   - ✅ Settings tab opens
   - ✅ Billing subtab is selected
   - ✅ Page scrolls smoothly to "Upgrade Your Plan" section
   - ✅ Professional plan option is visible and centered

## Benefits

- **Better UX**: Direct navigation to the exact upgrade option
- **Clear Path**: User knows exactly where to upgrade
- **Smooth Animation**: No jarring jumps, smooth scroll
- **Discoverable**: User sees full billing section context
- **Conversion Optimized**: Reduces friction in upgrade path

## Related Files

- `components/settings/BillingSection.tsx` - Added ID to upgrade section
- `components/settings/SettingsPane.tsx` - Added URL param handling and scroll logic
- `components/assessment/AssessmentLimitDialog.tsx` - Updated upgrade button navigation
