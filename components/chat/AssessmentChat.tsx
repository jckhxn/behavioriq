"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { AssessmentDomain } from "@prisma/client";
import { ASSESSMENT_CONFIG } from "@/lib/config/ai-config";
import { QuestionPresenter } from "@/components/assessment/QuestionPresenter";
import { AssessmentCompletion } from "@/components/assessment/AssessmentCompletion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AssessmentChatProps {
  assessmentId: string;
}

interface StructuredAssessmentState {
  currentQuestion?: string;
  questionId?: string;
  currentDomain?: AssessmentDomain;
  progress?: {
    totalQuestions: number;
    answeredQuestions: number;
    completedDomains: number;
    overallProgress: number;
  };
}

export function AssessmentChat({ assessmentId }: AssessmentChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [assessmentStatus, setAssessmentStatus] = useState<
    "IN_PROGRESS" | "COMPLETED"
  >("IN_PROGRESS");
  const [structuredState, setStructuredState] =
    useState<StructuredAssessmentState>({});
  const [questionHistory, setQuestionHistory] = useState<
    StructuredAssessmentState[]
  >([]);
  const [subjectName, setSubjectName] = useState<string>("");
  const [aiRecommendations, setAiRecommendations] = useState<string>("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const isStructuredMode = ASSESSMENT_CONFIG.CURRENT_MODE === "structured";

  // Load existing messages and send initial greeting
  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Get assessment data first
        const assessmentResponse = await fetch(
          `/api/assessments/${assessmentId}`
        );
        if (assessmentResponse.ok) {
          const assessmentData = await assessmentResponse.json();
          setSubjectName(assessmentData.subjectName || "");
          setAssessmentStatus(assessmentData.status);
        }

        // Get messages
        const response = await fetch(
          `/api/assessments/${assessmentId}/messages`
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(
            data.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          );

          // Override with latest status from messages endpoint
          setAssessmentStatus(data.status);

          if (data.status !== "COMPLETED") {
            if (data.messages.length === 0) {
              // No messages - send initial greeting
              await sendInitialGreeting();
            } else if (isStructuredMode) {
              // Resuming assessment - get current question state
              await resumeAssessment();
            }
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    if (assessmentId) {
      loadMessages();
    }
  }, [assessmentId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendInitialGreeting = async () => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "start_assessment",
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (isStructuredMode) {
          // Handle structured mode initialization
          setStructuredState({
            currentQuestion: data.nextQuestion,
            questionId: data.questionId,
            currentDomain: data.currentDomain,
            progress: data.progress,
          });
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: data.message,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending initial greeting:", error);
    }
  };

  const resumeAssessment = async () => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "resume_assessment",
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.nextQuestion) {
          setStructuredState({
            currentQuestion: data.nextQuestion,
            questionId: data.questionId,
            currentDomain: data.currentDomain,
            progress: data.progress,
          });
        }
      }
    } catch (error) {
      console.error("Error resuming assessment:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/assessments/${assessmentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (data.isComplete) {
          setAssessmentStatus("COMPLETED");
        }
      } else {
        // Handle error
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I apologize, but I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, there was a connection error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = async () => {
    // If we have session history, use it
    if (questionHistory.length > 0) {
      // Get the previous state
      const previousState = questionHistory[questionHistory.length - 1];

      // Remove the last two messages (user answer and AI response)
      setMessages((prev) => prev.slice(0, -2));

      // Restore the previous question state
      setStructuredState(previousState);

      // Remove the last history item
      setQuestionHistory((prev) => prev.slice(0, -1));
    } else {
      // No session history - request previous question from API
      try {
        setIsLoading(true);
        const response = await fetch(`/api/assessments/${assessmentId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "previous_question",
          }),
        });

        if (response.ok) {
          const data = await response.json();

          if (data.previousQuestion) {
            // Remove the last two messages (user answer and AI response)
            setMessages((prev) => prev.slice(0, -2));

            // Load the previous question
            setStructuredState({
              currentQuestion: data.previousQuestion,
              questionId: data.questionId,
              currentDomain: data.currentDomain,
              progress: data.progress,
            });
          }
        }
      } catch (error) {
        console.error("Error going back:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStructuredAnswer = async (
    questionId: string,
    response: boolean
  ) => {
    setIsLoading(true);

    try {
      const apiResponse = await fetch(`/api/assessments/${assessmentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          response,
        }),
      });

      if (apiResponse.ok) {
        const data = await apiResponse.json();

        // Add conversation messages
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: response ? "Yes" : "No",
          timestamp: new Date(),
        };

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage, assistantMessage]);

        // Update structured state
        if (data.isComplete) {
          setAssessmentStatus("COMPLETED");
          setStructuredState({});
          setQuestionHistory([]);
        } else {
          // Save current state to history before moving to next question
          setQuestionHistory((prev) => [...prev, structuredState]);

          setStructuredState({
            currentQuestion: data.nextQuestion,
            questionId: data.questionId,
            currentDomain: data.currentDomain,
            progress: data.progress,
          });
        }
      } else {
        throw new Error("Failed to submit response");
      }
    } catch (error) {
      console.error("Error submitting structured answer:", error);
      // Could add error state handling here
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading assessment...</span>
      </div>
    );
  }

  if (isStructuredMode) {
    // Structured Assessment Mode
    if (assessmentStatus === "COMPLETED") {
      return (
        <AssessmentCompletion
          assessmentId={assessmentId}
          subjectName={subjectName}
        />
      );
    }

    if (
      structuredState.currentQuestion &&
      structuredState.questionId &&
      structuredState.currentDomain &&
      structuredState.progress
    ) {
      return (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Behavioral Assessment</h2>
            <Badge variant="default">In Progress</Badge>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            <QuestionPresenter
              questionId={structuredState.questionId}
              questionText={structuredState.currentQuestion}
              currentDomain={structuredState.currentDomain}
              progress={structuredState.progress}
              isLoading={isLoading}
              onAnswer={handleStructuredAnswer}
              onBack={handleBack}
              canGoBack={
                questionHistory.length > 0 ||
                (structuredState.progress?.answeredQuestions || 0) > 0
              }
            />
          </div>
        </div>
      );
    }

    // Loading state for structured mode
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Preparing assessment...</span>
        </div>
      </div>
    );
  }

  // Conversational Assessment Mode
  if (assessmentStatus === "COMPLETED") {
    return (
      <AssessmentCompletion
        assessmentId={assessmentId}
        subjectName={subjectName}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Behavioral Assessment</h2>
        <Badge variant="default">In Progress</Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.role === "user"
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your thoughts and feelings..."
            disabled={isLoading}
            className="min-h-[60px] max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="sm"
            className="self-end"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
