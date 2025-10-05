"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface OnboardingContextType {
  isActive: boolean;
  showWelcome: boolean;
  currentStep: number;
  totalSteps: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  setShowWelcome: (show: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 5;

  // Check if user needs onboarding on mount
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const res = await fetch("/api/user/onboarding-status");
      if (res.ok) {
        const { needsOnboarding } = await res.json();
        if (needsOnboarding) {
          // Small delay to ensure dashboard is loaded
          setTimeout(() => {
            setShowWelcome(true);
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
    }
  };

  const startTour = () => {
    setShowWelcome(false);
    setIsActive(true);
    setCurrentStep(0);
  };

  const nextStep = async () => {
    if (currentStep < totalSteps - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      await updateOnboardingProgress(newStep);
    } else {
      await completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = async () => {
    try {
      await fetch("/api/user/onboarding-skip", { method: "POST" });
      setShowWelcome(false);
      setIsActive(false);
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
    }
  };

  const completeTour = async () => {
    try {
      await fetch("/api/user/onboarding-complete", { method: "POST" });
      setIsActive(false);
      setShowWelcome(false);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  const updateOnboardingProgress = async (step: number) => {
    try {
      await fetch("/api/user/onboarding-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step }),
      });
    } catch (error) {
      console.error("Failed to update onboarding progress:", error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        showWelcome,
        currentStep,
        totalSteps,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        completeTour,
        setShowWelcome,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
};
