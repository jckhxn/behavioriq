"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Send, MessageCircle, User, Bot } from "lucide-react";
import { ConversationalMessage } from "@/lib/ai/conversational/types";
import { MarkdownMessage } from "./MarkdownMessage";

interface ConversationalAssessmentProps {
  onComplete: (responses: Record<string, boolean>) => void;
}

export function ConversationalAssessment({
  onComplete,
}: ConversationalAssessmentProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationalMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ answered: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize session
  useEffect(() => {
    async function initializeSession() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/assessment/conversational/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isTrial: true }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to start session");
        }

        const data = await response.json();
        setSessionId(data.sessionId);
        setMessages([data.message]);
      } catch (error) {
        console.error("Error starting session:", error);
        // Show error message in chat
        const errorMessage: ConversationalMessage = {
          id: `error_${Date.now()}`,
          role: "ai",
          content: `Sorry, I'm having trouble starting the assessment right now. ${error instanceof Error ? error.message : "Please try again later."}`,
          timestamp: new Date(),
        };
        setMessages([errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }

    initializeSession();
  }, []);

  const sendMessage = async () => {
    if (!currentMessage.trim() || !sessionId || isLoading) return;

    const userMessage: ConversationalMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assessment/conversational/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: currentMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();

      setMessages((prev) => [...prev, data.message]);
      setProgress(data.progress);
      setIsComplete(data.isComplete);

      // If assessment is complete, fetch results
      if (data.isComplete) {
        const completeResponse = await fetch(
          "/api/assessment/conversational/complete",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          }
        );

        if (completeResponse.ok) {
          const completeData = await completeResponse.json();

          // Store results in localStorage for trial-results page
          localStorage.setItem(
            "conversationalTrialResults",
            JSON.stringify({
              responses: completeData.responses,
              scores: completeData.scores,
              scoresByDomain: completeData.scoresByDomain,
              summary: completeData.summary,
              totalQuestions: completeData.totalQuestions,
              answeredQuestions: completeData.answeredQuestions,
              timestamp: new Date().toISOString(),
            })
          );

          // Display the AI-generated summary as a final message
          if (completeData.summary) {
            const summaryMessage: ConversationalMessage = {
              id: `summary_${Date.now()}`,
              role: "ai",
              content: completeData.summary,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, summaryMessage]);
            setSummary(completeData.summary);
          }

          onComplete(completeData.responses);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message to chat
      const errorMessage: ConversationalMessage = {
        id: `error_${Date.now()}`,
        role: "ai",
        content: "Sorry, I had trouble processing that. Could you try again?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!sessionId && isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Starting Assessment...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Conversational Assessment
        </CardTitle>

        {progress.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>
                {progress.answered} of {progress.total} questions
              </span>
            </div>
            <Progress value={(progress.answered / progress.total) * 100} />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className="flex-shrink-0">
                    {message.role === "user" ? (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div
                    className={`rounded-lg px-3 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <MarkdownMessage
                      content={message.content}
                      isUser={message.role === "user"}
                    />
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <p className="text-xs opacity-70 mt-1">Thinking...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {!isComplete && (
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response here..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!currentMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        {isComplete && !summary && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Assessment complete! Preparing your results...
            </p>
          </div>
        )}

        {isComplete && summary && (
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              ✅ Assessment Complete! Check the chat above for your personalized
              results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
