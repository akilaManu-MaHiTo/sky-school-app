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
  examTerms,
  getClassReportBarChart,
  months,
} from "../../../api/StudentMarks/studentMarksApi";
import { getYearsData } from "../../../api/OrganizationSettings/organizationSettingsApi";
import {
  getClassesData,
  getGradesData,
} from "../../../api/OrganizationSettings/academicGradeApi";
import ApexBarChart from "./ApexBarChart";

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
    queryKey: ["class-report-bar-chart"],
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
      (selectedTerm !== "Monthly Exam" || !!selectedMonthlyExam),
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

      <Accordion>
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              marginTop: "0.5rem",
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
                  options={examTerms?.filter((item) => item != null) ?? []}
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
          </Box>
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
            <CustomButton
              variant="contained"
              sx={{
                backgroundColor: "var(--pallet-blue)",
              }}
              size="medium"
              onClick={handleSubmit((data) => {
                // handleFetch();
                console.log("data", data);
              })}
            >
              Add Filter
            </CustomButton>
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
            flex: 2,
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
              {`Subject Percentage`}
            </Typography>
          </Box>

          <ResponsiveContainer width="100%" height={500}>
            <ApexBarChart
              categories={barChartReportData.categories}
              series={barChartReportData.series}
              loading={isClassReportBarChartFetching}
            />
          </ResponsiveContainer>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flex: 1,
            flexDirection: "column",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            borderRadius: "0.3rem",
            border: "1px solid var(--pallet-border-blue)",
            padding: "1rem",
            height: "auto",
            marginTop: "1rem",
          }}
        >
          {/* <ResponsiveContainer
            width="100%"
            height={500}
            style={{
              overflowY: "scroll",
              scrollbarWidth: "none",
            }}
          ></ResponsiveContainer> */}
        </Box>
      </Box>
    </Stack>
  );
}

export default RagDashboard;
