import { useLayoutEffect, useRef, useMemo } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

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
  borderRadius?: number;
  animated?: boolean;
  className?: string;
}

const DEFAULT_COLORS = [
  "#4F46E5",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#6366F1",
];

const BarChart = ({
  data,
  title = "Users by Department",
  height = 350,
  colors = DEFAULT_COLORS,
  backgroundColor = "#FFFFFF",
  showGrid = true,
  showTooltip = true,
  borderRadius = 12,
  animated = true,
  className = "",
}: BarChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  useLayoutEffect(() => {
    if (!chartRef.current || sortedData.length === 0) {
      return;
    }

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        paddingTop: 10,
        paddingBottom: 50,
        paddingLeft: 10,
        paddingRight: 20,
        background: am5.Rectangle.new(root, {
          fill: am5.color(backgroundColor),
          fillOpacity: 1,
        }),
      })
    );

    chart.children.unshift(
      am5.Label.new(root, {
        text: title,
        fontSize: 18,
        fontWeight: "600",
        fill: am5.color(0x172033),
        paddingBottom: 15,
        paddingLeft: 5,
      })
    );

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 40,
      cellStartLocation: 0.15,
      cellEndLocation: 0.85,
    });

    xRenderer.grid.template.setAll({
      visible: false,
    });

    xRenderer.labels.template.setAll({
      fill: am5.color(0x334155),
      fontSize: 12,
      fontWeight: "500",
      paddingTop: 10,
      maxWidth: 120,
      oversizedBehavior: "wrap",
      textAlign: "center",
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: xRenderer,
      })
    );

    const yRenderer = am5xy.AxisRendererY.new(root, {
      minGridDistance: 50,
    });

    yRenderer.labels.template.setAll({
      fill: am5.color(0x64748b),
      fontSize: 12,
      fontWeight: "500",
      paddingRight: 12,
    });

    yRenderer.grid.template.setAll({
      stroke: am5.color(0xe2e8f0),
      strokeOpacity: showGrid ? 0.5 : 0,
      strokeDasharray: [4, 4],
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        extraMax: 0.15,
        renderer: yRenderer,
      })
    );

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: title,
        xAxis,
        yAxis,
        valueYField: "value",
        categoryXField: "category",
        tooltip: showTooltip
          ? am5.Tooltip.new(root, {
            getFillFromSprite: false,
            autoTextColor: false,
            labelText: "{categoryX}\n[bold]{valueY} Users[/]",
          })
          : undefined,
      })
    );

    if (showTooltip && series.get("tooltip")) {
      const tooltip = series.get("tooltip")!;
      tooltip.get("background")!.setAll({
        fill: am5.color(0x1e293b),
        fillOpacity: 0.95,
        strokeOpacity: 0,
      });
      tooltip.label.setAll({
        fill: am5.color(0xffffff),
        fontSize: 13,
        fontWeight: "500",
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 12,
        paddingRight: 12,
      });
    }

    series.columns.template.setAll({
      fillOpacity: 0.9,
      strokeOpacity: 0,
      cornerRadiusTL: 8,
      cornerRadiusTR: 8,
      cornerRadiusBL: 0,
      cornerRadiusBR: 0,
      width: am5.percent(55),
      shadowColor: am5.color(0x94a3b8),
      shadowBlur: 8,
      shadowOffsetX: 2,
      shadowOffsetY: 3,
      shadowOpacity: 0.12,
    });

    series.columns.template.adapters.add("fill", (fill, target) => {
      const dataItem = target.dataItem;
      if (!dataItem) return fill;
      const dataContext = dataItem.dataContext as BarChartData;
      const index = sortedData.findIndex(
        (item) => item.category === dataContext.category
      );
      return am5.color(colors[index % colors.length]);
    });

    series.columns.template.states.create("hover", {
      fillOpacity: 1,
      scale: 1.04,
      shadowOpacity: 0.25,
    });
    xAxis.data.setAll(sortedData);
    series.data.setAll(sortedData);
    if (animated) {
      series.appear(1000);
      chart.appear(1000, 100);
    }

    return () => {
      root.dispose();
    };
  }, [sortedData, title, colors, backgroundColor, showGrid, showTooltip, animated]);

  return (
    <div
      ref={chartRef}
      className={className}
      style={{
        width: "100%",
        height,
        borderRadius: `${borderRadius}px`,
        overflow: "hidden",
        background: "transparent",
      }}
    />
  );
};

export default BarChart;