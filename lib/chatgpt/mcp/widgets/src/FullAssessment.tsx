import React, { useEffect, useState } from "react";
import { WidgetState, ToolOutput } from "./types";

const FullAssessment: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [questions, setQuestions] = useState<any[]>([]);
  const [assessmentData, setAssessmentData] = useState<Partial<WidgetState>>({});
  const [isComplete, setIsComplete] = useState(false);

  // Initialize widget state from OpenAI
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "widgetState") {
        const state = event.data.state as WidgetState;
        setQuestions(state.questions || []);
        setAssessmentData({
          assessmentId: state.assessmentId,
          childName: state.childName,
          childAge: state.childAge,
        });
      }
    };

    window.addEventListener("message", handleMessage);

    // Request initial state from OpenAI
    if (window.openai?.widgetState) {
      const state = window.openai.widgetState;
      setQuestions(state.questions || []);
      setAssessmentData({
        assessmentId: state.assessmentId,
        childName: state.childName,
        childAge: state.childAge,
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

  const handleReturnToDashboard = () => {
    if (window.openai?.toolOutput) {
      const output: ToolOutput = {
        content: [
          {
            type: "text",
            text: `Full assessment completed for ${assessmentData.childName} (Assessment ID: ${assessmentData.assessmentId}). Returning to dashboard.`,
          },
        ],
        structuredContent: {
          assessmentId: assessmentData.assessmentId,
          action: "returnToDashboard",
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
            Your full assessment has been submitted. Our team is analyzing your responses to generate personalized insights.
          </div>

          <div style={styles.summary}>
            <SummaryItem label="Questions Completed" value="75 of 75" />
            <SummaryItem label="Child Name" value={assessmentData.childName || ""} />
            <SummaryItem
              label="Child Age"
              value={`${assessmentData.childAge} years old`}
            />
            <SummaryItem
              label="Assessment ID"
              value={assessmentData.assessmentId || ""}
              mono
            />
            <SummaryItem label="Credits Remaining" value="Checking..." />
          </div>

          <div style={styles.nextSteps}>
            <strong>What happens next?</strong>
            <ul style={styles.nextStepsList}>
              <li>Results will be ready within 24 hours</li>
              <li>You'll receive an email notification when they're available</li>
              <li>Detailed insights will help you understand your child better</li>
              <li>Get personalized recommendations based on the assessment</li>
            </ul>
          </div>

          <button
            style={{ ...styles.button, ...styles.btnPrimary, width: "100%" }}
            onClick={handleReturnToDashboard}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.assessmentScreen}>
        <div style={styles.header}>
          <div style={styles.childInfo}>
            {assessmentData.childName} • Age {assessmentData.childAge}
          </div>

          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <div style={styles.progressText}>
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>

        {question.domain && (
          <div style={styles.categoryLabel}>
            {question.domain.toUpperCase()}
          </div>
        )}
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
  childInfo: {
    background: "#f0f4ff",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "16px",
    fontSize: "14px",
    color: "#667eea",
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
  categoryLabel: {
    fontSize: "12px",
    color: "#667eea",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
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
    gap: "10px",
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
    background: "#f0fdf4",
    borderLeft: "4px solid #22c55e",
    borderRadius: "4px",
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "13px",
    color: "#166534",
    marginBottom: "20px",
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

export default FullAssessment;
