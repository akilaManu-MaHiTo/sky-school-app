import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import theme from "../../../../theme";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";
import {
  examReportTerms,
  markGrades,
} from "../../../../api/StudentMarks/studentMarksApi";
import { Controller, useForm } from "react-hook-form";
import { getYearsData } from "../../../../api/OrganizationSettings/organizationSettingsApi";
import {
  getGradesData,
  gradeReportBarChart,
  gradeReportMarkBarChart,
} from "../../../../api/OrganizationSettings/academicGradeApi";
import useIsMobile from "../../../../customHooks/useIsMobile";
import useCurrentOrganization from "../../../../hooks/useCurrentOrganization";
import ApexStackedBarChart from "./ApexStackedBarChart";
import ApexStackedBarChartCounts from "./ApexStackedBarChartCounts";
import { ResponsiveContainer } from "recharts";

const breadcrumbItems = [
  { title: "Home", href: "/home" },
  { title: "Reports" },
  { title: "Management Staff Reports" },
  { title: "Marks Entry Monitoring" },
];

export default function GradeReport() {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm();
  const year = watch("year");
  const selectedTerm = watch("examTerm");
  const selectedGrade = watch("grade");
  const selectedMarksGrade = watch("marksGrades");
  const { organization } = useCurrentOrganization();
  const organizationName = organization?.organizationName;

  const { data: yearData, isFetching: isYearDataFetching } = useQuery({
    queryKey: ["academic-years"],
    queryFn: getYearsData,
  });
  const { data: gradeData, isFetching: isGradeDataFetching } = useQuery({
    queryKey: ["academic-grades"],
    queryFn: getGradesData,
  });

  const { data: gradeReportData, isFetching: isGradeReportDataFetching } =
    useQuery({
      queryKey: [
        "academic-grades-report",
        year,
        selectedGrade?.id,
        selectedTerm,
      ],
      queryFn: () => gradeReportBarChart(year, selectedGrade, selectedTerm),
      enabled: !!year && !!selectedGrade && !!selectedTerm,
    });
  const {
    data: gradeMarkReportData,
    isFetching: isGradeMarkReportDataFetching,
  } = useQuery({
    queryKey: [
      "academic-grades-report-mark",
      year,
      selectedGrade?.id,
      selectedTerm,
      selectedMarksGrade,
    ],
    queryFn: () =>
      gradeReportMarkBarChart(
        year,
        selectedGrade,
        selectedTerm,
        selectedMarksGrade
      ),
    enabled:
      !!year && !!selectedGrade && !!selectedTerm && !!selectedMarksGrade,
  });
  const { isMobile, isTablet } = useIsMobile();

  // Transform API data into Apex stacked bar series
  const chartConfig = useMemo(() => {
    if (!gradeReportData || !Array.isArray(gradeReportData)) {
      return { series: [], categories: [] as string[] };
    }

    const classes: string[] = gradeReportData.map(
      (item: any) => item.className
    );

    const subjectMap = new Map<
      number,
      {
        subjectId: number;
        subjectName: string;
        colorCode: string;
        values: number[];
      }
    >();

    gradeReportData.forEach((classItem: any, classIndex: number) => {
      const subjects = classItem.subjects || [];
      subjects.forEach((subj: any) => {
        const existing = subjectMap.get(subj.subjectId);
        if (!existing) {
          const values = new Array(classes.length).fill(0);
          values[classIndex] = subj.averageMark ?? 0;
          subjectMap.set(subj.subjectId, {
            subjectId: subj.subjectId,
            subjectName: subj.subjectName,
            colorCode: subj.colorCode,
            values,
          });
        } else {
          existing.values[classIndex] = subj.averageMark ?? 0;
        }
      });
    });

    const series: ApexAxisChartSeries = Array.from(subjectMap.values()).map(
      (subj) =>
        ({
          name: subj.subjectName,
          data: subj.values,
          // ApexStackedBarChart reads `color` from series to use subject colorCode
          color: subj.colorCode,
        } as any)
    );

    return { series, categories: classes };
  }, [gradeReportData]);

  // Transform gradeMarkReportData into stacked bar series using counts
  const markChartConfig = useMemo(() => {
    if (!gradeMarkReportData || !Array.isArray(gradeMarkReportData)) {
      return { series: [], categories: [] as string[] };
    }

    const classes: string[] = gradeMarkReportData.map(
      (item: any) => item.className
    );

    const subjectMap = new Map<
      number,
      {
        subjectId: number;
        subjectName: string;
        colorCode: string;
        values: number[];
      }
    >();

    gradeMarkReportData.forEach((classItem: any, classIndex: number) => {
      const subjects = classItem.subjects || [];
      subjects.forEach((subj: any) => {
        const existing = subjectMap.get(subj.subjectId);
        if (!existing) {
          const values = new Array(classes.length).fill(0);
          values[classIndex] = subj.count ?? 0;
          subjectMap.set(subj.subjectId, {
            subjectId: subj.subjectId,
            subjectName: subj.subjectName,
            colorCode: subj.colorCode,
            values,
          });
        } else {
          existing.values[classIndex] = subj.count ?? 0;
        }
      });
    });

    const series: ApexAxisChartSeries = Array.from(subjectMap.values()).map(
      (subj) =>
        ({
          name: subj.subjectName,
          data: subj.values,
          color: subj.colorCode,
        } as any)
    );

    return { series, categories: classes };
  }, [gradeMarkReportData]);

  const tableConfig = useMemo(() => {
    if (!gradeReportData || !Array.isArray(gradeReportData)) {
      return { subjectNames: [] as string[], rows: [] as any[] };
    }

    const subjectNameSet = new Set<string>();

    gradeReportData.forEach((classItem: any) => {
      const subjects = classItem.subjects || [];
      subjects.forEach((subj: any) => {
        if (subj?.subjectName) {
          subjectNameSet.add(subj.subjectName as string);
        }
      });
    });

    const subjectNames = Array.from(subjectNameSet);

    const rows = gradeReportData.map((classItem: any) => {
      const row: any = { className: classItem.className };
      const subjects = classItem.subjects || [];

      subjectNames.forEach((name) => {
        const subj = subjects.find((s: any) => s.subjectName === name);
        const value = subj?.averageMark ?? 0;
        row[name] = typeof value === "number" ? value : 0;
      });

      return row;
    });

    return { subjectNames, rows };
  }, [gradeReportData]);

  return (
    <Stack>
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          marginY: 2,
          borderRadius: 1,
          overflowX: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <PageTitle title="Marks Entry Monitoring" />
        <Breadcrumb breadcrumbs={breadcrumbItems} />
      </Box>
      <Accordion expanded={true}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{
            borderBottom: "1px solid var(--pallet-lighter-grey)",
          }}
        >
          <Typography variant="subtitle2">Marks Entry Filters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack
            sx={{
              display: "flex",
              flexDirection: "column",
              marginTop: "0.5rem",
              gap: 2,
            }}
          >
            <Stack
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                flexWrap: "wrap",
                flexDirection: isMobile || isTablet ? "column" : "row",
              }}
            >
              <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
                <Controller
                  name="year"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      value={field.value ?? null}
                      onChange={(e, newVal) => {
                        field.onChange(newVal);
                      }}
                      size="small"
                      options={yearData ?? []}
                      getOptionLabel={(option) => option.year}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.teacherYear}
                          helperText={errors.teacherYear && "Required"}
                          label="Select Year"
                          name="year"
                        />
                      )}
                    />
                  )}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
                <Controller
                  name="grade"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      value={field.value ?? null}
                      onChange={(e, newVal) => {
                        field.onChange(newVal);
                      }}
                      size="small"
                      options={gradeData ?? []}
                      getOptionLabel={(option) => `Grade ` + option.grade}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.teacherYear}
                          helperText={errors.teacherYear && "Required"}
                          label="Select Grade"
                          name="grade"
                        />
                      )}
                    />
                  )}
                />
              </Box>

              <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
                <Controller
                  name="examTerm"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      value={field.value ?? null}
                      onChange={(e, newVal) => {
                        field.onChange(newVal);
                        setValue("monthlyExam", null, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      size="small"
                      options={
                        examReportTerms?.filter((item) => item != null) ?? []
                      }
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.examTerm}
                          helperText={errors.examTerm && "Required"}
                          label="Select Exam"
                          name="examTerm"
                        />
                      )}
                    />
                  )}
                />
              </Box>
            </Stack>
          </Stack>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "0.5rem",
              marginX: "0.5rem",
            }}
          >
            <Button
              onClick={() => {
                reset();
              }}
              sx={{ color: "var(--pallet-blue)", marginRight: "0.5rem" }}
            >
              Reset
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      

      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: "1rem",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "auto",
            marginTop: "1rem",
            flex: 1,
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            padding: "1rem",
            borderRadius: "0.3rem",
            border: "1px solid var(--pallet-border-blue)",
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              mb: "3.5rem",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
              }}
            >
              Class-wise Subject Percentages
            </Typography>
          </Box>
          <ResponsiveContainer width="100%" height={500}>
            <ApexStackedBarChart
              series={chartConfig.series}
              categories={chartConfig.categories}
              isMobile={isMobile}
            />
          </ResponsiveContainer>
        </Box>
        <Box
          sx={{
            width: "100%",
            height: "auto",
            marginTop: "1rem",
            flex: 1,
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            padding: "1rem",
            borderRadius: "0.3rem",
            border: "1px solid var(--pallet-border-blue)",
            backgroundColor: "#fff",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
              }}
            >
              {"Class-Wise Grades Counts"}
            </Typography>
            <Controller
              name="marksGrades"
              control={control}
              defaultValue={"A"}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  value={field.value ?? null}
                  onChange={(e, newVal) => {
                    field.onChange(newVal);
                  }}
                  size="small"
                  options={markGrades?.filter((item) => item != null) ?? []}
                  sx={{ flex: 1, margin: "0.5rem" }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={!!errors.examTerm}
                      helperText={errors.examTerm && "Required"}
                      label="Marks Grade"
                      name="marksGrades"
                    />
                  )}
                />
              )}
            />
          </Box>
          <ResponsiveContainer width="100%" height={500}>
            <ApexStackedBarChartCounts
              series={markChartConfig.series}
              categories={markChartConfig.categories}
              isMobile={isMobile}
            />
          </ResponsiveContainer>
        </Box>
        
      </Box>
      {tableConfig.rows.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Class Name</TableCell>
                {tableConfig.subjectNames.map((name) => (
                  <TableCell key={name} align="right">
                    {name}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableConfig.rows.map((row: any) => (
                <TableRow key={row.className} hover>
                  <TableCell component="th" scope="row">
                    {row.className}
                  </TableCell>
                  {tableConfig.subjectNames.map((name) => {
                    const value = row[name] as number | undefined;
                    return (
                      <TableCell key={name} align="right">
                        {typeof value === "number"
                          ? `${value.toFixed(1)}%`
                          : "-"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
