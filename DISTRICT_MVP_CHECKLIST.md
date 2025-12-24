# District MVP - Next Actions Checklist

## 🔧 Immediate Setup (Required Before Demo)

### 1. Database Migration

- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate dev --name district_mvp`
- [ ] Verify tables created: `districts`, `schools`, `classrooms`, `teachers`, `students`, etc.
- [ ] Check Role enum includes `TEACHER`

### 2. Sample Data Setup

- [ ] Run `npx tsx scripts/setup-district.ts`
- [ ] Verify district created in database
- [ ] Verify schools and classrooms created
- [ ] Verify teacher and admin users created
- [ ] Verify sample students created

### 3. Authentication Configuration

- [ ] Update NextAuth config to handle `TEACHER` role
- [ ] Test district admin login
- [ ] Test teacher login
- [ ] Verify role-based redirects work

### 4. Environment Variables

- [ ] Confirm `OPENAI_API_KEY` is set (for AI recommendations)
- [ ] Confirm `DATABASE_URL` points to correct database
- [ ] Confirm `NEXTAUTH_SECRET` is configured
- [ ] Confirm `NEXTAUTH_URL` is set correctly

---

## 🎨 UI Polish (Before Demo)

### 5. Component Testing

- [ ] Test DistrictDashboard loads metrics correctly
- [ ] Test filters update metrics dynamically
- [ ] Test student list shows correct data
- [ ] Test student detail page loads
- [ ] Test AI recommendations render correctly
- [ ] Test "Mark as Reviewed" button works

### 6. Responsive Design

- [ ] Test on mobile (dashboard metrics)
- [ ] Test on tablet (student list)
- [ ] Test on desktop (full layout)
- [ ] Fix any layout issues

### 7. Error Handling

- [ ] Add loading states to all async operations
- [ ] Add error boundaries for failed API calls
- [ ] Add user-friendly error messages
- [ ] Handle "no students" state gracefully

---

## 🔗 Integration Work

### 8. PDF Generation

- [ ] Wire up existing PDF service to district routes
- [ ] Create district-specific PDF template
- [ ] Include AI recommendations in PDF
- [ ] Add screening disclaimer to PDF
- [ ] Test PDF download button
- [ ] Store PDF URL in `StudentAssessment.pdfUrl`

### 9. Share Link Generation

- [ ] Create `/api/district/students/[id]/share` endpoint
- [ ] Generate secure, expiring share links
- [ ] Store link in `StudentAssessment.shareLinkId`
- [ ] Create read-only share page
- [ ] Test share link creation and access

### 10. Assessment Completion Hook

- [ ] Add webhook/event when assessment completes
- [ ] Automatically create `StudentAssessment` record
- [ ] Automatically generate AI recommendations for full assessments
- [ ] Link assessment to student via `studentId`

---

## 📊 Data & Testing

### 11. Create Sample Assessments

- [ ] Create trial assessments for 10 students
- [ ] Create full assessments for 5 students
- [ ] Generate AI recommendations for full assessments
- [ ] Populate domain scores (some flagged, some not)
- [ ] Verify metrics calculate correctly

### 12. Test User Flows

**District Admin:**

- [ ] Login → Dashboard → See all students
- [ ] Apply filters → Metrics update
- [ ] View student → See full report
- [ ] Download PDF → File downloads
- [ ] Mark as reviewed → Status updates

**Teacher:**

- [ ] Login → Dashboard → See only assigned students
- [ ] Apply filters → Filtered to classroom
- [ ] View student → See report (only for assigned)
- [ ] Verify cannot access other teacher's students

### 13. Test Edge Cases

- [ ] Student with no assessment completed
- [ ] Student with trial but no full assessment
- [ ] Student with multiple flagged domains
- [ ] Student with no flagged domains
- [ ] Empty classroom (no students)
- [ ] Empty district (no assessments)

---

## 🔐 Security & Compliance

### 14. Access Control Testing

- [ ] Verify teacher cannot see non-assigned students (API level)
- [ ] Verify anonymous mode hides PII
- [ ] Verify consent flag blocks identifiable data
- [ ] Test middleware rejects unauthorized users
- [ ] Test SQL injection protection in filters

### 15. Audit Logging Verification

- [ ] View report → Audit log created
- [ ] Download PDF → Audit log created
- [ ] Mark as reviewed → Audit log created
- [ ] Generate share link → Audit log created
- [ ] Verify all logs include: userId, studentId, timestamp, IP

### 16. FERPA Compliance Checklist

- [ ] Students default to `isAnonymous: true`
- [ ] Anonymous IDs displayed in UI
- [ ] Consent tracking functional
- [ ] Audit logs comprehensive
- [ ] Retention policies documented
- [ ] Data export limited to authorized roles

---

## 📝 Documentation

### 17. Update README

- [ ] Add district setup instructions to main README
- [ ] Document new API routes
- [ ] Add role descriptions (DISTRICT_ADMIN, TEACHER)
- [ ] Update architecture diagram

### 18. Create Training Materials

- [ ] Quick start guide for district admins
- [ ] Quick start guide for teachers
- [ ] Video walkthrough (optional)
- [ ] FAQ document

### 19. Admin Documentation

- [ ] How to create new districts
- [ ] How to add schools and classrooms
- [ ] How to create teacher accounts
- [ ] How to assign teachers to classrooms
- [ ] How to enroll students

---

## 🚀 Pre-Launch

### 20. Performance Testing

- [ ] Test with 100 students
- [ ] Test with 500 students
- [ ] Test with 1000 students
- [ ] Optimize slow queries (add indexes)
- [ ] Add pagination if needed

### 21. Demo Preparation

- [ ] Prepare demo script
- [ ] Create sample district with realistic data
- [ ] Test on demo account (district.admin@demo.com)
- [ ] Prepare talking points for AI recommendations
- [ ] Prepare talking points for FERPA compliance

### 22. Deployment

- [ ] Deploy to staging environment
- [ ] Run migration on staging database
- [ ] Smoke test all features
- [ ] Deploy to production
- [ ] Monitor error logs

---

## 🔮 Optional Enhancements (Post-MVP)

### 23. Teacher Management UI

- [ ] Create `/district/teachers` page
- [ ] Add teacher creation form
- [ ] Add classroom assignment interface
- [ ] Add teacher activation/deactivation

### 24. Bulk Operations

- [ ] CSV import for student rosters
- [ ] Bulk mark as reviewed
- [ ] Bulk PDF download (zip file)
- [ ] Export to Excel

### 25. Advanced Analytics

- [ ] Classroom comparison charts
- [ ] Trend over time (longitudinal)
- [ ] Cohort analysis
- [ ] Predictive risk modeling

---

## ✅ Definition of Done

MVP is ready for demo when:

- [ ] All database tables created
- [ ] Sample data populated
- [ ] District admin can view all students
- [ ] Teachers can view only assigned students
- [ ] Metrics calculate correctly
- [ ] Filters work (grade, date, flagged)
- [ ] AI recommendations generate for full assessments
- [ ] PDF downloads work
- [ ] Audit logs created for all actions
- [ ] Anonymous mode works correctly
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Documentation complete

---

**Target Demo Date:** [Fill in]  
**Last Updated:** December 20, 2025
