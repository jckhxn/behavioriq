import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { childName = "Test Child" } = body;

    // Create a mock conversational assessment for testing
    const assessment = await prisma.assessment.create({
      data: {
        userId: session.user.id,
        subjectName: childName,
        status: "COMPLETED",
        startedAt: new Date(),
        completedAt: new Date(),
        isConversational: true,
        hasEnhancedReport: false,
        childResponses: {
          responses: [
            {
              questionId: "q1",
              question: "How do you feel about school?",
              parentAnswer: "They seem anxious about going to school",
              childAnswer: "I don't like it because the work is too hard and I don't have many friends",
              timestamp: new Date().toISOString(),
            },
            {
              questionId: "q2",
              question: "What makes you feel happy?",
              parentAnswer: "Playing video games and being with family",
              childAnswer: "When I play Minecraft with my friends online and when we go to the park",
              timestamp: new Date().toISOString(),
            },
            {
              questionId: "q3",
              question: "How do you handle when things don't go your way?",
              parentAnswer: "They get very frustrated and sometimes have meltdowns",
              childAnswer: "I get really mad and sometimes I cry because it's not fair",
              timestamp: new Date().toISOString(),
            },
          ],
        },
        currentDomain: null,
        currentQuestionOrder: null,
      },
    });

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      message: "Mock conversational assessment created successfully",
    });
  } catch (error) {
    console.error("Error creating mock assessment:", error);
    return NextResponse.json(
      { error: "Failed to create mock assessment" },
      { status: 500 }
    );
  }
}
