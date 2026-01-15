import React from "react";
import { Paper, Typography } from "@mui/material";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface SubjectLineChartProps {
  subjectName: string;
  categories: string[];
  data: number[];
  color?: string;
}

const SubjectLineChart: React.FC<SubjectLineChartProps> = ({
  subjectName,
  categories,
  data,
  color,
}) => {
  const options: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    markers: {
      size: 4,
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`,
    },
    colors: color ? [color] : undefined,
    xaxis: {
      categories,
      labels: {
        rotate: -45,
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      title: {
        text: "Marks",
      },
    },
    grid: {
      strokeDashArray: 4,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  const series = [
    {
      name: subjectName,
      data,
    },
  ];

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {subjectName}
      </Typography>
      <Chart options={options} series={series} type="line" height={300} />
    </Paper>
  );
};

export default SubjectLineChart;
