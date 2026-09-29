import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";

interface BarChartData {
  category: string;
  value: number;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
  colors?: string[];
  backgroundColor?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
}

// Default palette — cycles if there are more bars than colors.
const DEFAULT_COLORS = [
  "#4F46E5",
  "#16A34A",
  "#F59E0B",
  "#DC2626",
  "#0EA5E9",
  "#9333EA",
  "#EC4899",
  "#14B8A6",
];
const BarChart = ({
  data,
  title,
  height = 400,
  colors = DEFAULT_COLORS,
  backgroundColor = "#FFFFFF",
  showGrid = true,
  showTooltip = true,
}: BarChartProps) => {
  return (
    <div style={{ width: "100%", height, backgroundColor }}>
      {title && (
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#172033",
            marginBottom: 15,
          }}
        >
          {title}
        </div>
      )}

      <ResponsiveContainer width="100%" height={title ? height - 33 : height}>
        <ReBarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          barCategoryGap="35%"
        >
          {showGrid && (
            <CartesianGrid
              stroke="#E2E8F0"
              strokeDasharray="3 3"
              vertical={false}
            />
          )}

          <XAxis
            dataKey="category"
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
          />

          <YAxis
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          {showTooltip && (
            <Tooltip
              cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
              contentStyle={{
                backgroundColor: "#172033",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#FFFFFF" }}
              itemStyle={{ color: "#FFFFFF" }}
            />
          )}

          <Bar
            dataKey="value"
            radius={[6, 6, 0, 0]}
            maxBarSize={65}
            shape={(props: any) => {
              const { x, y, width, height, index } = props;

              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={colors[(index ?? 0) % colors.length]}
                  rx={6}
                  ry={6}
                />
              );
            }}
          />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;