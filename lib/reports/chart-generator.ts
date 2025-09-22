/**
 * Chart Generation Utilities for PDF Reports
 *
 * Generates chart images for inclusion in PDF reports
 */

import { AssessmentDomain, Score } from "@prisma/client";

const DOMAIN_LABELS = {
  [AssessmentDomain.ANTISOCIAL]: "Antisocial",
  [AssessmentDomain.VIOLENCE]: "Violence",
  [AssessmentDomain.ATTENTION]: "Attention",
  [AssessmentDomain.EMOTIONAL]: "Emotional",
  [AssessmentDomain.CONDUCT]: "Conduct",
};

const DOMAIN_ORDER = [
  AssessmentDomain.ANTISOCIAL,
  AssessmentDomain.VIOLENCE,
  AssessmentDomain.ATTENTION,
  AssessmentDomain.EMOTIONAL,
  AssessmentDomain.CONDUCT,
];

export interface ChartData {
  domain: string;
  score: number;
  totalPossible: number;
}

export class ChartGenerator {
  /**
   * Generate a line chart as a canvas element
   */
  static generateLineChart(
    scores: Score[],
    width: number = 400,
    height: number = 200
  ): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    // Prepare data
    const chartData: ChartData[] = DOMAIN_ORDER.map((domain) => {
      const score = scores.find((s) => s.domain === domain);
      return {
        domain: DOMAIN_LABELS[domain],
        score: score ? score.rawScore : 0,
        totalPossible: score ? score.totalPossible : 10,
      };
    }).filter((item) => {
      // Only include domains that have actual scores
      return scores.some(
        (s) =>
          s.domain ===
          DOMAIN_ORDER.find((d) => DOMAIN_LABELS[d] === item.domain)
      );
    });

    if (chartData.length === 0) {
      // Draw "No Data" message
      ctx.fillStyle = "#666";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("No assessment data available", width / 2, height / 2);
      return canvas;
    }

    // Chart dimensions
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find max score for scaling
    const maxScore = Math.max(...chartData.map((d) => d.score));
    const yScale = chartHeight / (maxScore > 0 ? maxScore * 1.1 : 10); // Add 10% padding
    const xScale = chartWidth / Math.max(chartData.length - 1, 1);

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i < chartData.length; i++) {
      const x = padding + i * xScale;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();

    // Draw data line
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    chartData.forEach((point, index) => {
      const x = padding + index * xScale;
      const y = padding + chartHeight - point.score * yScale;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = "#3b82f6";
    chartData.forEach((point, index) => {
      const x = padding + index * xScale;
      const y = padding + chartHeight - point.score * yScale;

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = "#333";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";

    // X-axis labels (domain names)
    chartData.forEach((point, index) => {
      const x = padding + index * xScale;
      const y = padding + chartHeight + 20;

      // Rotate text for better fit
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(point.domain, 0, 0);
      ctx.restore();
    });

    // Y-axis labels (scores)
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const value = ((maxScore * i) / 5).toFixed(1);
      const y = padding + chartHeight - (chartHeight * i) / 5 + 4;
      ctx.fillText(value, padding - 10, y);
    }

    // Chart title
    ctx.fillStyle = "#333";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Assessment Results by Domain", width / 2, 20);

    // Y-axis title
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Score", 0, 0);
    ctx.restore();

    return canvas;
  }

  /**
   * Convert canvas to base64 data URL for PDF inclusion
   */
  static canvasToDataURL(
    canvas: HTMLCanvasElement,
    format: string = "image/png"
  ): string {
    return canvas.toDataURL(format);
  }

  /**
   * Generate line chart and return as base64 data URL
   */
  static generateLineChartDataURL(
    scores: Score[],
    width: number = 400,
    height: number = 200
  ): string {
    const canvas = this.generateLineChart(scores, width, height);
    return this.canvasToDataURL(canvas);
  }
}
