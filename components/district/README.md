# District Components

This directory contains all UI components for the district-focused K-12 behavioral assessment platform.

## Components Overview

### `DistrictDashboard.tsx`

Main orchestrator component that:

- Manages state for metrics and student data
- Handles filter changes
- Coordinates data fetching from API
- Renders tabs for Overview and Students views

**Props:**

- `user: DistrictUser` - Current logged-in user with role and district context

### `DistrictMetricsCards.tsx`

Visual display of population-level metrics:

- Total students (enrolled vs screened)
- Flagged students count and percentage
- Average risk score across population
- Top flagged domain
- Domain breakdown with visual bars

**Props:**

- `metrics: DistrictMetrics` - Aggregated metrics from API

### `DistrictFilters.tsx`

Filter controls for narrowing data:

- Grade level dropdown (K-12)
- Date range pickers (from/to)
- Flagged-only toggle
- Clear all filters button

**Props:**

- `filters: Filters` - Current filter state
- `onFiltersChange: (filters) => void` - Callback when filters update
- `userRole: string` - User role for conditional rendering

### `StudentListView.tsx`

Table/list of students with:

- Anonymous student ID
- Grade level and school
- Assessment status (none/trial/full)
- Flagged domain badges
- "View Report" action button

**Props:**

- `students: Student[]` - Array of student records
- `userRole: string` - User role (affects display)
- `onRefresh: () => void` - Callback to reload data

### `StudentDetailsView.tsx`

Detailed view of individual student:

- Student information card
- Risk tier badge
- Domain score visualizations
- AI recommendations (if full assessment)
- Action buttons (Download PDF, Share, Mark Reviewed)

**Props:**

- `studentId: string` - Student ID to load
- `user: { id, role }` - Current user context

## Data Flow

```
DistrictDashboard
├─ Fetches from /api/district/metrics
├─ Fetches from /api/district/students
│
├─ DistrictMetricsCards
│   └─ Displays metrics visually
│
├─ DistrictFilters
│   └─ User changes filters → triggers refetch
│
└─ StudentListView
    └─ User clicks "View Report"
        └─ Navigate to /district/student/[id]
            └─ StudentDetailsView
                └─ Fetches from /api/district/students/[id]
```

## API Integration

All components fetch from district-specific API routes:

- `GET /api/district/metrics` - Population metrics
- `GET /api/district/students` - Student list
- `GET /api/district/students/[id]` - Student details
- `POST /api/district/students/[id]/review` - Mark as reviewed

## Styling

- Uses `@/components/ui/*` for base components (shadcn/ui)
- Tailwind CSS for styling
- Lucide React for icons
- Dark mode support via theme provider

## Adding New Features

### Adding a New Filter

1. Update `Filters` interface in `DistrictFilters.tsx`
2. Add UI control (dropdown, date picker, etc.)
3. Update API route to accept new query param
4. Update service layer to handle new filter

### Adding a New Metric Card

1. Add metric calculation to `DistrictService.getDistrictMetrics()`
2. Update `DistrictMetrics` interface
3. Add new card in `DistrictMetricsCards.tsx`

### Adding a New Action

1. Create API route (e.g., `/api/district/students/[id]/action`)
2. Add button/handler in `StudentDetailsView.tsx`
3. Add audit logging via `AuditLogService`

## Security Notes

- All API routes protected by `withDistrictAuth()` middleware
- Teachers can only see their assigned students (enforced server-side)
- Anonymous student IDs displayed by default
- Audit logs created for all sensitive actions

## Testing

Test key scenarios:

- District Admin sees all students
- Teacher sees only assigned students
- Filters work correctly (grade, date, flagged)
- Metrics update when filters change
- AI recommendations only show for full assessments
- Mark as Reviewed updates status and logs audit entry

## Future Enhancements

Possible additions:

- Export to CSV functionality
- Print-friendly report view
- Classroom comparison charts
- Longitudinal trend graphs
- Bulk actions (mark multiple as reviewed)
