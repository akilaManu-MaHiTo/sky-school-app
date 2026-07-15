import React from "react";
import Chart from "react-apexcharts";

interface Props {
  series: ApexAxisChartSeries;
  categories: string[];
  isMobile?: boolean;
}

const STACKED_BAR_COLORS: string[] = [
  "#E06B6B",
  "#3F95C8",
  "#E0C95E",
  "#45B8AF",
  "#E68F5C",
  "#9E7DB8",
  "#5AB0E0",
  "#A9C65C",
  "#E8A96A",
  "#63C48F",
  "#7FBF6A",
  "#6FA8DC",
];

const ApexStackedBarChartCounts: React.FC<Props> = ({
  series,
  categories,
  isMobile,
}) => {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },

    colors:
      (series as any[])?.map(
        (s, index) => s.color || STACKED_BAR_COLORS[index % STACKED_BAR_COLORS.length]
      ) || STACKED_BAR_COLORS,

    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        dataLabels: {
          position: "center",
          total: {
            // For counts we don't show a fixed "100%" total
            enabled: false,
          },
        },
      },
    },

    yaxis: {
      show: false,
    },

    xaxis: {
      categories,
      labels: {
        rotate: -45,
      },
    },

    legend: {
      position: "bottom",
    },

    dataLabels: {
      enabled: true,
      formatter: (val, opts) => {
        if (val == null) return "";
        const num = Number(val);
        if (Number.isNaN(num)) return "";

        if (isMobile) {
          return `${Math.round(num)}`; // show count only, no "%"
        }

        const o: any = opts || {};
        const w = o.w || {};
        const seriesIndex = o.seriesIndex ?? 0;

        const rawSubject: string = w.config?.series?.[seriesIndex]?.name ?? "";

        const words = rawSubject.split(" ").filter(Boolean);
        let shortSubject = rawSubject;

        if (words.length > 2) {
          shortSubject = `${words.slice(0, 2).join(" ")} ...`;
        }

        // Subject name + count (no "%")
        return `${shortSubject} ${Math.round(num)}`;
      },
    },

    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ series, dataPointIndex, w }) => {
        const rows = series
          .map((serieValues, seriesIndex) => {
            const rawValue = serieValues?.[dataPointIndex];
            const value = Number(rawValue);

            if (rawValue == null || Number.isNaN(value) || value === 0) {
              return "";
            }

            const seriesName = w.config?.series?.[seriesIndex]?.name ?? "";

            return `
              <div class="apexcharts-tooltip-series-group apexcharts-active" style="display:flex;">
                <span class="apexcharts-tooltip-marker" style="background-color:${w.globals.colors[seriesIndex]};"></span>
                <div class="apexcharts-tooltip-text">
                  <div class="apexcharts-tooltip-y-group">
                    <span class="apexcharts-tooltip-text-y-label">${seriesName}: </span>
                    <span class="apexcharts-tooltip-text-y-value">${Math.round(value)}</span>
                  </div>
                </div>
              </div>
            `;
          })
          .filter(Boolean)
          .join("");

        return `<div class="apexcharts-tooltip-title"></div>${rows}`;
      },
    },
  };

  return <Chart options={options} series={series} type="bar" height={480} />;
};

export default ApexStackedBarChartCounts;
