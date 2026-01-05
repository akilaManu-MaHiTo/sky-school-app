import React from "react";
import Chart from "react-apexcharts";
import { Box } from "@mui/material";

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
];

const ApexStackedBarChartMarkGrades: React.FC<Props> = ({
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
    colors: STACKED_BAR_COLORS,
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
      },
    },
    xaxis: {
      categories,
      labels: { rotate: -45 },
    },
    legend: { position: "bottom" },
    dataLabels: {
      enabled: true,
      formatter: (val) => {
        if (val == null) return "";
        const n = Number(val);
        if (Number.isNaN(n)) return "";
        if (isMobile) return `${Math.round(n)}`;
        return `${Math.round(n)}`;
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val) => `${val}` },
    },
  };
  const hasSeriesData =
    Array.isArray(series) &&
    series.length > 0 &&
    series.some((s) =>
      Array.isArray((s as any).data) &&
      (s as any).data.some((v: number) => Number(v) !== 0)
    );

  if (!hasSeriesData) {
    return (
      <Box
        height={380}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        No data available
      </Box>
    );
  }

  return <Chart options={options} series={series} type="bar" height={380}  />;
};

export default ApexStackedBarChartMarkGrades;
