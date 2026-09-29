import { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5radar from "@amcharts/amcharts5/radar";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  height?: number;
  color?: string;
  backgroundColor?: string;
  segments?: { value: number; color: string }[];
  showValue?: boolean;
  valueSuffix?: string;
  subtitle?: string;
}

const DEFAULT_SEGMENTS = [
  { value: 20, color: "#EF4444" },
  { value: 40, color: "#F59E0B" },
  { value: 60, color: "#FBBF24" },
  { value: 80, color: "#34D399" },
  { value: 100, color: "#10B981" },
];

const GaugeChart = ({
  value,
  min = 0,
  max = 100,
  title = "Active Users",
  height = 350,
  color = "#4F46E5",
  backgroundColor = "#FFFFFF",
  segments = DEFAULT_SEGMENTS,
  showValue = true,
  valueSuffix = "%",
  subtitle = "",
}: GaugeChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const safeValue = Math.min(Math.max(value, min), max);
  const displayValue = Math.round(safeValue);

  useLayoutEffect(() => {
    if (!chartRef.current) return;
    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    const chart = root.container.children.push(
      am5radar.RadarChart.new(root, {
        panX: false,
        panY: false,
        startAngle: 180,
        endAngle: 360,
        innerRadius: am5.percent(50),
  
        paddingTop: 30,
        paddingBottom: 30,
        paddingLeft: 20,
        paddingRight: 20,
      })
    );

    chart.set(
      "background",
      am5.Rectangle.new(root, {
        fill: am5.color(backgroundColor),
        fillOpacity: 1,
      })
    );

    if (title) {
      chart.children.unshift(
        am5.Label.new(root, {
          text: title,
          fontSize: 18,
          fontWeight: "600",
          fill: am5.color(0x172033),
          centerX: am5.percent(50),
          x: am5.percent(50),
          y: 0,
          paddingTop: 0,
          paddingBottom: 10,
        })
      );
    }

    const axisRenderer = am5radar.AxisRendererCircular.new(root, {
      innerRadius: -30,
      strokeOpacity: 1,
      strokeWidth: 15,
      strokeGradient: am5.LinearGradient.new(root, {
        rotation: 0,
        stops: [
          { color: am5.color(0x19d228) },
          { color: am5.color(0xf4fb16) },
          { color: am5.color(0xf6d32b) },
          { color: am5.color(0xfb7116) }
        ]
      })
    });

    axisRenderer.labels.template.setAll({
      fill: am5.color(0x64748b),
      fontSize: 12,
      radius: 25,
    });

    axisRenderer.grid.template.setAll({
      strokeOpacity: 0,
    });

    const axis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min,
        max,
        strictMinMax: true,
        renderer: axisRenderer,
        numberFormat: "#",
      })
    );

    let prevValue = min;
    const segmentColors = segments.length > 0 ? segments : DEFAULT_SEGMENTS;
    segmentColors.forEach((segment) => {
      const segmentValue = Math.min(segment.value, max);
      const dataItem = axis.makeDataItem({
        value: prevValue,
        endValue: segmentValue,
      });

      axis.createAxisRange(dataItem);
      const fill = dataItem.get("axisFill");
      if (fill) {
        fill.setAll({
          visible: true,
          fill: am5.color(segment.color),
          fillOpacity: 0.3,
          strokeOpacity: 0,
        });
      }

      const label = dataItem.get("label");
      if (label) {
        label.setAll({
          forceHidden: true,
        });
      }
      prevValue = segmentValue;
    });

    const activeDataItem = axis.makeDataItem({
      value: min,
      endValue: safeValue,
    });

    axis.createAxisRange(activeDataItem);
    const activeFill = activeDataItem.get("axisFill");
    if (activeFill) {
      activeFill.setAll({
        visible: true,
        fill: am5.color(color),
        fillOpacity: 0.2,
        strokeOpacity: 0,
      });
    }

    const hand = am5radar.ClockHand.new(root, {
      pinRadius: 12,
      radius: am5.percent(95),
      innerRadius: 0,
      bottomWidth: 12,
      topWidth: 3,
    });

    hand.hand.setAll({
      fill: am5.color(0x1e293b),
      stroke: am5.color(0x1e293b),
    });

    hand.pin.setAll({
      fill: am5.color(0x1e293b),
      stroke: am5.color(0x1e293b),
    });

    activeDataItem.set(
      "bullet",
      am5xy.AxisBullet.new(root, {
        sprite: hand,
      })
    );

    const labelValues = [50, 60, 70, 80, 90, 100];
    labelValues.forEach((val) => {
      if (val >= min && val <= max) {
        const labelDataItem = axis.makeDataItem({
          value: val,
        });
        axis.createAxisRange(labelDataItem);

        const label = labelDataItem.get("label");
        if (label) {
          label.setAll({
            text: `${val}%`,
            fill: am5.color(0x64748b),
            fontSize: 11,
            fontWeight: "500",
          });
        }
      }
    });

    activeDataItem.animate({
      key: "endValue",
      to: safeValue,
      duration: 1200,
      easing: am5.ease.out(am5.ease.cubic),
    });

    activeDataItem.animate({
      key: "value",
      to: safeValue,
      duration: 1200,
      easing: am5.ease.out(am5.ease.cubic),
    });

    chart.appear(800, 100);

    return () => {
      root.dispose();
    };
  }, [value, min, max, title, color, backgroundColor, segments, valueSuffix]);

  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: 12,
        overflow: "visible",
        background: backgroundColor,
        position: "relative",
      }}
    >
      <div
        ref={chartRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {(showValue || subtitle) && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "2%",
            transform: "translateX(-50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          {showValue && (
            <div
              style={{
                fontSize: 38,
                fontWeight: 700,
                color: "#172033",
                lineHeight: 1.1,
              }}
            >
              {displayValue}
              {valueSuffix}
            </div>
          )}
          {subtitle && (
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#94a3b8",
                marginTop: 2,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GaugeChart;