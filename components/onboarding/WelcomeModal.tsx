"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, BarChart3, MessageSquare, Sparkles } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onStartTour: () => void;
  onSkip: () => void;
}

export function WelcomeModal({ open, onStartTour, onSkip }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onSkip()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center mb-2">
            Welcome to BehaviorIQ™ 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-center text-muted-foreground text-lg">
            Let&apos;s take a quick tour to help you get the most out of your
            experience
          </p>

          <div className="grid grid-cols-2 gap-4">
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-blue-500" />}
              title="AI-Powered Assessments"
              description="Comprehensive behavioral analysis"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-green-500" />}
              title="Visual Reports"
              description="Easy-to-understand insights"
            />
            <FeatureCard
              icon={<MessageSquare className="h-8 w-8 text-purple-500" />}
              title="Expert Chat"
              description="Ask questions anytime"
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-yellow-500" />}
              title="Personalized Resources"
              description="Tailored recommendations"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" className="flex-1" onClick={onSkip}>
              Maybe Later
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={onStartTour}
            >
              Start Tour (30 seconds)
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You can restart this tour anytime from Settings
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="mb-2">{icon}</div>
      <h3 className="font-semibold mb-1 text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
