import React from "react";
import ReactApexChart from "react-apexcharts";
import { Box, CircularProgress } from "@mui/material";
import { ApexOptions } from "apexcharts";

interface ApexBarChartProps {
  categories: string[];
  series: ApexAxisChartSeries;
  height?: number;
  loading?: boolean;
}

const ApexBarChart: React.FC<ApexBarChartProps> = ({
  categories,
  series,
  height = 350,
  loading = false,
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
        dataLabels: {
          position: "top", // 🔑 forces label above bar
        },
      },
    },

    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      offsetY: -22, // 🔑 push label above the column
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
      max: 100,
      labels: {
        formatter: (val: number) => `${val}%`,
      },
    },

    tooltip: {
      y: {
        formatter: (val: number) => `${val}%`,
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

export default ApexBarChart;
