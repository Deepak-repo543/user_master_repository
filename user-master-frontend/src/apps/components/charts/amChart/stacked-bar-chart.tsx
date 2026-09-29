import { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

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
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;
    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    root.container.set("layout", root.verticalLayout);
    if (title) {
      root.container.children.push(
        am5.Label.new(root, {
          text: title,
          fontSize: 18,
          fontWeight: "600",
          fill: am5.color(0x172033),
          paddingBottom: 15,
        }),
      );
    }

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        paddingTop: 10,
        paddingBottom: 5,
        paddingLeft: 5,
        paddingRight: 5,
        background: am5.Rectangle.new(root, {
          fill: am5.color(backgroundColor),
          fillOpacity: 1,
        }),
      }),
    );

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 35,
      cellStartLocation: 0.2,
      cellEndLocation: 0.8,
    });

    xRenderer.grid.template.setAll({
      visible: false,
    });

    xRenderer.labels.template.setAll({
      fill: am5.color(0x64748b),
      fontSize: 12,
      paddingTop: 8,
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "category",
        renderer: xRenderer,
      }),
    );

    const yRenderer = am5xy.AxisRendererY.new(root, {});
    yRenderer.labels.template.setAll({
      fill: am5.color(0x64748b),
      fontSize: 12,
      paddingRight: 8,
    });

    yRenderer.grid.template.setAll({
      stroke: am5.color(0xe2e8f0),
      strokeOpacity: showGrid ? 0.8 : 0,
      strokeDasharray: [3, 3],
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        extraMax: 0.1,
        renderer: yRenderer,
      }),
    );

    const createSeries = (
      name: string,
      valueField: "active" | "inactive",
      color: string,
      tooltipText: string,
    ) => {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name,
          xAxis,
          yAxis,
          valueYField: valueField,
          categoryXField: "category",
          stacked: true,
          tooltip: showTooltip
            ? am5.Tooltip.new(root, {
              getFillFromSprite: false,
              labelText: tooltipText,
            })
            : undefined,
        }),
      );

      series.columns.template.setAll({
        fill: am5.color(color),
        stroke: am5.color(color),
        fillOpacity: 0.9,
        strokeOpacity: 0,
        width: am5.percent(65),
      });
      series.columns.template.states.create("hover", {
        fillOpacity: 1,
      });

      if (showTooltip && series.get("tooltip")) {
        series.get("tooltip")!.get("background")!.setAll({
          fill: am5.color(0x172033),
          fillOpacity: 0.95,
          strokeOpacity: 0,
        });

        series.get("tooltip")!.label.setAll({
          fill: am5.color(0xffffff),
          fontSize: 12,
        });
      }
      series.data.setAll(data);
      return series;
    };

    const activeSeries = createSeries(
      "Active Users",
      "active",
      activeColor,
      "Active: {valueY}",
    );

    const inactiveSeries = createSeries(
      "Inactive Users",
      "inactive",
      inactiveColor,
      "Inactive: {valueY}",
    );

    xAxis.data.setAll(data);
    if (showLegend) {
      const legend = root.container.children.push(
        am5.Legend.new(root, {
          centerX: am5.percent(50),
          x: am5.percent(50),
          layout: root.horizontalLayout,
          marginTop: 10,
        }),
      );

      legend.labels.template.setAll({
        fill: am5.color(0x475569),
        fontSize: 12,
      });

      legend.valueLabels.template.setAll({
        fill: am5.color(0x64748b),
        fontSize: 12,
      });
      legend.data.setAll([activeSeries, inactiveSeries]);
    }

    chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none",
      }),
    );
    activeSeries.appear(800);
    inactiveSeries.appear(800);
    chart.appear(800, 100);
    return () => {
      root.dispose();
    };
  }, [
    data,
    title,
    activeColor,
    inactiveColor,
    backgroundColor,
    showGrid,
    showTooltip,
    showLegend,
  ]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height,
      }}
    />
  );
};

export default StackedBarChart;