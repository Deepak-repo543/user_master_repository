import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from "recharts";

interface StackedBarChartData {
  category: string;
  active: number;
  inactive: number;
}

interface StackedBarChartProps {
  data: StackedBarChartData[];
  title?: string;
  height?: number;
  activeColor?: string;
  inactiveColor?: string;
  backgroundColor?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

const StackedBarChart = ({
  data,
  title = "Active vs Inactive Users",
  height = 400,
  activeColor = "#16A34A",
  inactiveColor = "#DC2626",
  backgroundColor = "#FFFFFF",
  showGrid = true,
  showTooltip = true,
  showLegend = true,
}: StackedBarChartProps) => {
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
          {showLegend && (
            <Legend
              verticalAlign="top"
              align="center"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: "#475569", paddingBottom: 10 }}
            />
          )}
          <Bar
            dataKey="active"
            name="Active Users"
            stackId="status"
            fill={activeColor}
            radius={[0, 0, 0, 0]}
            maxBarSize={65}
          />
          <Bar
            dataKey="inactive"
            name="Inactive Users"
            stackId="status"
            fill={inactiveColor}
            radius={[6, 6, 0, 0]}
            maxBarSize={65}
          />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StackedBarChart;