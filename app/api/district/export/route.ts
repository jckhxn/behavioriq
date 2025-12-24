import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { isFeatureEnabled } from "@/lib/district/feature-flags";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const scope = searchParams.get("scope") || "district";
    const schoolId = searchParams.get("schoolId");

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify district admin role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (dbUser?.role !== "DISTRICT_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check feature flag
    const canExport = await isFeatureEnabled("csv_export", {
      userId: user.id,
      role: dbUser.role,
    });

    if (!canExport && format === "csv") {
      return NextResponse.json(
        { error: "CSV export is disabled" },
        { status: 403 }
      );
    }

    const canExportPDF = await isFeatureEnabled("pdf_export", {
      userId: user.id,
      role: dbUser.role,
    });

    if (!canExportPDF && format === "pdf") {
      return NextResponse.json(
        { error: "PDF export is disabled" },
        { status: 403 }
      );
    }

    // Get district admin
    const districtAdmin = await prisma.districtUser.findUnique({
      where: { userId: user.id },
      include: {
        district: {
          include: {
            schools: {
              where: schoolId ? { id: schoolId } : {},
              include: {
                classrooms: {
                  include: {
                    students: {
                      include: {
                        student: {
                          include: {
                            assessments: {
                              include: {
                                assessment: {
                                  include: {
                                    domainIndicators: true,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!districtAdmin) {
      return NextResponse.json(
        { error: "Not a district admin" },
        { status: 403 }
      );
    }

    // Build aggregate data (no individual student names)
    const rows: string[][] = [
      [
        "School",
        "Grade Level",
        "Total Students",
        "Assessments Completed",
        "Students with Flagged Indicators",
        "Percentage with Flags",
      ],
    ];

    const schoolAggregates: Record<
      string,
      Record<
        string,
        {
          total: number;
          assessments: number;
          flagged: number;
        }
      >
    > = {};

    districtAdmin.district.schools.forEach((school) => {
      if (!schoolAggregates[school.name]) {
        schoolAggregates[school.name] = {};
      }

      school.classrooms.forEach((classroom) => {
        classroom.students.forEach((sc) => {
          const gradeLevel = sc.student.gradeLevel || "Unknown";

          if (!schoolAggregates[school.name][gradeLevel]) {
            schoolAggregates[school.name][gradeLevel] = {
              total: 0,
              assessments: 0,
              flagged: 0,
            };
          }

          const agg = schoolAggregates[school.name][gradeLevel];
          agg.total++;

          let studentHasFlaggedDomain = false;
          sc.student.assessments.forEach((sa) => {
            if (sa.assessment.status === "COMPLETED") {
              agg.assessments++;
              if (sa.assessment.domainIndicators.some((d) => d.flagged)) {
                studentHasFlaggedDomain = true;
              }
            }
          });

          if (studentHasFlaggedDomain) {
            agg.flagged++;
          }
        });
      });
    });

    // Convert to rows
    Object.entries(schoolAggregates).forEach(([schoolName, grades]) => {
      Object.entries(grades).forEach(([gradeLevel, data]) => {
        const percentage =
          data.total > 0 ? Math.round((data.flagged / data.total) * 100) : 0;

        rows.push([
          schoolName,
          gradeLevel,
          data.total.toString(),
          data.assessments.toString(),
          data.flagged.toString(),
          `${percentage}%`,
        ]);
      });
    });

    // Log export action
    await prisma.districtAuditLog.create({
      data: {
        userId: user.id,
        districtId: districtAdmin.districtId,
        action: "EXPORT_REPORT",
        metadata: {
          format,
          scope,
          schoolId: schoolId || "all",
          rowCount: rows.length - 1,
        },
      },
    });

    if (format === "csv") {
      const csv = rows.map((row) => row.join(",")).join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="district-report-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // For PDF, return JSON that frontend can use to generate PDF
    return NextResponse.json({
      rows,
      scope,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export report" },
      { status: 500 }
    );
  }
}
