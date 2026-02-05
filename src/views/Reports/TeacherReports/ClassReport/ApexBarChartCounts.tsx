import React from "react";
import ReactApexChart from "react-apexcharts";
import { Box, CircularProgress } from "@mui/material";
import { ApexOptions } from "apexcharts";

interface ApexBarChartCountsProps {
  categories: string[];
  series: ApexAxisChartSeries;
  height?: number;
  loading?: boolean;
  barColors?: string[];
}

const ApexBarChartCounts: React.FC<ApexBarChartCountsProps> = ({
  categories,
  series,
  height = 350,
  loading = false,
  barColors,
}) => {
  const options: ApexOptions = {
    chart: {
      type: "bar",
      height,
      toolbar: { show: false },
    },

    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "50%",
        distributed: !!(barColors && barColors.length),
        dataLabels: {
          position: "top",
        },
      },
    },

    colors: barColors && barColors.length ? barColors : undefined,

    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`,
      offsetY: -18,
      style: {
        fontSize: "12px",
        fontWeight: 600,
        colors: ["#444"],
      },
    },

    xaxis: {
      categories,
      labels: {
        rotate: -20,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },

    yaxis: {
      labels: {
        formatter: (val: number) => `${val}`,
      },
    },

    tooltip: {
      y: {
        formatter: (val: number) => `${val}`,
      },
    },

    grid: {
      strokeDashArray: 4,
    },
  };

  if (loading) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!series || series.length === 0) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        No data available
      </Box>
    );
  }

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="bar"
      height={height}
    />
  );
};

export default ApexBarChartCounts;
