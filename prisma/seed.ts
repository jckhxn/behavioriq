import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  const defaultPassword = await bcrypt.hash("Apple112358a!", 12);

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "System Administrator",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Created admin user:", admin.email);

  // Create test user
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Test User",
      password: userPassword,
      role: Role.USER,
    },
  });

  console.log("✅ Created test user:", user.email);

  // Create/reset teacher user
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@test.com" },
    update: {
      password: defaultPassword,
    },
    create: {
      email: "teacher@test.com",
      name: "Sample Teacher",
      password: defaultPassword,
      role: Role.TEACHER,
    },
  });

  console.log("✅ Created/reset teacher user:", teacher.email);

  // Create/reset district admin user
  const districtAdmin = await prisma.user.upsert({
    where: { email: "district@test.com" },
    update: {
      password: defaultPassword,
    },
    create: {
      email: "district@test.com",
      name: "District Administrator",
      password: defaultPassword,
      role: Role.DISTRICT_ADMIN,
    },
  });

  console.log("✅ Created/reset district admin user:", districtAdmin.email);

  // Create or get test district
  console.log("🏫 Setting up test district...");

  const district = await prisma.district.upsert({
    where: { code: "DEMO-DISTRICT" },
    update: {},
    create: {
      name: "Demo School District",
      code: "DEMO-DISTRICT",
      isActive: true,
      settings: {},
    },
  });
  console.log("✅ Created/found district:", district.name);

  // Create test school
  const school = await prisma.school.upsert({
    where: {
      districtId_code: {
        districtId: district.id,
        code: "LINCOLN-ELEM",
      },
    },
    update: {},
    create: {
      districtId: district.id,
      name: "Lincoln Elementary",
      code: "LINCOLN-ELEM",
      isActive: true,
    },
  });
  console.log("✅ Created/found school:", school.name);

  // Create test classroom - use findFirst then create since no unique constraint on schoolId_name
  let classroom = await prisma.classroom.findFirst({
    where: {
      schoolId: school.id,
      name: "Grade 5 - Mrs. Johnson",
    },
  });

  if (!classroom) {
    classroom = await prisma.classroom.create({
      data: {
        schoolId: school.id,
        name: "Grade 5 - Mrs. Johnson",
        gradeLevel: "5",
        isActive: true,
      },
    });
  }
  console.log("✅ Created/found classroom:", classroom.name);

  // Create/update teacher profile linked to district
  const teacherProfile = await prisma.teacher.upsert({
    where: { userId: teacher.id },
    update: {
      districtId: district.id,
      schoolId: school.id,
    },
    create: {
      userId: teacher.id,
      districtId: district.id,
      schoolId: school.id,
      isActive: true,
    },
  });
  console.log("✅ Linked teacher to district");

  // Create teacher profile for district admin (needed for districtId association)
  await prisma.teacher.upsert({
    where: { userId: districtAdmin.id },
    update: {
      districtId: district.id,
    },
    create: {
      userId: districtAdmin.id,
      districtId: district.id,
      isActive: true,
    },
  });
  console.log("✅ Linked district admin to district");

  // Link teacher to classroom
  await prisma.teacherClassroom.upsert({
    where: {
      teacherId_classroomId: {
        teacherId: teacherProfile.id,
        classroomId: classroom.id,
      },
    },
    update: {},
    create: {
      teacherId: teacherProfile.id,
      classroomId: classroom.id,
      isPrimary: true,
    },
  });
  console.log("✅ Linked teacher to classroom");

  // Create some test students
  console.log("👥 Creating test students...");
  for (let i = 1; i <= 5; i++) {
    const studentId = `demo-student-${i}`;
    const student = await prisma.student.upsert({
      where: { anonymousId: `STU-DEMO-${i.toString().padStart(3, "0")}` },
      update: {},
      create: {
        districtId: district.id,
        schoolId: school.id,
        anonymousId: `STU-DEMO-${i.toString().padStart(3, "0")}`,
        gradeLevel: "5",
        isActive: true,
      },
    });

    // Link student to classroom
    await prisma.studentClassroom.upsert({
      where: {
        studentId_classroomId: {
          studentId: student.id,
          classroomId: classroom.id,
        },
      },
      update: {},
      create: {
        studentId: student.id,
        classroomId: classroom.id,
      },
    });
  }
  console.log("✅ Created 5 test students");

  // Seed district MVP feature flags
  console.log("🚩 Seeding feature flags...");

  const featureFlags = [
    {
      key: "district_routes",
      displayName: "District Routes",
      description: "Enable district management routes and dashboards",
      isEnabled: true,
      scope: "global",
    },
    {
      key: "teacher_dashboard",
      displayName: "Teacher Dashboard",
      description: "Enable teacher-specific dashboard and student management",
      isEnabled: true,
      scope: "global",
    },
    {
      key: "ai_recommendations",
      displayName: "AI Recommendations",
      description: "Enable AI-powered classroom strategy recommendations",
      isEnabled: true,
      scope: "global",
    },
    {
      key: "pdf_export",
      displayName: "PDF Export",
      description: "Enable PDF report generation and export",
      isEnabled: true,
      scope: "global",
    },
    {
      key: "csv_export",
      displayName: "CSV Export",
      description: "Enable CSV data export",
      isEnabled: true,
      scope: "global",
    },
    {
      key: "student_detail_view",
      displayName: "Student Detail View",
      description: "Enable detailed student profile and assessment view",
      isEnabled: true,
      scope: "global",
    },
    {
      key: "student_creation",
      displayName: "Student Creation",
      description: "Enable creating new student records",
      isEnabled: true,
      scope: "global",
    },
    {
      key: "assessment_assignment",
      displayName: "Assessment Assignment",
      description: "Enable assigning assessments to students",
      isEnabled: true,
      scope: "global",
    },
    {
      key: "counselor_caseload",
      displayName: "Counselor Caseload",
      description: "Enable counselor caseload management features",
      isEnabled: true,
      scope: "role",
      enabledForRoles: [
        "COUNSELOR",
        "PRINCIPAL",
        "DISTRICT_ADMIN",
        "ADMIN",
        "SUPER_ADMIN",
      ],
    },
    {
      key: "principal_school_view",
      displayName: "Principal School View",
      description: "Enable school-wide view for principals",
      isEnabled: true,
      scope: "role",
      enabledForRoles: ["PRINCIPAL", "DISTRICT_ADMIN", "ADMIN", "SUPER_ADMIN"],
    },
    {
      key: "audit_logging",
      displayName: "Audit Logging",
      description: "Enable FERPA-compliant audit logging",
      isEnabled: true,
      scope: "global",
    },
    {
      key: "anonymization",
      displayName: "Student Anonymization",
      description: "Use anonymous IDs instead of student names",
      isEnabled: true,
      scope: "global",
    },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {
        displayName: flag.displayName,
        description: flag.description,
        isEnabled: flag.isEnabled,
        scope: flag.scope,
        enabledForRoles: flag.enabledForRoles || [],
      },
      create: {
        key: flag.key,
        displayName: flag.displayName,
        description: flag.description,
        isEnabled: flag.isEnabled,
        scope: flag.scope,
        enabledForRoles: flag.enabledForRoles || [],
      },
    });
    console.log(`  ✅ Feature flag: ${flag.key}`);
  }

  console.log("🎉 Database seed completed successfully!");
  console.log("");
  console.log("Test Accounts:");
  console.log("Admin:          admin@example.com / admin123");
  console.log("User:           user@example.com / user123");
  console.log("Teacher:        teacher@test.com / Apple112358a!");
  console.log("District Admin: district@test.com / Apple112358a!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
