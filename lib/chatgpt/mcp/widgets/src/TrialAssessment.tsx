import React, { useEffect, useState } from "react";
import { WidgetState, ToolOutput } from "./types";

const TrialAssessment: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [questions, setQuestions] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<Partial<WidgetState>>({});
  const [isComplete, setIsComplete] = useState(false);

  // Initialize widget state from OpenAI
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "widgetState") {
        const state = event.data.state as WidgetState;
        setQuestions(state.questions || []);
        setSessionData({
          sessionId: state.sessionId,
          childAge: state.childAge,
          relationshipType: state.relationshipType,
        });
      }
    };

    window.addEventListener("message", handleMessage);

    // Request initial state from OpenAI
    if (window.openai?.widgetState) {
      const state = window.openai.widgetState;
      setQuestions(state.questions || []);
      setSessionData({
        sessionId: state.sessionId,
        childAge: state.childAge,
        relationshipType: state.relationshipType,
      });
    }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      // Submit assessment
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    setIsComplete(true);
  };

  const handleCreateAccount = () => {
    if (window.openai?.toolOutput) {
      const output: ToolOutput = {
        content: [
          {
            type: "text",
            text: `Trial assessment completed with session ${sessionData.sessionId}. User wants to create an account.`,
          },
        ],
        structuredContent: {
          sessionId: sessionData.sessionId,
          action: "createAccount",
        },
      };
      window.openai.toolOutput(output);
    }
  };

  if (!questions.length) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingText}>Loading assessment...</div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isAnswered = selectedAnswers[currentQuestion] !== undefined;

  if (isComplete) {
    return (
      <div style={styles.container}>
        <div style={styles.completionScreen}>
          <div style={styles.completionIcon}>✅</div>
          <div style={styles.completionTitle}>Assessment Complete!</div>
          <div style={styles.completionText}>
            Your trial assessment has been submitted. Your responses have been recorded anonymously.
          </div>

          <div style={styles.summary}>
            <SummaryItem label="Questions Completed" value="15 of 15" />
            <SummaryItem label="Child Age" value={`${sessionData.childAge} years old`} />
            <SummaryItem
              label="Relationship"
              value={String(sessionData.relationshipType).charAt(0).toUpperCase() + String(sessionData.relationshipType).slice(1)}
            />
            <SummaryItem
              label="Session ID"
              value={sessionData.sessionId || ""}
              mono
            />
          </div>

          <div style={styles.nextSteps}>
            <p>You can now:</p>
            <ul style={styles.nextStepsList}>
              <li>Create an account to access full assessments</li>
              <li>Upgrade to get detailed insights and recommendations</li>
              <li>Track your child's development over time</li>
            </ul>
          </div>

          <button
            style={{ ...styles.button, ...styles.btnPrimary }}
            onClick={handleCreateAccount}
          >
            Create My Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.assessmentScreen}>
        <div style={styles.header}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <div style={styles.progressText}>
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>

        <div style={styles.questionNumber}>Question {currentQuestion + 1}</div>
        <div style={styles.questionText}>{question.text}</div>

        <div style={styles.options}>
          {question.options?.map((option: string, index: number) => (
            <div
              key={index}
              style={{
                ...styles.option,
                ...(selectedAnswers[currentQuestion] === index
                  ? styles.optionSelected
                  : {}),
              }}
              onClick={() => handleOptionSelect(index)}
            >
              {option}
            </div>
          ))}
        </div>

        <div style={styles.actions}>
          {currentQuestion > 0 && (
            <button
              style={{ ...styles.button, ...styles.btnSecondary }}
              onClick={handlePrevious}
            >
              ← Back
            </button>
          )}
          <button
            style={{
              ...styles.button,
              ...styles.btnPrimary,
              ...(currentQuestion > 0 ? { flex: 1 } : { width: "100%" }),
              opacity: isAnswered ? 1 : 0.5,
              cursor: isAnswered ? "pointer" : "not-allowed",
            }}
            onClick={handleNext}
            disabled={!isAnswered}
          >
            {currentQuestion === questions.length - 1 ? "Submit" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryItem: React.FC<{
  label: string;
  value: string;
  mono?: boolean;
}> = ({ label, value, mono }) => (
  <div style={styles.summaryItem}>
    <span>{label}</span>
    <span
      style={{
        fontWeight: 600,
        color: "#1f2937",
        ...(mono ? { fontSize: "12px", fontFamily: "monospace" } : {}),
      }}
    >
      {value}
    </span>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  assessmentScreen: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    maxWidth: "600px",
    width: "100%",
    padding: "32px",
  },
  completionScreen: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    maxWidth: "600px",
    width: "100%",
    padding: "32px",
    textAlign: "center",
  },
  header: {
    marginBottom: "24px",
  },
  progressBar: {
    background: "#e5e7eb",
    height: "8px",
    borderRadius: "4px",
    marginBottom: "16px",
    overflow: "hidden",
  },
  progressFill: {
    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
    height: "100%",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "13px",
    color: "#6b7280",
    fontWeight: 500,
  },
  questionNumber: {
    fontSize: "14px",
    color: "#667eea",
    fontWeight: 600,
    marginBottom: "8px",
  },
  questionText: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "20px",
    lineHeight: 1.4,
  },
  options: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  option: {
    padding: "12px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    background: "white",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
    fontSize: "15px",
    color: "#374151",
    fontWeight: 500,
  },
  optionSelected: {
    borderColor: "#667eea",
    background: "#eef2ff",
    color: "#667eea",
  },
  actions: {
    display: "flex",
    gap: "12px",
    marginTop: "28px",
    justifyContent: "space-between",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  btnSecondary: {
    background: "#f3f4f6",
    color: "#374151",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
  },
  completionIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  completionTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: "12px",
  },
  completionText: {
    fontSize: "15px",
    color: "#6b7280",
    marginBottom: "20px",
    lineHeight: 1.6,
  },
  summary: {
    background: "#f9fafb",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
    textAlign: "left",
  },
  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    fontSize: "14px",
    color: "#6b7280",
    borderBottom: "1px solid #e5e7eb",
  },
  nextSteps: {
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: 1.6,
    marginBottom: "20px",
    textAlign: "left",
  },
  nextStepsList: {
    marginLeft: "20px",
    marginTop: "8px",
  },
  loadingText: {
    color: "white",
    fontSize: "18px",
  },
};

export default TrialAssessment;
