"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { useUser } from "@/lib/hooks/use-supabase-user";
import { ASSESSMENT_CONFIG } from "@/lib/config/ai-config";
import { useFeatureFlag } from "@/lib/hooks/useFeatureFlag";
import { QuestionPresenter } from "@/components/assessment/QuestionPresenter";
import { AssessmentCompletion } from "@/components/assessment/AssessmentCompletion";
import type { QuestionSetConfig } from "@/lib/assessment/db-loader";
import type { QuestionResponse as StructuredQuestionResponse } from "@/lib/assessment/scoring";
import {
  getNextQuestion,
  computeProgress as sharedComputeProgress,
  type ResponseValue,
} from "@/lib/assessment/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AssessmentChatProps {
  assessmentId: string;
}

export function AssessmentChat({ assessmentId }: AssessmentChatProps) {
  const { user } = useUser();
  const debugMode = useFeatureFlag("debug_assessment");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [assessmentStatus, setAssessmentStatus] = useState<
    "IN_PROGRESS" | "COMPLETED"
  >("IN_PROGRESS");
  const [subjectName, setSubjectName] = useState<string>("");
  const [aiRecommendations, setAiRecommendations] = useState<string>("");
  const [assessmentConfigs, setAssessmentConfigs] = useState<
    QuestionSetConfig[]
  >([]);
  const [questionResponses, setQuestionResponses] = useState<
    StructuredQuestionResponse[]
  >([]);
  const [pendingSaves, setPendingSaves] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pendingQuestionIdsRef = useRef<Set<string>>(new Set());
  const [isAnswerSaving, setIsAnswerSaving] = useState(false);
  const [resolvedAssessmentId, setResolvedAssessmentId] = useState<string | null>(null);

  const isStructuredMode = ASSESSMENT_CONFIG.CURRENT_MODE === "structured";
  const determineNextQuestion = useCallback(
    (responses: StructuredQuestionResponse[]) => {
      if (assessmentConfigs.length === 0) return null;
      const responseRecord: Record<string, ResponseValue> = Object.fromEntries(
        responses.map((r) => [r.questionId, r.response as ResponseValue])
      );
      return getNextQuestion(assessmentConfigs, responseRecord);
    },
    [assessmentConfigs]
  );

  const computeProgress = useCallback(
    (responses: StructuredQuestionResponse[]) => {
      if (assessmentConfigs.length === 0) {
        return { totalQuestions: 0, answeredQuestions: 0, completedDomains: 0, overallProgress: 0 };
      }
      const responseRecord: Record<string, ResponseValue> = Object.fromEntries(
        responses.map((r) => [r.questionId, r.response as ResponseValue])
      );
      return sharedComputeProgress(assessmentConfigs, responseRecord);
    },
    [assessmentConfigs]
  );

  const progressSummary = useMemo(
    () => computeProgress(questionResponses),
    [computeProgress, questionResponses]
  );
  const activeQuestion = useMemo(
    () => determineNextQuestion(questionResponses),
    [determineNextQuestion, questionResponses]
  );
  const canGoBack =
    questionResponses.length > 0 && pendingSaves === 0 && assessmentStatus !== "COMPLETED";
  const isLocallyComplete =
    assessmentConfigs.length > 0 &&
    !activeQuestion &&
    questionResponses.length > 0;

  const finalizedRef = useRef(false);

  useEffect(() => {
    if (!isStructuredMode) {
      return;
    }

    if (isLocallyComplete && pendingSaves === 0 && !finalizedRef.current) {
      finalizedRef.current = true;
      setAssessmentStatus("COMPLETED");

      // Ensure server has computed scores and marked the assessment COMPLETED.
      // This handles cases where per-answer processStructuredResponse didn't
      // detect completion (e.g. when questions were skipped via skip logic).
      const id = resolvedAssessmentId || assessmentId;
      fetch(`/api/assessments/${id}/finalize`, { method: "POST" }).catch(
        (err) => console.error("[finalize] request failed:", err)
      );
    } else if ((activeQuestion || pendingSaves > 0) && assessmentStatus === "COMPLETED") {
      setAssessmentStatus("IN_PROGRESS");
    }
  }, [
    activeQuestion,
    assessmentId,
    assessmentStatus,
    isLocallyComplete,
    isStructuredMode,
    pendingSaves,
    resolvedAssessmentId,
  ]);

  const initializeStructuredMode = useCallback(async () => {
    if (!assessmentId) return;

    setIsInitialized(false);
    setSyncError(null);

    try {
      const response = await fetch(
        `/api/assessments/${assessmentId}/structured-state`
      );

      if (!response.ok) {
        throw new Error("Failed to load structured assessment state");
      }

      const data = await response.json();

      setSubjectName(data.subjectName || "");
      if (data.status) {
        setAssessmentStatus(data.status);
      }

      setAssessmentConfigs(data.questionSets || []);
      setResolvedAssessmentId(data.assessmentId || assessmentId);

      const deduped = new Map<string, StructuredQuestionResponse>();
      for (const entry of data.questionResponses || []) {
        deduped.delete(entry.questionId);
        deduped.set(entry.questionId, {
          questionId: entry.questionId,
          response: entry.response,
          timestamp: entry.timestamp ? new Date(entry.timestamp) : undefined,
        });
      }

      setQuestionResponses(Array.from(deduped.values()));
    } catch (error) {
      console.error("Error loading structured assessment:", error);
      setSyncError(
        "We couldn't load the assessment. Please refresh the page to try again."
      );
    } finally {
      setIsInitialized(true);
    }
  }, [assessmentId]);

  const initializeConversationalMode = useCallback(async () => {
    if (!assessmentId) return;

    setIsInitialized(false);

    try {
      const assessmentResponse = await fetch(
        `/api/assessments/${assessmentId}`
      );
      if (assessmentResponse.ok) {
        const assessmentData = await assessmentResponse.json();
        setSubjectName(assessmentData.subjectName || "");
        setAssessmentStatus(assessmentData.status);
      }

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
        setAssessmentStatus(data.status);

        if (data.status !== "COMPLETED" && data.messages.length === 0) {
          await sendInitialGreeting();
        }
      }
    } catch (error) {
      console.error("Error loading assessment messages:", error);
    } finally {
      setIsInitialized(true);
    }
  }, [assessmentId]);

  useEffect(() => {
    if (!assessmentId) return;

    if (isStructuredMode) {
      void initializeStructuredMode();
    } else {
      void initializeConversationalMode();
    }
  }, [
    assessmentId,
    isStructuredMode,
    initializeStructuredMode,
    initializeConversationalMode,
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendInitialGreeting = async () => {
    try {
      const payload: Record<string, unknown> = {
        message: "start_assessment",
      };

      if (resolvedAssessmentId) {
        payload.assessmentId = resolvedAssessmentId;
      }

      const response = await fetch(`/api/assessments/${assessmentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.resolvedAssessmentId) {
          setResolvedAssessmentId(data.resolvedAssessmentId);
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
      const payload: Record<string, unknown> = {
        message: input,
      };

      if (resolvedAssessmentId) {
        payload.assessmentId = resolvedAssessmentId;
      }

      const response = await fetch(`/api/assessments/${assessmentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        if (data.resolvedAssessmentId) {
          setResolvedAssessmentId(data.resolvedAssessmentId);
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

  const persistStructuredAnswer = useCallback(
    async (responseRecord: StructuredQuestionResponse) => {
      setPendingSaves((prev) => prev + 1);
      setSyncError(null);

      try {
        const payload: Record<string, unknown> = {
          questionId: responseRecord.questionId,
          response: responseRecord.response,
        };

        if (resolvedAssessmentId) {
          payload.assessmentId = resolvedAssessmentId;
        }

        const apiResponse = await fetch(
          `/api/assessments/${assessmentId}/chat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!apiResponse.ok) {
          throw new Error("Failed to sync structured response");
        }

        const data = await apiResponse.json();

        if (data.aiRecommendations) {
          setAiRecommendations(data.aiRecommendations);
        }

        if (data.isComplete) {
          setAssessmentStatus("COMPLETED");
        }
        if (data.resolvedAssessmentId) {
          setResolvedAssessmentId(data.resolvedAssessmentId);
        }
      } catch (error) {
        console.error("Error syncing structured response:", error);
        setQuestionResponses((prev) =>
          prev.filter((entry) => entry.questionId !== responseRecord.questionId)
        );
        setSyncError(
          "We couldn't sync that answer. Check your connection and try again."
        );
      } finally {
        pendingQuestionIdsRef.current.delete(responseRecord.questionId);
        setPendingSaves((prev) => Math.max(prev - 1, 0));
      }
    },
    [assessmentId, resolvedAssessmentId]
  );

  const handleStructuredAnswer = useCallback(
    async (questionId: string, response: boolean | number | string) => {
      if (
        !activeQuestion ||
        activeQuestion.questionId !== questionId ||
        isAnswerSaving
      ) {
        return;
      }

      if (pendingQuestionIdsRef.current.has(questionId)) {
        return;
      }

      const responseRecord: StructuredQuestionResponse = {
        questionId,
        response,
        timestamp: new Date(),
      };

      pendingQuestionIdsRef.current.add(questionId);

      let added = false;
      setQuestionResponses((prev) => {
        if (prev.some((entry) => entry.questionId === questionId)) {
          return prev;
        }
        added = true;
        return [...prev, responseRecord];
      });

      if (!added) {
        pendingQuestionIdsRef.current.delete(questionId);
        return;
      }

      setAssessmentStatus("IN_PROGRESS");
      setSyncError(null);

      setIsAnswerSaving(true);
      try {
        await persistStructuredAnswer(responseRecord);
      } finally {
        setIsAnswerSaving(false);
      }
    },
    [activeQuestion, isAnswerSaving, persistStructuredAnswer]
  );

  const handleBack = useCallback(async () => {
    if (questionResponses.length === 0 || pendingSaves > 0) {
      return;
    }

    const previousResponses = questionResponses;
    const updatedResponses = previousResponses.slice(0, -1);

    setQuestionResponses(updatedResponses);
    setAssessmentStatus("IN_PROGRESS");
    setSyncError(null);
    setPendingSaves((prev) => prev + 1);

    try {
      const payload: Record<string, unknown> = {
        message: "previous_question",
      };

      if (resolvedAssessmentId) {
        payload.assessmentId = resolvedAssessmentId;
      }

      const response = await fetch(`/api/assessments/${assessmentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to revert structured answer");
      }

      try {
        const data = await response.json();
        if (data?.resolvedAssessmentId) {
          setResolvedAssessmentId(data.resolvedAssessmentId);
        }
      } catch (parseError) {
        // Ignore JSON parse errors for empty bodies
      }
    } catch (error) {
      console.error("Error reverting answer:", error);
      setQuestionResponses(previousResponses);
      setSyncError(
        "We couldn't revert that answer. Please check your connection and try again."
      );
    } finally {
      setPendingSaves((prev) => Math.max(prev - 1, 0));
    }
  }, [assessmentId, pendingSaves, questionResponses, resolvedAssessmentId]);

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
    if (assessmentStatus === "COMPLETED" && !activeQuestion) {
      return (
        <AssessmentCompletion
          assessmentId={assessmentId}
          subjectName={subjectName}
          aiRecommendations={aiRecommendations}
          debugMode={debugMode}
        />
      );
    }

    if (activeQuestion && assessmentConfigs.length > 0) {
      return (
        <div className="flex flex-col h-full">
          {syncError && (
            <div className="px-5 py-2 text-[12px] text-dash-rose-700 bg-dash-rose-50 border-b border-dash-rose-700/20 shrink-0">
              {syncError}
            </div>
          )}
          {pendingSaves > 0 && (
            <div className="px-5 py-1.5 text-[11px] text-dash-ink-500 bg-dash-sunk border-b border-dash-ink-100 flex items-center gap-1.5 shrink-0">
              <Loader2 className="h-3 w-3 animate-spin" />
              Syncing…
            </div>
          )}

          <div className="flex-1 px-5 overflow-auto">
            <QuestionPresenter
              questionId={activeQuestion.questionId}
              questionText={activeQuestion.text}
              currentDomain={activeQuestion.domain}
              progress={progressSummary}
              isLoading={isAnswerSaving || pendingSaves > 0}
              onAnswer={handleStructuredAnswer}
              onBack={handleBack}
              canGoBack={canGoBack}
              assessmentConfigs={assessmentConfigs}
              responseType={activeQuestion.responseType}
              likertScale={activeQuestion.likertScale}
              debugMode={debugMode}
              debugResponses={debugMode ? questionResponses : undefined}
            />
          </div>
        </div>
      );
    }

    // Loading state for structured mode
    if (syncError) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-3 px-4 text-center">
          <Loader2 className="h-6 w-6 text-destructive" />
          <p className="text-sm text-destructive">{syncError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void initializeStructuredMode()}
          >
            Try again
          </Button>
        </div>
      );
    }

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
        aiRecommendations={aiRecommendations}
        debugMode={debugMode}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-dash-ink-100 shrink-0">
        <h2 className="text-[14px] font-semibold text-dash-ink-900">Behavioral Assessment</h2>
        <span className="text-[11px] font-semibold text-dash-amber-700 bg-dash-amber-50 px-2 py-0.5 rounded-md">
          In progress
        </span>
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
