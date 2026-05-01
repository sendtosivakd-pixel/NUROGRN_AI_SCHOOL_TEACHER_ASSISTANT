import type {
  SubjectAnalytics,
  SubjectTrendPoint,
  TrendPoint,
} from "@nuro/contracts";

import { formatPercentage } from "@/lib/format";

export function SubjectBarChart({ subjects }: { subjects: SubjectAnalytics[] }) {
  if (!subjects.length) {
    return <div className="empty-state">Add at least one exam to unlock subject analytics.</div>;
  }

  return (
    <div className="chart-bars">
      {subjects.map((subject) => (
        <div className="bar-wrap" key={subject.subjectId}>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ height: `${Math.max(subject.latestPercentage, 5)}%` }}
            />
          </div>
          <strong>{subject.subjectName}</strong>
          <span className="muted">{formatPercentage(subject.latestPercentage)}</span>
        </div>
      ))}
    </div>
  );
}

export function TrendLineChart({ points }: { points: TrendPoint[] }) {
  if (points.length < 2) {
    return <div className="empty-state">Two or more exams will reveal the progress trend.</div>;
  }

  const width = 560;
  const height = 220;
  const padding = 20;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const coordinates = points.map((point, index) => {
    const x = padding + (index / (points.length - 1)) * usableWidth;
    const y = padding + ((100 - point.overallPercentage) / 100) * usableHeight;
    return `${x},${y}`;
  });

  return (
    <div className="trend-card">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="220" aria-label="Overall trend">
        <path
          d={`M ${coordinates.join(" L ")}`}
          fill="none"
          stroke="#0f6c5b"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {points.map((point, index) => {
          const [x, y] = coordinates[index].split(",");
          return (
            <g key={point.examId}>
              <circle cx={x} cy={y} r="5" fill="#ef8c34" />
            </g>
          );
        })}
      </svg>
      <div className="metric-row" style={{ justifyContent: "space-between" }}>
        {points.map((point) => (
          <div key={point.examId}>
            <strong>{point.examName}</strong>
            <div className="muted">{formatPercentage(point.overallPercentage)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StrengthDonut({
  subjectSeries,
}: {
  subjectSeries: SubjectAnalytics[];
}) {
  if (!subjectSeries.length) {
    return <div className="empty-state">The strength map appears once subject data exists.</div>;
  }

  const strongCount = subjectSeries.filter((subject) => subject.latestPercentage >= 70).length;
  const weakCount = subjectSeries.filter((subject) => subject.latestPercentage < 60).length;
  const total = subjectSeries.length;
  const strongPercent = total ? (strongCount / total) * 100 : 0;

  return (
    <div>
      <div
        className="donut"
        style={{
          background: `conic-gradient(#0f6c5b 0 ${strongPercent}%, #ef8c34 ${strongPercent}% 100%)`,
        }}
      >
        <div className="donut-center">
          <div>
            <strong>{strongCount}</strong>
            <div className="muted">strong subjects</div>
          </div>
        </div>
      </div>
      <div className="button-row" style={{ justifyContent: "center", marginTop: 20 }}>
        <span className="subject-pill">
          <strong>{strongCount}</strong> strong
        </span>
        <span className="subject-pill">
          <strong>{weakCount}</strong> weak
        </span>
      </div>
    </div>
  );
}
