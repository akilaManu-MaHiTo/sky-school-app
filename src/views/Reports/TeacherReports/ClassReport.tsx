import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Stack,
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
import { useMemo } from "react";

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
  getAllClassReportCard,
  getClassReportBarChart,
  getClassReportBarChartByGrades,
  getClassReportCard,
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
  { title: "Class Report" },
];

function RagDashboard() {
  const { isMobile, isTablet } = useIsMobile();
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

  const isMonthlyExam = selectedTerm === "Monthly Exam";

  const barChartReportData = useMemo(() => {
    if (!classReportBarChartData || classReportBarChartData.length === 0) {
      return {
        categories: [],
        series: [],
      };
    }
    return {
      categories: classReportBarChartData.map((item: any) => item.subjectName),
      series: [
        {
          name: "Average %",
          data: classReportBarChartData.map((item: any) =>
            Number(item.average.toFixed(2))
          ),
        },
      ],
    };
  }, [classReportBarChartData]);

  const allTermsStackedBarData = useMemo(() => {
    if (!classAllReportBarChartData || !classAllReportBarChartData.data) {
      return { categories: [], series: [] };
    }

    const terms = Object.keys(classAllReportBarChartData.data);

    if (terms.length === 0) {
      return { categories: [], series: [] };
    }

    const subjectSet = new Set<string>();
    terms.forEach((termKey) => {
      const termArr = (classAllReportBarChartData.data as any)[termKey] || [];
      termArr.forEach((item: any) => {
        if (item?.subjectName) {
          subjectSet.add(item.subjectName);
        }
      });
    });

    const subjects = Array.from(subjectSet);

    const series = subjects.map((subject) => ({
      name: subject,
      data: terms.map((termKey) => {
        const termArr = (classAllReportBarChartData.data as any)[termKey] || [];
        const found = termArr.find((item: any) => item.subjectName === subject);
        return found ? Number(found.average.toFixed(2)) : 0;
      }),
    }));

    return {
      categories: terms,
      series,
    };
  }, [classAllReportBarChartData]);

  // Transform `classAllReportBarChartDataMarkGrades` so X axis = terms and stacks = subjects
  const allTermsStackedBarDataMarkGrades = useMemo(() => {
    const raw = classAllReportBarChartDataMarkGrades ?? {};

    const termKeys = Object.keys(raw || {});
    if (termKeys.length === 0) return { categories: [], series: [] };

    // collect subjects across all terms
    const subjectSet = new Set<string>();
    termKeys.forEach((term) => {
      const arr = (raw as any)[term] || [];
      arr.forEach((item: any) => {
        if (item?.subjectName) subjectSet.add(item.subjectName);
      });
    });

    const subjects = Array.from(subjectSet);

    // Create a series per subject where data array aligns with termKeys order
    const series = subjects.map((subject) => ({
      name: subject,
      data: termKeys.map((term) => {
        const termArr = (raw as any)[term] || [];
        const found = termArr.find((it: any) => it.subjectName === subject);
        return found ? Number(found.count ?? 0) : 0;
      }),
    }));

    return { categories: termKeys, series };
  }, [classAllReportBarChartDataMarkGrades]);

  const classReportTitle = useMemo(() => {
    if (!selectedTerm) return "Class Overall Report";
    if (selectedTerm === "Monthly Exam" && selectedMonthlyExam) {
      return `Class Overall Report - ${selectedMonthlyExam}`;
    }
    return `Grade ${selectedGrade?.grade} ${selectedClass?.className} Class Overall Report - ${selectedTerm}`;
  }, [selectedTerm, selectedMonthlyExam]);

  // Transform `classReportBarChartMarkGradeData` into categories/series for counts chart
  const subjectCountsChart = useMemo(() => {
    const raw = classReportBarChartMarkGradeData ?? [];

    if (!raw || raw.length === 0) {
      return { categories: [], series: [] };
    }

    return {
      categories: raw.map((s: any) => s.subjectName),
      series: [
        {
          name: "Students Count",
          data: raw.map((s: any) => (s.count != null ? Number(s.count) : 0)),
        },
      ],
    };
  }, [classReportBarChartMarkGradeData]);

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
              mb:"3.5rem"
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
            />
          ) : (
            <ClassReportTable
              reportData={classReportCardData}
              isLoading={isClassReportCardFetching}
              isMobile={isMobile}
              isTablet={isTablet}
              title={classReportTitle}
            />
          )}
        </Box>
      </Box>
    </Stack>
  );
}

export default RagDashboard;
