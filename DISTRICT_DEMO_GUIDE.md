# District Platform Demo Guide

## Test Accounts

### District Admin

- **Email:** district@test.com
- **Password:** test123456
- **Dashboard:** http://localhost:3000/district
- **Access:** Full district metrics, all schools, all classrooms, all students

### Teacher

- **Email:** teacher@test.com
- **Password:** test123456
- **Dashboard:** http://localhost:3000/teacher
- **Access:** Assigned classroom(s) and students only

### Super Admin

- **Email:** tjhixon@gmail.com
- **Dashboard:** http://localhost:3000/ (main dashboard with admin panel)
- **Access:** All platform features + super admin settings

---

## What to Expect

### Teacher Dashboard (`/teacher`)

- **Your Classrooms:** 1 classroom assigned (Lincoln Elementary - Grade 5)
- **Students:** 33 students in your classroom
- **Features:**
  - View student list
  - Create new students
  - Assign assessments to students
  - View assessment status
  - Monitor flagged domains

### District Dashboard (`/district`)

- **Overview Metrics:**
  - Total students screened
  - Students flagged (above risk threshold)
  - Average risk score
  - Domain breakdown (Anxiety, Depression, Attention, Conduct, Antisocial)
- **Student Management:**
  - Filter by school, classroom, grade level
  - View all 125 students across 3 schools
  - Search and filter students
  - View individual student details
- **AI Recommendations:** Generate recommendations for students with completed assessments

---

## Current Data

- **District:** Demo District
- **Schools:** 3 (Washington Middle School, Lincoln Elementary, Roosevelt High School)
- **Classrooms:** 13 classrooms across all schools
- **Students:** 125 students total
- **Teachers:** 1 (Demo Teacher - assigned to 1 classroom)
- **Assessments:** 0 student assessments assigned yet

---

## Next Steps

1. **Login as teacher@test.com** → Should redirect to `/teacher`
2. **Create or assign assessments** to students
3. **Login as district@test.com** → Should redirect to `/district`
4. **View population metrics** and student data

The dashboards are now properly separated and role-based redirects are in place!
