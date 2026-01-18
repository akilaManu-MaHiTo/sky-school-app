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
import {
  getMyChildClasses,
  getMyChildGrades,
  getMyChildReport,
  getMyChildReportLineChart,
  getMyChildYears,
  getYearsData,
} from "../../../../api/OrganizationSettings/organizationSettingsApi";
import {
  getGradesData,
  gradeReportBarChart,
  gradeReportMarkBarChart,
} from "../../../../api/OrganizationSettings/academicGradeApi";
import useIsMobile from "../../../../customHooks/useIsMobile";
import useCurrentOrganization from "../../../../hooks/useCurrentOrganization";
import { ResponsiveContainer } from "recharts";
import useCurrentUser from "../../../../hooks/useCurrentUser";
import { fetchMyChildrenData, fetchStudentData } from "../../../../api/userApi";
import SubjectLineChart from "./SubjectLineChart";

const breadcrumbItems = [
  { title: "Home", href: "/home" },
  { title: "Reports" },
  { title: "Management Staff Report" },
  { title: "Student Report" },
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
  const selectedMyChild = watch("myChild");
  const { organization } = useCurrentOrganization();
  const { user } = useCurrentUser();
  const parentId = user?.id;

  const { data: yearData, isFetching: isYearDataFetching } = useQuery({
    queryKey: ["my-academic-years", selectedMyChild?.id],
    queryFn: () => getMyChildYears(selectedMyChild?.id),
  });
  const { data: gradeData, isFetching: isGradeDataFetching } = useQuery({
    queryKey: ["my-academic-grades", selectedMyChild?.id],
    queryFn: () => getMyChildGrades(selectedMyChild?.id),
  });
  const { data: classData, isFetching: isClassDataFetching } = useQuery({
    queryKey: ["my-academic-classes", selectedMyChild?.id],
    queryFn: () => getMyChildClasses(selectedMyChild?.id),
  });

  const { data: myChildrenData, isFetching: isMyChildrenDataFetching } =
    useQuery({
      queryKey: ["student-users"],
      queryFn: fetchStudentData,
    });
  const { data: myChildrenReport, isFetching: isMyChildrenReportFetching } =
    useQuery({
      queryKey: ["my-children-report", selectedMyChild?.id, year, selectedTerm],
      queryFn: () => getMyChildReport(selectedMyChild?.id, year, selectedTerm),
      enabled: !!selectedMyChild && !!year && !!selectedTerm,
    });
  const {
    data: myChildrenLineChart,
    isFetching: isMyChildrenLineChartFetching,
  } = useQuery({
    queryKey: ["my-children-line-chart", selectedMyChild?.id],
    queryFn: () => getMyChildReportLineChart(selectedMyChild?.id),
    enabled: !!selectedMyChild,
  });
  const { isMobile, isTablet } = useIsMobile();

  const groupedReports = useMemo(
    () => myChildrenReport ?? [],
    [myChildrenReport]
  );

  const reportStudent = groupedReports[0]?.student;
  const academicDetails = groupedReports[0]?.academicDetails;

  const subjectLineCharts = useMemo(() => {
    if (!myChildrenLineChart || !Array.isArray(myChildrenLineChart)) return [];

    return (myChildrenLineChart as any[])
      .map((subject) => {
        const years = subject.year ?? [];

        const points: { label: string; value: number }[] = [];

        years.forEach((y: any) => {
          const baseYear = y.year;

          if (y.term1Mark != null) {
            points.push({ label: `${baseYear} Term 1`, value: y.term1Mark });
          }
          if (y.term2Mark != null) {
            points.push({ label: `${baseYear} Term 2`, value: y.term2Mark });
          }
          if (y.term3Mark != null) {
            points.push({ label: `${baseYear} Term 3`, value: y.term3Mark });
          }
        });

        return {
          subjectName: subject.subjectName as string,
          color: subject.colorCode as string | undefined,
          categories: points.map((p) => p.label),
          data: points.map((p) => p.value),
        };
      })
      .filter((chart) => chart.categories.length > 0);
  }, [myChildrenLineChart]);

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
        <PageTitle title="Student Report" />
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
          <Typography variant="subtitle2">Student Filters</Typography>
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
                  name="myChild"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      value={field.value ?? null}
                      onChange={(e, newVal) => {
                        field.onChange(newVal);
                        setValue("year", null, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      size="small"
                      options={myChildrenData ?? []}
                      getOptionLabel={(option) => option.nameWithInitials}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.myChild}
                          helperText={errors.myChild && "Required"}
                          label="Select Student"
                          name="myChild"
                        />
                      )}
                    />
                  )}
                />
              </Box>
              {selectedMyChild && (
                <>
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
                            examReportTerms?.filter((item) => item != null) ??
                            []
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
                </>
              )}
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
      {isMyChildrenReportFetching && (
        <Box sx={{ marginTop: 2 }}>
          <LinearProgress />
        </Box>
      )}
      {!isMyChildrenReportFetching &&
        selectedMyChild &&
        year &&
        selectedTerm &&
        (!myChildrenReport || myChildrenReport.length === 0) && (
          <Box sx={{ marginTop: 2 }}>
            <Alert severity="info">No report data available.</Alert>
          </Box>
        )}
      {!isMyChildrenReportFetching &&
        myChildrenReport &&
        myChildrenReport.length > 0 && (
          <Box sx={{ marginTop: 2 }}>
            {reportStudent && academicDetails && (
              <Paper sx={{ padding: 2, marginBottom: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1">
                    {reportStudent.nameWithInitials} (
                    {reportStudent.admissionNumber})
                  </Typography>
                  <Typography variant="body2">
                    Year: {academicDetails.year} | Grade:{" "}
                    {academicDetails.grade} | Class: {academicDetails.className}
                  </Typography>
                </Stack>
              </Paper>
            )}
            <Stack spacing={2}>
              {groupedReports.map((report: any, index: number) => (
                <Paper
                  key={report.academicDetails?.examType ?? index}
                  sx={{ padding: 2 }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {report.academicDetails?.examType}
                  </Typography>
                  {report.overall && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Overall Average: {report.overall.averageOfMarks} |
                      Position: {report.overall.position}
                    </Typography>
                  )}
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Subject</TableCell>
                          <TableCell align="right">Student Mark</TableCell>
                          <TableCell align="right">Grade</TableCell>
                          <TableCell align="right">Class Average</TableCell>
                          <TableCell align="right">
                            Highest Class Mark
                          </TableCell>
                          <TableCell align="right">
                            Highest Class Grade
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(report.subjects ?? []).map(
                          (subject: any, sIndex: number) => (
                            <TableRow key={subject.subjectId ?? sIndex}>
                              <TableCell>{subject.subjectName}</TableCell>
                              <TableCell align="right">
                                {subject.studentMark}
                              </TableCell>
                              <TableCell align="right">
                                {subject.studentGrade}
                              </TableCell>
                              <TableCell align="right">
                                {subject.classAverageMark}
                              </TableCell>
                              <TableCell align="right">
                                {subject.highestMark}
                              </TableCell>
                              <TableCell align="right">
                                {subject.highestGrade}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

      {!isMyChildrenLineChartFetching && subjectLineCharts.length > 0 && (
        <Box
          sx={{
            marginTop: 2,
            backgroundColor: "#fff",
            px: 4,
            borderRadius: 1,
            border: "1px solid var(--pallet-border-blue)",
            height: "100%",
            py: 4,
          }}
        >
          <Typography variant="inherit" sx={{ mb: 2 }}>
            Student Subject Performance
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 2,
            }}
          >
            {subjectLineCharts.map((chart) => (
              <Box
                key={chart.subjectName}
                sx={{
                  width: "100%",
                  borderRadius: 1,
                  border: "1px solid var(--pallet-border-blue)",
                }}
              >
                <ResponsiveContainer width="100%">
                  <SubjectLineChart
                    key={chart.subjectName}
                    subjectName={chart.subjectName}
                    categories={chart.categories}
                    data={chart.data}
                    color={chart.color}
                  />
                </ResponsiveContainer>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  );
}
