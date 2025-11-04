import React, { useEffect, useState } from "react";
import { WidgetState, ToolOutput } from "./types";

const Results: React.FC = () => {
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultId, setResultId] = useState<string>("");

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "widgetState") {
        const state = event.data.state as WidgetState;
        if (state.resultId) {
          setResultId(state.resultId);
          fetchResults(state.resultId);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    if (window.openai?.widgetState?.resultId) {
      const resultId = window.openai.widgetState.resultId;
      setResultId(resultId);
      fetchResults(resultId);
    }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const fetchResults = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chatgpt/mcp/results/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
      const data = await response.json();
      setResultData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case "severe":
        return "#dc2626";
      case "moderate":
        return "#f59e0b";
      case "mild":
        return "#eab308";
      default:
        return "#22c55e";
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading assessment results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>No results found</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Assessment Results</h1>
        <p style={styles.headerSubtitle}>
          Assessment for {resultData.childName}, age {resultData.childAge}
        </p>

        <div style={styles.overallScore}>
          <div style={styles.scoreCircle}>
            <div style={styles.scoreValue}>{resultData.overall?.score}</div>
            <div style={styles.scoreLabel}>Overall Score</div>
          </div>
          <div>
            <div
              style={{
                ...styles.riskBadge,
                backgroundColor: getRiskColor(resultData.overall?.severity),
              }}
            >
              {resultData.overall?.severity.toUpperCase()}
            </div>
            <div style={styles.percentile}>
              {resultData.overall?.percentile}th percentile
            </div>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Domain Breakdown</h2>
          {resultData.domainScores?.map(
            (domain: any, index: number) => (
              <div key={index} style={styles.domainItem}>
                <div style={styles.domainHeader}>
                  <span style={styles.domainName}>
                    {domain.domain.charAt(0).toUpperCase() +
                      domain.domain.slice(1)}
                  </span>
                  <span style={styles.domainScore}>{domain.score}/15</span>
                </div>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${(domain.score / 15) * 100}%`,
                      backgroundColor: getRiskColor(domain.severity),
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>

        {resultData.recommendations && resultData.recommendations.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Recommendations</h2>
            {resultData.recommendations.map(
              (rec: any, index: number) => (
                <div key={index} style={styles.recommendationItem}>
                  <div style={styles.recTitle}>{rec.title}</div>
                  <div style={styles.recDescription}>{rec.description}</div>
                </div>
              )
            )}
          </div>
        )}

        {resultData.nextSteps && resultData.nextSteps.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Next Steps</h2>
            <ul style={styles.nextStepsList}>
              {resultData.nextSteps.map(
                (step: string, index: number) => (
                  <li key={index}>{step}</li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "#f9fafb",
    minHeight: "100vh",
    padding: "20px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loading: {
    maxWidth: "700px",
    margin: "0 auto",
    textAlign: "center",
    padding: "40px 20px",
    color: "#6b7280",
  },
  error: {
    maxWidth: "700px",
    margin: "0 auto",
    textAlign: "center",
    padding: "40px 20px",
    color: "#dc2626",
    background: "white",
    borderRadius: "12px",
  },
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "12px",
    padding: "32px",
    marginBottom: "24px",
    maxWidth: "700px",
    margin: "0 auto 24px",
    textAlign: "center",
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: 700,
    marginBottom: "8px",
  },
  headerSubtitle: {
    fontSize: "14px",
    opacity: 0.9,
    marginBottom: "24px",
  },
  overallScore: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "30px",
    marginTop: "20px",
  },
  scoreCircle: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  scoreValue: {
    fontSize: "36px",
  },
  scoreLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    opacity: 0.9,
  },
  riskBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "6px",
    color: "white",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "8px",
  },
  percentile: {
    fontSize: "13px",
    color: "#e0e7ff",
  },
  content: {
    maxWidth: "700px",
    margin: "0 auto",
  },
  section: {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "16px",
  },
  domainItem: {
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e5e7eb",
  },
  domainHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  domainName: {
    fontWeight: 600,
    color: "#1f2937",
  },
  domainScore: {
    color: "#6b7280",
    fontSize: "14px",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    background: "#e5e7eb",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s ease",
  },
  recommendationItem: {
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e5e7eb",
  },
  recTitle: {
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "4px",
  },
  recDescription: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: 1.6,
  },
  nextStepsList: {
    marginLeft: "20px",
    color: "#6b7280",
    lineHeight: 1.8,
  },
};

export default Results;
