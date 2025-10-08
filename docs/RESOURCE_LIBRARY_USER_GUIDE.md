# Resource Library User Guide

## Accessing the Resource Library

### For Super Admins

1. Log in to your Super Admin account
2. Navigate to **Admin Dashboard** (top navigation)
3. Click on the **"Resource Library"** tab
4. You'll see the Resource Library management interface

### For Regular Users (Future)

Resources will be accessible through:

- Assessment completion pages (AI recommendations)
- Dedicated resources page in dashboard
- Domain-specific resource lists

---

## Managing Resources (Super Admin)

### Overview Screen

The Resource Library manager displays:

- **Search bar**: Find resources by keyword
- **Category filter**: Filter by resource category
- **"Show active only" toggle**: Display only active resources
- **"Add Resource" button**: Create new resources
- **Resource cards**: Each card shows:
  - Title with status badge (Active/Inactive)
  - Category badge
  - Description
  - URL with external link icon
  - Tags
  - Creation date and creator
  - Edit and Delete buttons

---

## Creating a New Resource

### Step 1: Open Create Dialog

Click the **"Add Resource"** button in the top right corner.

### Step 2: Fill in Required Fields

**Required**:

- **Title**: Clear, descriptive name (e.g., "National Suicide Prevention Lifeline")
- **URL**: Full web address including https:// (e.g., "https://988lifeline.org")
- **Category**: Select from dropdown:
  - Mental Health
  - Parenting
  - Education
  - Crisis Support
  - Community Resources
  - Healthcare
  - Legal Services
  - Other

**Optional**:

- **Description**: Brief explanation of what the resource provides
- **Tags**: Comma-separated keywords for search (e.g., "crisis, mental health, support")
- **Active**: Toggle to set initial visibility (enabled by default)

### Step 3: Save

Click **"Save Resource"** button. You'll see a success message if the resource was created.

**Validation**:

- URL must be valid format (will show error if invalid)
- Title cannot be empty
- Category must be selected

---

## Editing a Resource

### Step 1: Find the Resource

Use the search bar or category filter to locate the resource you want to edit.

### Step 2: Open Edit Dialog

Click the **Edit icon** (pencil) on the resource card.

### Step 3: Make Changes

Modify any field:

- Update title, description, or URL
- Change category
- Add or remove tags
- Toggle active status

### Step 4: Save Changes

Click **"Save Resource"** button. You'll see a success message when updated.

---

## Deactivating/Activating Resources

### Option 1: Via Edit Dialog

1. Click the Edit icon on the resource
2. Toggle the "Active (visible to users)" switch
3. Click "Save Resource"

### Why Deactivate Instead of Delete?

- Preserve historical data
- Temporarily hide outdated resources
- Maintain database references
- Easy to reactivate later

---

## Deleting a Resource

⚠️ **Warning**: Deletion is permanent and cannot be undone.

### Steps

1. Click the **Trash icon** (red) on the resource card
2. Confirm deletion in the dialog that appears
3. The resource will be permanently removed

### When to Delete vs Deactivate

**Deactivate** when:

- Resource is temporarily unavailable
- Information is outdated but may be updated
- You want to keep the record for reference

**Delete** when:

- Resource is a duplicate
- Resource was created by mistake
- Resource is no longer relevant and never will be

---

## Searching and Filtering

### Search

The search bar looks for matches in:

- Resource title
- Description
- URL

Search is case-insensitive and finds partial matches.

**Example**: Searching "mental" will find:

- "Mental Health Crisis Support"
- "Parenting and Mental Wellness"
- Resources with "mental" in the URL

### Category Filter

Select a category from the dropdown to show only resources in that category.

Select **"All Categories"** to clear the filter.

### Active Filter

Toggle **"Show active only"** to:

- ✅ **On**: Show only active resources (visible to users)
- ❌ **Off**: Show all resources including inactive

### Combining Filters

All filters work together:

- Search + Category + Active status
- Example: Search "crisis" + Category "Mental Health" + Show active only
  → Shows only active mental health crisis resources

### Refresh

Click the **"Refresh"** button to reload the resource list from the server.

---

## Best Practices

### Naming Resources

✅ **Good**:

- "National Suicide Prevention Lifeline"
- "CDC Parenting Resources"
- "SAMHSA Treatment Locator"

❌ **Avoid**:

- "Resource 1"
- "Click here"
- "Good website"

### Writing Descriptions

✅ **Good**:

- "24/7 crisis support via phone, chat, and text. Free and confidential."
- "Evidence-based parenting strategies for children ages 0-12."

❌ **Avoid**:

- "Good resource"
- "Check it out"
- Leaving blank when purpose isn't obvious from title

### Choosing Categories

- Select the **most specific** category that fits
- If resource fits multiple categories, choose the **primary focus**
- Use "Other" only when no category fits

### Using Tags

✅ **Good**:

- "crisis, suicide, hotline, 24/7"
- "parenting, toddlers, discipline"
- "anxiety, depression, therapy"

❌ **Avoid**:

- Single-word tags that duplicate category
- Too many tags (aim for 3-5)
- Generic tags like "good" or "helpful"

### URL Best Practices

✅ **Good**:

- Use official/authoritative sources
- Link to specific pages when relevant
- Verify links work before saving

❌ **Avoid**:

- Shortened URLs (bit.ly, tinyurl)
- Affiliate links
- Broken or expired links

---

## Common Tasks

### Adding Crisis Resources

1. Click "Add Resource"
2. Title: "Crisis Center Name"
3. URL: Official crisis center website
4. Category: "Crisis Support"
5. Tags: "crisis, emergency, hotline" (if applicable)
6. Description: Hours, phone number, what they provide
7. Ensure "Active" is ON

### Creating Resource Collections

While collections aren't built-in yet, you can organize with:

- **Consistent naming**: "Parenting - Toddlers", "Parenting - Teens"
- **Tags**: Use shared tags for related resources
- **Categories**: Group by primary category

### Updating Outdated Resources

1. Search for the resource
2. Click Edit
3. Update URL if site changed
4. Update description with new information
5. Add "updated YYYY-MM-DD" to description if major changes
6. Save changes

### Archiving Old Resources

Instead of deleting:

1. Edit the resource
2. Toggle "Active" to OFF
3. Add "[ARCHIVED]" to description with reason
4. Save changes

---

## Keyboard Shortcuts

- **Tab**: Navigate between form fields
- **Enter**: Submit form (when focused on input)
- **Escape**: Close dialog
- **Ctrl/Cmd + F**: Focus search bar (browser default)

---

## Troubleshooting

### "Invalid URL format" error

**Problem**: URL doesn't include protocol (http/https)

**Solution**: Add `https://` before the URL:

- ❌ `example.com`
- ✅ `https://example.com`

### Resource not appearing after creation

**Check**:

1. Is "Show active only" toggled on? (Toggle off to see inactive resources)
2. Are you filtering by category? (Select "All Categories")
3. Click "Refresh" to reload the list

### Can't see Resource Library tab

**Requirements**:

- Must be logged in as **SUPER_ADMIN** role
- Navigate to **/admin** dashboard
- Tab appears between "Platform Settings" and "Admin Tools"

### Changes not saving

**Check**:

1. All required fields filled?
   - Title
   - URL
   - Category
2. Is URL valid format?
3. Check browser console for errors (F12 → Console tab)
4. Try refreshing the page and editing again

---

## Support

For technical issues or feature requests:

1. Check the implementation docs: `docs/RESOURCE_LIBRARY_IMPLEMENTATION.md`
2. Review API endpoints for debugging
3. Contact system administrator

---

## Future Features (Planned)

- 📊 **Analytics**: Track resource views and clicks
- 📥 **Bulk Import**: Upload CSV files with multiple resources
- 🔗 **Domain Integration**: Link resources directly to assessment domains
- 💬 **User Suggestions**: Allow users to suggest new resources
- 📚 **Collections**: Group related resources
- 🔍 **Advanced Search**: Filter by tags, date created, creator
- 🔔 **Notifications**: Alert when resources are updated
- ✅ **Link Validation**: Automatic checking for broken links
