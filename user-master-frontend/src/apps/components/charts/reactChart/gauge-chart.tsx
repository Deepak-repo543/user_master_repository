import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface GaugeChartProps {
  value: number;
  min?: number;
  max: number;
  title?: string;
  height?: number;
}

const getMajorTickCount = (min: number, max: number) => {
  const range = Math.max(max - min, 1);
  for (let intervals = 6; intervals >= 4; intervals--) {
    if (range % intervals === 0) return intervals + 1;
  }
  for (let intervals = 7; intervals <= 10; intervals++) {
    if (range % intervals === 0) return intervals + 1;
  }
  return Math.min(range, 6) + 1;
};

const GaugeChart = ({
  value,
  min = 0,
  max,
  title,
  height = 360,
}: GaugeChartProps) => {
  const clampedValue = Math.min(Math.max(value, min), max);
  const range = max - min || 1;
  const band1End = min + range / 3;
  const band2End = min + (range * 2) / 3;
  const majorCount = getMajorTickCount(min, max);

  const options: ApexOptions = {
    chart: {
      height,
      type: "radialBar",
      sparkline: { enabled: false },
    },
    plotOptions: {
      radialBar: {
        shape: "needle" as any,
        startAngle: -135,
        endAngle: 135,
        min,
        max,
        bands: [
          { from: min, to: band1End, color: "#FF4560" },
          { from: band1End, to: band2End, color: "#FEB019" },
          { from: band2End, to: max, color: "#00E396" },
        ],
        bandsStyle: {
          strokeWidth: "50%",
          gap: 1,
        },
        ticks: {
          show: true,
          major: {
            count: majorCount,
            length: 8,
            width: 2,
            color: "#334155",
            placement: "outside",
          },
          minor: {
            count: 1,
            length: 4,
            width: 1,
            color: "#94A3B8",
            placement: "outside",
          },
          labels: {
            show: true,
            offset: 6,
            fontSize: "11px",
            color: "#334155",
            formatter: (val: number | string) =>
              String(Math.round(Number(val) * 10) / 10),
          },
        } as any,
        needle: {
          color: "#0F172A",
          length: "60%",
          baseWidth: 6,
          tipWidth: 1,
        },
        hollow: {
          margin: 0,
          size: "70%",
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 32,
            fontSize: "28px",
            fontWeight: 700,
            color: "#172033",
            formatter: (val: number) => `${Math.round(val)}`,
          },
        },
      },
    },
    labels: [title ?? "Value"],
  };

  return (
    <div style={{ width: "100%" }}>
      {title && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#475569",
            marginBottom: 4,
          }}
        >
          {title}
        </div>
      )}
      <ReactApexChart
        options={options}
        series={[clampedValue]}
        type="radialBar"
        height={height}
      />
    </div>
  );
};

export default GaugeChart;