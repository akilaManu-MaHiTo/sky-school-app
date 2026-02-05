import React from "react";
import { Paper, Typography } from "@mui/material";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface SubjectLineChartProps {
  subjectName: string;
  categories: string[];
  data: (number | string | null)[];
  color?: string;
}

const SubjectLineChart: React.FC<SubjectLineChartProps> = ({
  subjectName,
  categories,
  data,
  color,
}) => {
  const sanitizedData = data.map((value) => {
    if (typeof value === "number" && !Number.isNaN(value)) return value;

    if (typeof value === "string") {
      const parsed = parseFloat(value);
      if (!Number.isNaN(parsed)) return parsed;
      return 0;
    }

    return 0;
  });

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
      formatter: (val: number, opts?: any) => {
        const index = opts?.dataPointIndex as number | undefined;
        const raw = typeof index === "number" ? data[index] : undefined;

        if (typeof raw === "string" && Number.isNaN(Number(raw))) {
          return raw; // e.g. "Ab"
        }

        return `${val}`;
      },
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
        formatter: (val: number, opts?: any) => {
          const index = opts?.dataPointIndex as number | undefined;
          const raw = typeof index === "number" ? data[index] : undefined;

          if (typeof raw === "string" && Number.isNaN(Number(raw))) {
            return raw; // e.g. "Ab"
          }

          return `${val}`;
        },
      },
    },
  };

  const series = [
    {
      name: subjectName,
      data: sanitizedData,
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
