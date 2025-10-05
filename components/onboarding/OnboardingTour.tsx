"use client";

import { useEffect } from "react";
import { useOnboarding } from "@/lib/contexts/OnboardingContext";
import { driver } from "driver.js";
import confetti from "canvas-confetti";
import "driver.js/dist/driver.css";

const tourSteps = [
  {
    element: "#create-assessment-btn",
    popover: {
      title: "📝 Create Your First Assessment",
      description:
        "Start by creating a behavioral assessment. Our AI will guide you through a series of questions tailored to understand your child's needs.",
      side: "bottom" as const,
      align: "center" as const,
    },
  },
  {
    element: "#assessments-list",
    popover: {
      title: "📊 View Past Assessments",
      description:
        "All your completed assessments are saved here. Click any assessment to view detailed reports and AI-powered insights.",
      side: "right" as const,
      align: "start" as const,
    },
  },
  {
    element: "#credits-display",
    popover: {
      title: "💳 Assessment Credits",
      description:
        "Each assessment requires 1 credit. Purchase more credits or upgrade to Professional for unlimited assessments.",
      side: "left" as const,
      align: "start" as const,
    },
  },
  {
    element: '[data-tab-id="chat"]',
    popover: {
      title: "💬 Take Assessment with AI",
      description:
        "Try our conversational AI assessment! Have a natural conversation with our AI to complete your behavioral assessment - it's easier and more interactive than traditional forms.",
      side: "bottom" as const,
      align: "center" as const,
    },
  },
  {
    element: '[data-tab-id="settings"]',
    popover: {
      title: "⚙️ Manage Your Account",
      description:
        "Update your profile, manage billing, and customize your experience in settings. Great job! 🎉",
      side: "left" as const,
      align: "start" as const,
    },
  },
];

export function OnboardingTour() {
  const { isActive, completeTour, skipTour } = useOnboarding();

  useEffect(() => {
    if (!isActive) return;

    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps: tourSteps.map((step, index) => ({
        ...step,
        popover: {
          ...step.popover,
          progressText: `Step ${index + 1} of ${tourSteps.length}`,
          nextBtnText: index === tourSteps.length - 1 ? "Finish" : "Next",
          prevBtnText: "Previous",
        },
      })),
      onDestroyStarted: () => {
        const hasNextStep = driverObj.hasNextStep();
        const hasPreviousStep = driverObj.hasPreviousStep();

        // If we're at the end, complete the tour
        if (!hasNextStep && hasPreviousStep) {
          completeTour();
          triggerConfetti();
        } else {
          // Otherwise, user is skipping
          skipTour();
        }

        driverObj.destroy();
      },
      onNextClick: () => {
        driverObj.moveNext();
      },
      onPrevClick: () => {
        driverObj.movePrevious();
      },
    });

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      driverObj.drive();
    }, 500);

    return () => {
      clearTimeout(timer);
      driverObj.destroy();
    };
  }, [isActive, completeTour, skipTour]);

  return null;
}

function triggerConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#3b82f6", "#8b5cf6", "#ec4899"],
    });

    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#3b82f6", "#8b5cf6", "#ec4899"],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}
