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
      show: true,
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
      y: {
        formatter: (val) => `${val}`, // raw count, no "%"
      },
    },
  };

  return <Chart options={options} series={series} type="bar" height={380} />;
};

export default ApexStackedBarChartCounts;
