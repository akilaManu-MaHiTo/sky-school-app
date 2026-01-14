import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
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
import theme from "../../../theme";
import PageTitle from "../../../components/PageTitle";
import Breadcrumb from "../../../components/BreadCrumb";
import { Controller, useForm } from "react-hook-form";
import useIsMobile from "../../../customHooks/useIsMobile";
import DateRangePicker from "../../../components/DateRangePicker";
import CustomButton from "../../../components/CustomButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardCard from "../../../components/DashboardCard";
import {
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import React, { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { dateFormatter } from "../../../util/dateFormat.util";
import CustomPieChart from "../../../components/CustomPieChart";

import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import MoodOutlinedIcon from "@mui/icons-material/MoodOutlined";
import SentimentVerySatisfiedOutlinedIcon from "@mui/icons-material/SentimentVerySatisfiedOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import {
  examReportTerms,
  examTerms,
  getAllClassReportAllBarChart,
  getAllClassReportAllBarChartMarkGrade,
  getAllClassReportAllMarkGradesTable,
  getAllClassReportCard,
  getClassReportBarChart,
  getClassReportBarChartByGrades,
  getClassReportCard,
  getClassReportMarkGradesTable,
  markGrades,
  months,
} from "../../../api/StudentMarks/studentMarksApi";
import { getYearsData } from "../../../api/OrganizationSettings/organizationSettingsApi";
import {
  getClassesData,
  getGradesData,
} from "../../../api/OrganizationSettings/academicGradeApi";
import ApexBarChart from "./ApexBarChart";
import ApexBarChartCounts from "./ApexBarChartCounts";
import ApexStackedBarChart from "./ApexStackedBarChart";
import ApexStackedBarChartMarkGrades from "./ApexStackedBarChartMarkGrades";
import ClassReportTable from "./ClassReportTable";
import AllClassReportTable from "./AllClassReportTable";

const breadcrumbItems = [
  { title: "Home", href: "/home" },
  { title: "Reports" },
  { title: "Teacher Reports" },
  { title: "Class Report" },
];

function RagDashboard() {
  const { isMobile, isTablet,isSmallMonitor } = useIsMobile();
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
  const selectedClass = watch("class");
  const selectedMonthlyExam = watch("monthlyExam");
  const selectedMarksGrade = watch("marksGrades");

  const disableFetch = selectedTerm === "All";

  const { data: yearData, isFetching: isYearDataFetching } = useQuery({
    queryKey: ["academic-years"],
    queryFn: getYearsData,
  });
  const { data: gradeData, isFetching: isGradeDataFetching } = useQuery({
    queryKey: ["academic-grades"],
    queryFn: getGradesData,
  });
  const { data: classData, isFetching: isClassDataFetching } = useQuery({
    queryKey: ["academic-classes"],
    queryFn: getClassesData,
  });

  const {
    data: classReportBarChartData,
    refetch: refetchClassReportBarChart,
    isFetching: isClassReportBarChartFetching,
  } = useQuery({
    queryKey: [
      "class-report-bar-chart",
      year,
      selectedGrade,
      selectedClass,
      selectedTerm,
      selectedMonthlyExam,
    ],
    queryFn: () =>
      getClassReportBarChart(
        year,
        selectedGrade,
        selectedClass,
        selectedTerm,
        selectedMonthlyExam
      ),
    enabled:
      !!selectedGrade &&
      !!selectedClass &&
      !!year &&
      !!selectedTerm &&
      (selectedTerm !== "Monthly Exam" || !!selectedMonthlyExam) &&
      !disableFetch,
  });
  const {
    data: classReportBarChartMarkGradeData,
    refetch: refetchClassReportBarChartMarkGrade,
    isFetching: isClassReportBarChartMarkGradeFetching,
  } = useQuery({
    queryKey: [
      "class-report-bar-chart-mark-grade",
      year,
      selectedGrade,
      selectedClass,
      selectedTerm,
      selectedMonthlyExam,
      selectedMarksGrade,
    ],
    queryFn: () =>
      getClassReportBarChartByGrades(
        year,
        selectedGrade,
        selectedClass,
        selectedTerm,
        selectedMonthlyExam,
        selectedMarksGrade
      ),
    enabled:
      !!selectedGrade &&
      !!selectedClass &&
      !!year &&
      !!selectedTerm &&
      (selectedTerm !== "Monthly Exam" || !!selectedMonthlyExam) &&
      !disableFetch,
  });
  const {
    data: classAllReportBarChartData,
    refetch: refetchClassAllReportBarChart,
    isFetching: isClassAllReportBarChartFetching,
  } = useQuery({
    queryKey: [
      "class-report-all-bar-chart",
      year,
      selectedGrade,
      selectedClass,
    ],
    queryFn: () =>
      getAllClassReportAllBarChart(year, selectedGrade, selectedClass),
    enabled:
      !!selectedGrade &&
      !!selectedClass &&
      !!year &&
      !!selectedTerm &&
      (selectedTerm !== "Monthly Exam" || !!selectedMonthlyExam) &&
      disableFetch,
  });
  const {
    data: classAllReportBarChartDataMarkGrades,
    refetch: refetchClassAllReportBarChartMarkGrades,
    isFetching: isClassAllReportBarChartFetchingMarkGrades,
  } = useQuery({
    queryKey: [
      "class-report-all-bar-chart-mark-grades",
      year,
      selectedGrade,
      selectedClass,
      selectedMarksGrade,
    ],
    queryFn: () =>
      getAllClassReportAllBarChartMarkGrade(
        year,
        selectedGrade,
        selectedClass,
        selectedMarksGrade
      ),
    enabled:
      !!selectedGrade &&
      !!selectedClass &&
      !!year &&
      !!selectedTerm &&
      (selectedTerm !== "Monthly Exam" || !!selectedMonthlyExam) &&
      disableFetch,
  });
  const {
    data: classReportCardData,
    refetch: refetchClassReportCardData,
    isFetching: isClassReportCardFetching,
  } = useQuery({
    queryKey: [
      "class-report-card",
      year,
      selectedGrade,
      selectedClass,
      selectedTerm,
      selectedMonthlyExam,
    ],
    queryFn: () =>
      getClassReportCard(
        year,
        selectedGrade,
        selectedClass,
        selectedTerm,
        selectedMonthlyExam
      ),
    enabled:
      !!selectedGrade &&
      !!selectedClass &&
      !!year &&
      !!selectedTerm &&
      (selectedTerm !== "Monthly Exam" || !!selectedMonthlyExam) &&
      !disableFetch,
  });
  const {
    data: classAllReportCardData,
    refetch: refetchClassAllReportCardData,
    isFetching: isClassAllReportCardFetching,
  } = useQuery({
    queryKey: ["class-report-all-card", year, selectedGrade, selectedClass],
    queryFn: () => getAllClassReportCard(year, selectedGrade, selectedClass),
    enabled:
      !!selectedGrade &&
      !!selectedClass &&
      !!year &&
      !!selectedTerm &&
      (selectedTerm !== "Monthly Exam" || !!selectedMonthlyExam) &&
      disableFetch,
  });

  const {
    data: classMarkGradesTableData,
    isFetching: isClassMarkGradesTableFetching,
  } = useQuery({
    queryKey: [
      "class-report-mark-grades-table",
      year,
      selectedGrade,
      selectedClass,
      selectedTerm,
      selectedMonthlyExam,
    ],
    queryFn: () =>
      getClassReportMarkGradesTable(
        year,
        selectedGrade,
        selectedClass,
        selectedTerm,
        selectedMonthlyExam
      ),
    enabled:
      !!selectedGrade &&
      !!selectedClass &&
      !!year &&
      !!selectedTerm &&
      (selectedTerm !== "Monthly Exam" || !!selectedMonthlyExam) &&
      !disableFetch,
  });

  const {
    data: classAllMarkGradesTableData,
    isFetching: isClassAllMarkGradesTableFetching,
  } = useQuery({
    queryKey: [
      "class-report-all-mark-grades-table",
      year,
      selectedGrade,
      selectedClass,
    ],
    queryFn: () =>
      getAllClassReportAllMarkGradesTable(year, selectedGrade, selectedClass),
    enabled:
      !!selectedGrade &&
      !!selectedClass &&
      !!year &&
      !!selectedTerm &&
      (selectedTerm !== "Monthly Exam" || !!selectedMonthlyExam) &&
      disableFetch,
  });

  const isMonthlyExam = selectedTerm === "Monthly Exam";

  // Single-term bar chart: X = subjects, Y = average %
  const barChartReportData = useMemo(() => {
    const source: any = classReportBarChartData;
    const raw: any[] = Array.isArray(source)
      ? source
      : Array.isArray(source?.data)
      ? source.data
      : [];

    if (!raw || raw.length === 0) {
      return { categories: [], series: [], colors: [] };
    }

    const categories = raw.map((item: any) => item.subjectName ?? "");
    const data = raw.map((item: any) => {
      const avg = typeof item?.average === "number" ? item.average : 0;
      return Number(avg.toFixed(2));
    });

     const colors = raw.map(
       (item: any) => item.subjectColorCode ?? "#008FFB"
     );

    return {
      categories,
      colors,
      series: [
        {
          name: "Average %",
          data,
        },
      ],
    };
  }, [classReportBarChartData]);

  // All-terms stacked bar: X = terms (Term 1, Term 2, ...), stack = subjects (average %)
  const allTermsStackedBarData = useMemo(() => {
    const container: any = classAllReportBarChartData?.data ?? classAllReportBarChartData ?? {};
    const terms = Object.keys(container || {});

    if (terms.length === 0) {
      return { categories: [], series: [], colors: [] };
    }

    const subjectSet = new Set<string>();
    const subjectColorMap = new Map<string, string>();
    terms.forEach((termKey) => {
      const termRaw = container[termKey];
      const termArr: any[] = Array.isArray(termRaw)
        ? termRaw
        : Array.isArray(Object.values(termRaw || {}))
        ? Object.values(termRaw || {})
        : [];

      termArr.forEach((item: any) => {
        if (item?.subjectName) {
          subjectSet.add(item.subjectName);
          if (
            item.subjectColorCode &&
            !subjectColorMap.has(item.subjectName)
          ) {
            subjectColorMap.set(item.subjectName, item.subjectColorCode);
          }
        }
      });
    });

    const subjects = Array.from(subjectSet);

    const series = subjects.map((subject) => ({
      name: subject,
      color: subjectColorMap.get(subject) ?? "#008FFB",
      data: terms.map((termKey) => {
        const termRaw = container[termKey];
        const termArr: any[] = Array.isArray(termRaw)
          ? termRaw
          : Array.isArray(Object.values(termRaw || {}))
          ? Object.values(termRaw || {})
          : [];
        const found = termArr.find((item: any) => item.subjectName === subject);
        const avg = typeof found?.average === "number" ? found.average : 0;
        return Number(avg.toFixed(2));
      }),
    }));

    const colors = subjects.map(
      (subject) => subjectColorMap.get(subject) ?? "#008FFB"
    );

    return {
      categories: terms,
      series,
      colors,
    };
  }, [classAllReportBarChartData]);

  // All-terms stacked bar for mark grades: X = terms, stack = subjects (student counts)
  const allTermsStackedBarDataMarkGrades = useMemo(() => {
    const container: any =
      (classAllReportBarChartDataMarkGrades as any)?.data ??
      classAllReportBarChartDataMarkGrades ??
      {};

    const terms = Object.keys(container || {});
    if (terms.length === 0) {
      return { categories: [], series: [], colors: [] };
    }

    const subjectSet = new Set<string>();
    const subjectColorMap = new Map<string, string>();
    terms.forEach((termKey) => {
      const termRaw = container[termKey];
      const termArr: any[] = Array.isArray(termRaw)
        ? termRaw
        : Array.isArray(Object.values(termRaw || {}))
        ? Object.values(termRaw || {})
        : [];

      termArr.forEach((item: any) => {
        if (item?.subjectName) {
          subjectSet.add(item.subjectName);
          if (
            item.subjectColorCode &&
            !subjectColorMap.has(item.subjectName)
          ) {
            subjectColorMap.set(item.subjectName, item.subjectColorCode);
          }
        }
      });
    });

    const subjects = Array.from(subjectSet);

    const series = subjects.map((subject) => ({
      name: subject,
      color: subjectColorMap.get(subject) ?? "#008FFB",
      data: terms.map((termKey) => {
        const termRaw = container[termKey];
        const termArr: any[] = Array.isArray(termRaw)
          ? termRaw
          : Array.isArray(Object.values(termRaw || {}))
          ? Object.values(termRaw || {})
          : [];
        const found = termArr.find((item: any) => item.subjectName === subject);
        const count = typeof found?.count === "number" ? found.count : 0;
        return Number(count);
      }),
    }));

    const colors = subjects.map(
      (subject) => subjectColorMap.get(subject) ?? "#008FFB"
    );

    return {
      categories: terms,
      series,
      colors,
    };
  }, [classAllReportBarChartDataMarkGrades]);

  const singleTermMarkGradesRows = useMemo(() => {
    const source: any = classMarkGradesTableData;
    const raw: any[] = Array.isArray(source)
      ? source
      : Array.isArray(source?.data)
      ? source.data
      : [];

    return raw || [];
  }, [classMarkGradesTableData]);

  const markGradesTableGradeColumns = useMemo(() => {
    if (!disableFetch) {
      const sample =
        (singleTermMarkGradesRows && singleTermMarkGradesRows.length > 0
          ? singleTermMarkGradesRows[0]
          : {}) as any;
      return Object.keys(sample).filter((key) =>
        ["subjectId", "subjectName", "term"].includes(key) ? false : true
      );
    }

    const container: any =
      (classAllMarkGradesTableData as any)?.data ??
      classAllMarkGradesTableData ??
      {};

    const terms = Object.keys(container || {});
    let sample: any = {};

    for (const termKey of terms) {
      const termRaw = container[termKey];
      const termArr: any[] = Array.isArray(termRaw)
        ? termRaw
        : Array.isArray(Object.values(termRaw || {}))
        ? Object.values(termRaw || {})
        : [];
      if (termArr.length > 0) {
        sample = termArr[0];
        break;
      }
    }

    return Object.keys(sample).filter(
      (key) => !["subjectId", "subjectName", "term"].includes(key)
    );
  }, [
    disableFetch,
    singleTermMarkGradesRows,
    classAllMarkGradesTableData,
  ]);

  const classReportTitle = useMemo(() => {
    if (!selectedTerm) return "Class Overall Report";
    if (selectedTerm === "Monthly Exam" && selectedMonthlyExam) {
      return `Class Overall Report - ${selectedMonthlyExam}`;
    }
    return `Grade ${selectedGrade?.grade} ${selectedClass?.className} Class Overall Report - ${selectedTerm}`;
  }, [selectedTerm, selectedMonthlyExam]);

  // Single-term bar chart for mark grades: X = subjects, Y = count
  const subjectCountsChart = useMemo(() => {
    const source: any = classReportBarChartMarkGradeData;
    const raw: any[] = Array.isArray(source)
      ? source
      : Array.isArray(source?.data)
      ? source.data
      : [];

    if (!raw || raw.length === 0) {
      return { categories: [], series: [], colors: [] };
    }

    const categories = raw.map((item: any) => item.subjectName ?? "");
    const data = raw.map((item: any) => {
      const count = typeof item?.count === "number" ? item.count : 0;
      return Number(count);
    });

    const colors = raw.map(
      (item: any) => item.subjectColorCode ?? "#008FFB"
    );

    return {
      categories,
      colors,
      series: [
        {
          name: "Students Count",
          data,
        },
      ],
    };
  }, [classReportBarChartMarkGradeData]);

  const showGroupColumns = useMemo(() => {
    const gradeValue = selectedGrade?.grade;
    return (
      gradeValue === 10 ||
      gradeValue === 11 ||
      gradeValue === "10" ||
      gradeValue === "11"
    );
  }, [selectedGrade]);

  console.log("hi",selectedGrade);

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
        <PageTitle title="Class Report" />
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
          <Typography variant="subtitle2">Dashboard Filters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              marginTop: "0.5rem",
              flexDirection: isMobile || isTablet ? "column" : "row",
            }}
          >
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
                  sx={{ flex: 1, margin: "0.5rem" }}
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
                  sx={{ flex: 1, margin: "0.5rem" }}
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
            <Controller
              name="class"
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
                  options={classData ?? []}
                  getOptionLabel={(option) => option.className}
                  sx={{ flex: 1, margin: "0.5rem" }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={!!errors.teacherYear}
                      helperText={errors.teacherYear && "Required"}
                      label="Select Class"
                      name="class"
                    />
                  )}
                />
              )}
            />

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
                  sx={{ flex: 1, margin: "0.5rem" }}
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

            {isMonthlyExam && (
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
                  // minWidth: "250px",
                }}
              >
                <Controller
                  name="monthlyExam"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      value={field.value ?? null}
                      onChange={(event, newValue) => field.onChange(newValue)}
                      size="small"
                      options={months?.filter((item) => item != null) ?? []}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.monthlyExam}
                          helperText={errors.monthlyExam && "Required"}
                          label="Select month"
                          name="monthlyExam"
                        />
                      )}
                    />
                  )}
                />
              </Box>
            )}
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
          width: "100%",
          height: "auto",
          marginTop: "1rem",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          padding: "1rem",
          borderRadius: "0.3rem",
          border: "1px solid var(--pallet-border-blue)",
          backgroundColor: "#fff",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            textAlign: "left",
            mb: 2,
          }}
        >
          {disableFetch
            ? "All Terms Subject Mark Grades"
            : "Subject Mark Grades"}
        </Typography>

        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            overflowX: "auto",
            maxWidth: isMobile ? "75vw" : isTablet ? "88vW" : "100%",
          }}
        >
          {(isClassMarkGradesTableFetching || isClassAllMarkGradesTableFetching) && (
            <LinearProgress sx={{ width: "100%" }} />
          )}
          <Table aria-label="subject mark grades table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Subject</TableCell>
                {markGradesTableGradeColumns.map((col) => (
                  <TableCell key={col} align="right">
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!disableFetch ? (
                singleTermMarkGradesRows && singleTermMarkGradesRows.length > 0 ? (
                  singleTermMarkGradesRows.map((row: any, index: number) => (
                    <TableRow
                      key={row.subjectId ?? `${row.subjectName}-${index}`}
                    >
                      <TableCell>{row.subjectName}</TableCell>
                      {markGradesTableGradeColumns.map((col) => (
                        <TableCell key={col} align="right">
                          {row[col] ?? 0}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={1 + markGradesTableGradeColumns.length}
                      align="center"
                    >
                      <Typography variant="body2">
                        No mark grades data available. Please adjust filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              ) : (() => {
                const container: any =
                  (classAllMarkGradesTableData as any)?.data ??
                  classAllMarkGradesTableData ??
                  {};

                const terms = Object.keys(container || {});
                const nonEmptyTerms = terms.filter((termKey) => {
                  const termRaw = container[termKey];
                  const termArr: any[] = Array.isArray(termRaw)
                    ? termRaw
                    : Array.isArray(Object.values(termRaw || {}))
                    ? Object.values(termRaw || {})
                    : [];
                  return termArr.length > 0;
                });

                if (!nonEmptyTerms.length) {
                  return (
                    <TableRow>
                      <TableCell
                        colSpan={1 + markGradesTableGradeColumns.length}
                        align="center"
                      >
                        <Typography variant="body2">
                          No mark grades data available. Please adjust filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                }

                const termLabelMap: Record<string, string> = {
                  term1: "Term 1",
                  term2: "Term 2",
                  term3: "Term 3",
                };

                return nonEmptyTerms.map((termKey) => {
                  const termRaw = container[termKey];
                  const termArr: any[] = Array.isArray(termRaw)
                    ? termRaw
                    : Array.isArray(Object.values(termRaw || {}))
                    ? Object.values(termRaw || {})
                    : [];

                  const label = termLabelMap[termKey] || termKey;

                  return (
                    <React.Fragment key={termKey}>
                      <TableRow>
                        <TableCell
                          colSpan={1 + markGradesTableGradeColumns.length}
                          sx={{ backgroundColor: "#f5f5f5" }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            {label}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      {termArr.map((row: any, index: number) => (
                        <TableRow
                          key={row.subjectId ?? `${row.subjectName}-${index}`}
                        >
                          <TableCell>{row.subjectName}</TableCell>
                          {markGradesTableGradeColumns.map((col) => (
                            <TableCell key={col} align="right">
                              {row[col] ?? 0}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  );
                });
              })()}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile || isTablet ? "column" : "row",
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
              {disableFetch
                ? "Term-wise Subject Percentages"
                : "Subject Percentage"}
            </Typography>
          </Box>

          <ResponsiveContainer width="100%" height={500}>
            {disableFetch ? (
              <ApexStackedBarChart
                categories={allTermsStackedBarData.categories}
                series={allTermsStackedBarData.series as any}
                isMobile={isMobile}
              />
            ) : (
              <ApexBarChart
                categories={barChartReportData.categories}
                series={barChartReportData.series as any}
                loading={isClassReportBarChartFetching}
                barColors={barChartReportData.colors}
              />
            )}
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
              {"Subject Students Grades Counts"}
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
            {disableFetch ? (
              <ApexStackedBarChartMarkGrades
                categories={allTermsStackedBarDataMarkGrades.categories}
                series={allTermsStackedBarDataMarkGrades.series as any}
                isMobile={isMobile}
              />
            ) : (
              <ApexBarChartCounts
                categories={subjectCountsChart.categories}
                series={subjectCountsChart.series as any}
                loading={isClassReportBarChartMarkGradeFetching}
                barColors={subjectCountsChart.colors}
              />
            )}
          </ResponsiveContainer>
        </Box>
      </Box>

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
            flex: 2,
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            padding: "1rem",
            borderRadius: "0.3rem",
            border: "1px solid var(--pallet-border-blue)",
            backgroundColor: "#fff",
          }}
        >
          {disableFetch ? (
            <AllClassReportTable
              reportData={classAllReportCardData}
              isLoading={isClassAllReportCardFetching}
              isMobile={isMobile}
              isTablet={isTablet}
              showGroupColumns={showGroupColumns}
            />
          ) : (
            <ClassReportTable
              reportData={classReportCardData}
              isLoading={isClassReportCardFetching}
              isMobile={isMobile}
              isTablet={isTablet}
              title={classReportTitle}
              showGroupColumns={showGroupColumns}
            />
          )}
        </Box>
      </Box>

      
    </Stack>
  );
}

export default RagDashboard;
