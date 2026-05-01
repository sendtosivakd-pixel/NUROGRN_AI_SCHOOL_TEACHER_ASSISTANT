import type { ExamType, PerformanceBand, TrendStatus } from "@nuro/contracts";

export function formatPercentage(value: number): string {
  return `${Number.isFinite(value) ? value.toFixed(1) : "0.0"}%`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatExamType(value: ExamType): string {
  return value
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export function bandTone(
  band: PerformanceBand,
): "tone-success" | "tone-info" | "tone-warning" | "tone-danger" {
  if (band === "Excellent") return "tone-success";
  if (band === "Good") return "tone-info";
  if (band === "Average") return "tone-warning";
  return "tone-danger";
}

export function trendTone(
  status: TrendStatus,
): "tone-success" | "tone-danger" | "tone-neutral" {
  if (status === "improving") return "tone-success";
  if (status === "declining") return "tone-danger";
  if (status === "stable") return "tone-neutral";
  return "tone-neutral";
}

export function titleizeTrend(status: TrendStatus): string {
  return status.replace("_", " ");
}
