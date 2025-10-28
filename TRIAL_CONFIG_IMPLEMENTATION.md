# Trial Question Configuration Implementation

## Overview
Implemented comprehensive trial question configuration UI within the AssessmentTemplateManager. This allows Super Admins to designate specific questions from the globally configured assessment as trial questions without creating a separate trial assessment.

## Architecture
- **Single Assessment Model**: Uses one global assessment (`globalRegularAssessmentId`) as the source of truth
- **Question Flagging**: Individual questions marked with `isTrial` boolean flag
- **Configuration Level**: Trial setup happens at the assessment level (AssessmentTemplateManager), not at the domain template level
- **Data Storage**: Trial flags stored in JSON questions within DomainTemplate model

## Components Implemented

### 1. **DomainTrialEditor Component**
- Location: [AssessmentTemplateManager.tsx:208-304](components/admin/AssessmentTemplateManager.tsx#L208-L304)
- Dialog for configuring which questions in a domain are trial questions
- Features:
  - Display trial count: "X of Y questions marked for trial"
  - Individual question checkboxes with trial flag toggle
  - "Mark All" / "Unmark All" buttons for bulk operations
  - Visual feedback (primary color highlight) for selected trial questions

### 2. **Trial Editor Functions**
- Location: [AssessmentTemplateManager.tsx:314-377](components/admin/AssessmentTemplateManager.tsx#L314-L377)
- `openDomainTrialEditor(domain)`: Opens editor with domain's questions
- `updateQuestionTrialStatus(index, isTrial)`: Toggle individual question
- `toggleAllQuestionsTrialStatus(isTrial)`: Mark all questions as trial/full
- `getTrialQuestionCount(questions)`: Calculate trial question count
- `saveTrialChanges()`: Persist changes via API

### 3. **Enhanced Domain Display - Edit Modal**
- Location: [AssessmentTemplateManager.tsx:1385-1457](components/admin/AssessmentTemplateManager.tsx#L1385-L1457)
- Shows trial question count per domain: "Domain Name (12 Q, 5 trial)"
- Trial toggle button (⚡ Zap icon) only visible for selected domains
- Edit button for domain template management
- Visual separation of selected vs unselected domains

### 4. **Enhanced Domain Display - Assessment Cards**
- Location: [AssessmentTemplateManager.tsx:1276-1329](components/admin/AssessmentTemplateManager.tsx#L1276-L1329)
- Domain badges show: "Domain Name (total/trial)" format
- Example: "Attention (12/5)" shows 12 total questions, 5 marked for trial
- Trial toggle button (⚡) opens editor directly from card
- Edit button for domain template management

## API Endpoint

### PUT /api/admin/assessment-templates/trial
- Location: [app/api/admin/assessment-templates/trial/route.ts](app/api/admin/assessment-templates/trial/route.ts)
- **Purpose**: Update trial question configuration for a domain within an assessment
- **Request Body**:
  ```json
  {
    "assessmentId": "string",
    "domainId": "string",
    "questions": [
      { "id": "string", "text": "string", "isTrial": boolean, ... }
    ]
  }
  ```
- **Response**: Success status and updated count
- **Security**: Requires ADMIN, SUPER_ADMIN, or DISTRICT_ADMIN role

## Database Changes

### Schema Update
- Added `isTrial` field to `Question` model
- Type: `Boolean @default(false)`
- Index added for efficient filtering

### Migration
- File: [prisma/migrations/20251027_add_istrial_to_questions/migration.sql](prisma/migrations/20251027_add_istrial_to_questions/migration.sql)
- Adds `isTrial` column to questions table
- Creates index on `isTrial` field for performance
- Idempotent and safe for production

## User Flow

### Configuring Trial Questions

1. **Open Assessment Edit**
   - Click "Edit" button on assessment card
   - Opens "Edit Assessment Template" dialog

2. **Select Domains**
   - Check/uncheck domains to include in assessment
   - Only selected domains show trial configuration options

3. **Configure Trial Questions**
   - For selected domain, click ⚡ (Trial) button
   - Opens "Configure Trial Questions: Domain Name" dialog

4. **Mark Trial Questions**
   - Checkboxes appear for each question
   - Click "Mark All" to mark all questions as trial
   - Click "Unmark All" to clear all trial selections
   - Or manually check individual questions

5. **Save Configuration**
   - Click "Save Trial Configuration" button
   - API updates domain template with new trial flags
   - Toast confirms success
   - Trial count updates in UI

## Integration Points

### get-trial-template.ts
- [lib/trial/get-trial-template.ts](lib/trial/get-trial-template.ts)
- Filters questions by `isTrial === true` flag
- Returns trial questions from global assessment
- Used by trial assessment flow

### Frontend Trial Assessment
- Uses returned trial questions from `getTrialTemplate()`
- Renders only marked trial questions
- Same question structure allows seamless conversion to full assessment

## Benefits

1. **Single Source of Truth**: One assessment template used for both trial and full
2. **Flexible Configuration**: Any subset of questions can be trial
3. **Easy Management**: UI makes it clear which questions are included
4. **Audit Trail**: Trial configuration tracked in domain template version history
5. **Performance**: Efficient filtering with indexed `isTrial` field

## Next Steps

- [ ] Add trial configuration persistence to assessment template versions
- [ ] Add bulk trial configuration across multiple domains
- [ ] Create trial preview to see questions that will appear in trial
- [ ] Add audit logging for trial configuration changes
- [ ] Update SuperAdmin documentation with new trial setup flow
