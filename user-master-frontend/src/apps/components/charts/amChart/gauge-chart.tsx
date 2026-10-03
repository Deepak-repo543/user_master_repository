import React from "react";

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  valueSuffix?: string;
  badge?: string;
  trend?: { value: number; label?: string };
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  title = "Active Users",
  height = 350,
  color = "#4F46E5",
  backgroundColor = "#FFFFFF",
  showValue = true,
  valueSuffix = "%",
  badge = "USER ANALYTICS",
  trend,
}) => {
  const safeValue = Math.min(Math.max(value, min), max);
  const range = max - min;
  const percentage = range > 0 ? (safeValue - min) / range : 0;
  const radius = 128;
  const centerX = 160;
  const centerY = 175;
  const strokeWidth = 14;
  const angle = Math.PI + percentage * Math.PI;
  const endX = centerX + radius * Math.cos(angle);
  const endY = centerY + radius * Math.sin(angle);
  const largeArcFlag = percentage > 0.5 ? 1 : 0;
  const displayValue = Math.round(safeValue);
  const isTrendUp = trend ? trend.value >= 0 : false;
  const trendColor = isTrendUp ? "#16A34A" : "#DC2626";
  const trendBg = isTrendUp ? "#DCFCE7" : "#FEE2E2";
  const trendArrow = isTrendUp ? "▲" : "▼";

  return (
    <div
      style={{
        width: "100%",
        height,
        background: backgroundColor,
        borderRadius: 16,
        padding: "22px 24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
      }}
    >
      {/* ---------- Header ---------- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#0F172A",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>

        {badge && (
          <div
            style={{
              background: "#EEF2FF",
              color: "#4F46E5",
              padding: "5px 11px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            {badge}
          </div>
        )}
      </div>

      {/* ---------- Gauge ---------- */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 320 210"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: "block" }}
        >
          <defs>
            {/* Gradient for the arc */}
            <linearGradient
              id="gaugeGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#A5B4FC" />
              <stop offset="60%" stopColor={color} />
              <stop offset="100%" stopColor={color} />
            </linearGradient>

            {/* Soft glow */}
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <path
            d="M 32 175 A 128 128 0 0 1 288 175"
            fill="none"
            stroke="#EEF1F6"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Tick marks (subtle) */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const tickAngle = Math.PI + t * Math.PI;
            const x1 = centerX + (radius + 12) * Math.cos(tickAngle);
            const y1 = centerY + (radius + 12) * Math.sin(tickAngle);
            const x2 = centerX + (radius + 18) * Math.cos(tickAngle);
            const y2 = centerY + (radius + 18) * Math.sin(tickAngle);
            return (
              <line
                key={t}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#CBD5E1"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Active arc */}
          {percentage > 0 && (
            <path
              d={`M 32 175 A 128 128 0 ${largeArcFlag} 1 ${endX} ${endY}`}
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              filter="url(#gaugeGlow)"
            />
          )}

          {/* Center value */}
          {showValue && (
            <>
              <text
                x={centerX}
                y={140}
                textAnchor="middle"
                fontSize="48"
                fontWeight="700"
                fill="#0F172A"
                letterSpacing="-0.02em"
              >
                {displayValue}
                {valueSuffix}
              </text>
            </>
          )}

          {/* Min / Max labels */}
          <text x="29" y="205" fontSize="11" fill="#94A3B8" fontWeight="500">
            {min}
            {valueSuffix}
          </text>
          <text
            x="291"
            y="205"
            textAnchor="end"
            fontSize="11"
            fill="#94A3B8"
            fontWeight="500"
          >
            {max}
            {valueSuffix}
          </text>
        </svg>
      </div>

      {/* ---------- Trend footer (optional) ---------- */}
      {trend && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F8FAFC",
            border: "1px solid #EEF1F6",
            borderRadius: 10,
            padding: "10px 14px",
            marginTop: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
                fontWeight: 700,
                color: trendColor,
                background: trendBg,
                padding: "3px 8px",
                borderRadius: 6,
              }}
            >
              {trendArrow} {Math.abs(trend.value)}%
            </span>
            <span style={{ fontSize: 12, color: "#64748B" }}>
              {trend.label ?? "vs last period"}
            </span>
          </div>

          <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
            {displayValue}
            {valueSuffix} now
          </span>
        </div>
      )}
    </div>
  );
};

export default GaugeChart;