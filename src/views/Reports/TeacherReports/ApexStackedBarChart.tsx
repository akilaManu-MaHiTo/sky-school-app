import React from "react";
import Chart from "react-apexcharts";

interface Props {
  series: ApexAxisChartSeries;
  categories: string[];
  isMobile?: boolean;
}

const ClassReportStackedBarChart: React.FC<Props> = ({
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

    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        dataLabels: {
          position: "center",
          total: {
            enabled: true,
            formatter: () => {
              return "100%";
            },
            style: {
              fontSize: "12px",
              fontWeight: 600,
              color: "#fff",
            },
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

    // ✅ Show subject name + percentage on desktop, only percentage on mobile
    dataLabels: {
      enabled: true,
      formatter: (val, opts) => {
        if (val == null) return "";
        const num = Number(val);
        if (Number.isNaN(num)) return "";

        // On mobile, only show the percentage
        if (isMobile) {
          return `${Math.round(num)}%`;
        }

        const o: any = opts || {};
        const w = o.w || {};
        const seriesIndex = o.seriesIndex ?? 0;

        const rawSubject: string =
          w.config?.series?.[seriesIndex]?.name ?? "";

        const words = rawSubject.split(" ").filter(Boolean);
        let shortSubject = rawSubject;

        // If subject has more words, show first two + ...
        if (words.length > 2) {
          shortSubject = `${words.slice(0, 2).join(" ")} ...`;
        }

        return `${shortSubject} ${Math.round(num)}%`;
      },
    },

    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => `${val}%`,
      },
    },
  };

  return <Chart options={options} series={series} type="bar" height={380} />;
};

export default ClassReportStackedBarChart;
