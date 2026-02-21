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
import theme from "../../../theme";
import PageTitle from "../../../components/PageTitle";
import Breadcrumb from "../../../components/BreadCrumb";
import {
  examReportTerms,
  markGrades,
} from "../../../api/StudentMarks/studentMarksApi";
import { Controller, useForm } from "react-hook-form";
import {
  getMyChildAISuggestions,
  getMyChildClassAverage,
  getMyChildClasses,
  getMyChildGrades,
  getMyChildReport,
  getMyChildReportLineChart,
  getMyChildTopSubject,
  getMyChildWeekSubject,
  getMyChildYears,
  getYearsData,
} from "../../../api/OrganizationSettings/organizationSettingsApi";
import {
  getGradesData,
  gradeReportBarChart,
  gradeReportMarkBarChart,
} from "../../../api/OrganizationSettings/academicGradeApi";
import useIsMobile from "../../../customHooks/useIsMobile";
import useCurrentOrganization from "../../../hooks/useCurrentOrganization";
import { ResponsiveContainer } from "recharts";
import useCurrentUser from "../../../hooks/useCurrentUser";
import { EmployeeType, fetchMyChildrenData } from "../../../api/userApi";
import SubjectLineChart from "./SubjectLineChart";
import { exportParentReportToExcel } from "../../../reportsUtils/ParentReportExcel";
import { generateParentReportPdf } from "../../../reportsUtils/ParentReportPDF";
import DashboardCard from "../../../components/DashboardCard";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import BarChartIcon from "@mui/icons-material/BarChart";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const breadcrumbItems = [
  { title: "Home", href: "/home" },
  { title: "Reports" },
  { title: "Student/Parent Report" },
  { title: "Parent Report" },
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
  const studentId =
    user?.employeeType === EmployeeType.PARENT ? selectedMyChild?.id : user?.id;

  const { data: yearData, isFetching: isYearDataFetching } = useQuery({
    queryKey: ["my-academic-years", studentId],
    queryFn: () => getMyChildYears(studentId),
  });
  const { data: gradeData, isFetching: isGradeDataFetching } = useQuery({
    queryKey: ["my-academic-grades", studentId],
    queryFn: () => getMyChildGrades(studentId),
  });
  const { data: classData, isFetching: isClassDataFetching } = useQuery({
    queryKey: ["my-academic-classes", studentId],
    queryFn: () => getMyChildClasses(studentId),
  });

  const { data: myChildrenData, isFetching: isMyChildrenDataFetching } =
    useQuery({
      queryKey: ["my-children", parentId],
      queryFn: () => fetchMyChildrenData(parentId),
      enabled: !!parentId,
    });
  const { data: myChildrenReport, isFetching: isMyChildrenReportFetching } =
    useQuery({
      queryKey: ["my-children-report", studentId, year, selectedTerm],
      queryFn: () => getMyChildReport(studentId, year, selectedTerm),
      enabled: !!studentId && !!year && !!selectedTerm,
    });
  const {
    data: myChildrenLineChart,
    isFetching: isMyChildrenLineChartFetching,
  } = useQuery({
    queryKey: ["my-children-line-chart", studentId],
    queryFn: () => getMyChildReportLineChart(studentId),
    enabled: !!studentId,
  });
  const { data: myChildrenStats, isFetching: isMyChildrenStatsFetching } =
    useQuery({
      queryKey: ["my-children-stats", studentId, year, selectedTerm],
      queryFn: () => getMyChildClassAverage(studentId, year, selectedTerm),
      enabled: !!studentId && !!year && !!selectedTerm,
    });
  const {
    data: myChildrenWeekSubject,
    isFetching: isMyChildrenWeekSubjectFetching,
  } = useQuery({
    queryKey: ["my-children-week", studentId, year, selectedTerm],
    queryFn: () => getMyChildWeekSubject(studentId, year, selectedTerm),
    enabled: !!studentId && !!year && !!selectedTerm,
  });
  const {
    data: myChildrenStrongSubject,
    isFetching: isMyChildrenStrongSubjectFetching,
  } = useQuery({
    queryKey: ["my-children-strong", studentId, year, selectedTerm],
    queryFn: () => getMyChildTopSubject(studentId, year, selectedTerm),
    enabled: !!studentId && !!year && !!selectedTerm,
  });
  const {
    data: myChildrenAISuggestions,
    isFetching: isMyChildrenAISuggestionsFetching,
  } = useQuery({
    queryKey: ["my-children-AI-suggestion", studentId, year, selectedTerm],
    queryFn: () => getMyChildAISuggestions(studentId, year, selectedTerm),
    enabled: !!studentId && !!year && !!selectedTerm,
  });
  const { isMobile, isTablet } = useIsMobile();

  const groupedReports = useMemo(
    () => myChildrenReport ?? [],
    [myChildrenReport],
  );

  const reportStudent = groupedReports[0]?.student;
  const academicDetails = groupedReports[0]?.academicDetails;

  const yearLabel = useMemo(() => {
    if (!year) return "";
    if (typeof year === "string" || typeof year === "number")
      return String(year);
    return String((year as any).year ?? (year as any).label ?? "");
  }, [year]);

  const termLabel = useMemo(() => {
    if (!selectedTerm) return "";
    return String(selectedTerm);
  }, [selectedTerm]);

  const mapTrendDirection = (direction: unknown) => {
    if (!direction) return undefined;
    const d = String(direction).toLowerCase();
    if (d === "up") return "up" as const;
    if (d === "down") return "down" as const;
    if (d === "same" || d === "flat") return "flat" as const;
    return undefined;
  };

  const selectedTermStats = useMemo(() => {
    const terms = (myChildrenStats as any)?.terms;
    if (!Array.isArray(terms) || terms.length === 0) return null;

    const termKey = selectedTerm ? String(selectedTerm) : "";

    if (termKey && termKey !== "All") {
      return (
        terms.find((t: any) => String(t?.term) === termKey) ??
        terms[terms.length - 1]
      );
    }

    // "All": show latest term that has some values (fallback to last).
    const latestWithValues = [...terms]
      .reverse()
      .find(
        (t: any) =>
          t?.studentPosition != null ||
          t?.studentAverage != null ||
          t?.classAverage != null,
      );
    return latestWithValues ?? terms[terms.length - 1];
  }, [myChildrenStats, selectedTerm]);

  const termBreakdown = useMemo(() => {
    const terms = (myChildrenStats as any)?.terms;
    if (!Array.isArray(terms)) return [];
    return terms.filter(
      (t: any) =>
        t?.term && (t?.studentPosition != null || t?.studentAverage != null),
    );
  }, [myChildrenStats]);

  const termBreakdownSorted = useMemo(() => {
    const getOrder = (term: unknown) => {
      const s = String(term ?? "");
      const match = s.match(/(\d+)/);
      if (!match) return Number.MAX_SAFE_INTEGER;
      const n = Number(match[1]);
      return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
    };

    return [...termBreakdown].sort((a: any, b: any) => {
      const orderA = getOrder(a?.term);
      const orderB = getOrder(b?.term);
      if (orderA !== orderB) return orderA - orderB;
      return String(a?.term ?? "").localeCompare(String(b?.term ?? ""));
    });
  }, [termBreakdown]);

  const classPositionValue = useMemo(() => {
    const positionRaw = selectedTermStats?.studentPosition;
    return positionRaw == null || positionRaw === ""
      ? "-"
      : String(positionRaw);
  }, [selectedTermStats]);

  const classPositionTrend = useMemo(() => {
    const posTrend = selectedTermStats?.trend?.position;
    return {
      trend: mapTrendDirection(posTrend?.direction),
      trendValue: posTrend?.delta == null ? undefined : String(posTrend?.delta),
      fromTerm: selectedTermStats?.trend?.fromTerm as string | undefined,
    };
  }, [selectedTermStats]);

  const studentAverageCard = useMemo(() => {
    const avg = selectedTermStats?.studentAverage;
    const avgTrend = selectedTermStats?.trend?.studentAverage;
    return {
      value: avg == null || avg === "" ? "-" : String(avg),
      trend: mapTrendDirection(avgTrend?.direction),
      trendValue: avgTrend?.delta == null ? undefined : String(avgTrend?.delta),
      fromTerm: selectedTermStats?.trend?.fromTerm as string | undefined,
    };
  }, [selectedTermStats]);

  const weakSubjectsData = useMemo(() => {
    const terms = (myChildrenWeekSubject as any)?.terms;
    if (!Array.isArray(terms) || terms.length === 0) return [];
    return terms.flatMap((t: any) =>
      (t?.weakSubjects ?? []).map((subject: any) => ({
        ...subject,
        term: t.term,
      })),
    );
  }, [myChildrenWeekSubject]);

  const strongSubjectsData = useMemo(() => {
    const terms = (myChildrenStrongSubject as any)?.terms;
    if (!Array.isArray(terms) || terms.length === 0) return [];
    return terms.flatMap((t: any) =>
      (t?.strongSubjects ?? []).map((subject: any) => ({
        ...subject,
        term: t.term,
      })),
    );
  }, [myChildrenStrongSubject]);

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

  const handleExportExcel = () => {
    if (!groupedReports || groupedReports.length === 0) return;

    const sections = groupedReports.map((report: any, index: number) => ({
      examType: report.academicDetails?.examType ?? `Exam ${index + 1}`,
      academicDetails: {
        year: report.academicDetails?.year,
        grade: report.academicDetails?.grade,
        className: report.academicDetails?.className,
      },
      overall: report.overall ?? null,
      subjects: (report.subjects ?? []).map((s: any) => ({
        subjectName: s.subjectName,
        studentMark: s.studentMark,
        studentGrade: s.studentGrade,
        classAverageMark: s.classAverageMark,
        highestMark: s.highestMark,
        highestGrade: s.highestGrade,
      })),
    }));

    const options = {
      organizationName: organization?.organizationName,
      studentName: reportStudent?.nameWithInitials,
      admissionNumber: reportStudent?.admissionNumber,
      yearLabel: academicDetails?.year,
      gradeLabel: academicDetails?.grade,
      classLabel: academicDetails?.className,
    };

    exportParentReportToExcel({ sections, options } as any);
  };

  const handleExportPdf = () => {
    if (!groupedReports || groupedReports.length === 0) return;

    const sections = groupedReports.map((report: any, index: number) => ({
      examType: report.academicDetails?.examType ?? `Exam ${index + 1}`,
      academicDetails: {
        year: report.academicDetails?.year,
        grade: report.academicDetails?.grade,
        className: report.academicDetails?.className,
      },
      overall: report.overall ?? null,
      subjects: (report.subjects ?? []).map((s: any) => ({
        subjectName: s.subjectName,
        studentMark: s.studentMark,
        studentGrade: s.studentGrade,
        classAverageMark: s.classAverageMark,
        highestMark: s.highestMark,
        highestGrade: s.highestGrade,
      })),
    }));

    const options = {
      organizationName: organization?.organizationName,
      studentName: reportStudent?.nameWithInitials,
      admissionNumber: reportStudent?.admissionNumber,
      yearLabel: academicDetails?.year,
      gradeLabel: academicDetails?.grade,
      classLabel: academicDetails?.className,
    };

    generateParentReportPdf({ sections, options } as any);
  };

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
        <PageTitle title="Parent Report" />
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
              {user.employeeType === EmployeeType.PARENT && (
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
                            label="Select My Child"
                            name="myChild"
                          />
                        )}
                      />
                    )}
                  />
                </Box>
              )}
              {(!!selectedMyChild || !!studentId) && (
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
      {selectedMyChild && year && selectedTerm && selectedTerm !== "All" && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginTop: "1rem",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flex: 1,
              minWidth: "150px",
            }}
          >
            <DashboardCard
              variant="gradient"
              title="Student Class Position"
              caption={
                termLabel && yearLabel
                  ? `${termLabel} ${yearLabel}`
                  : selectedTermStats?.term
                    ? `${selectedTermStats.term}`
                    : undefined
              }
              titleIcon={<AdsClickIcon fontSize="large" />}
              value={classPositionValue}
              trend={classPositionTrend.trend as any}
              trendValue={classPositionTrend.trendValue}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flex: 1,
              minWidth: "150px",
            }}
          >
            <DashboardCard
              variant="gradient"
              title="Student Class Average"
              caption={
                termLabel && yearLabel
                  ? `${termLabel} ${yearLabel}`
                  : selectedTermStats?.term
                    ? `${selectedTermStats.term}`
                    : undefined
              }
              titleIcon={<BarChartIcon fontSize="large" />}
              value={studentAverageCard.value + "%"}
              trend={studentAverageCard.trend as any}
              trendValue={studentAverageCard.trendValue}
            />
          </Box>
        </Box>
      )}

      {selectedTerm !== "All" && weakSubjectsData.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginTop: "1rem",
            gap: 2,
          }}
        >
          {weakSubjectsData.map((subject: any, index: number) => (
            <Box
              key={`weak-${subject.subjectId}-${index}`}
              sx={{
                display: "flex",
                flex: 1,
                minWidth: "150px",
              }}
            >
              <DashboardCard
                variant="gradient"
                title={`Weak Subject: ${subject.subjectName}`}
                caption={
                  termLabel && yearLabel
                    ? `${termLabel} ${yearLabel}`
                    : subject.term
                      ? `${subject.term}`
                      : undefined
                }
                titleIcon={<HourglassEmptyOutlinedIcon fontSize="large" />}
                value={`${subject.studentMark}%`}
                trend={
                  mapTrendDirection(
                    subject.trendFromPreviousTerm?.direction,
                  ) as any
                }
                trendValue={
                  subject.trendFromPreviousTerm?.delta == null
                    ? undefined
                    : String(subject.trendFromPreviousTerm?.delta)
                }
                subDescription={`Class Avg: ${subject.classAverageMark}% (${subject.differenceFromClass >= 0 ? "+" : ""}${subject.differenceFromClass})`}
              />
            </Box>
          ))}
        </Box>
      )}

      {selectedTerm !== "All" && strongSubjectsData.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginTop: "1rem",
            gap: 2,
          }}
        >
          {strongSubjectsData.map((subject: any, index: number) => (
            <Box
              key={`strong-single-${subject.subjectId}-${index}`}
              sx={{
                display: "flex",
                flex: 1,
                minWidth: "150px",
              }}
            >
              <DashboardCard
                variant="gradient"
                title={`Strong Subject: ${subject.subjectName}`}
                caption={
                  termLabel && yearLabel
                    ? `${termLabel} ${yearLabel}`
                    : subject.term
                      ? `${subject.term}`
                      : undefined
                }
                titleIcon={<BarChartIcon fontSize="large" />}
                value={`${subject.studentMark}%`}
                trend={
                  mapTrendDirection(
                    subject.trendFromPreviousTerm?.direction,
                  ) as any
                }
                trendValue={
                  subject.trendFromPreviousTerm?.delta == null
                    ? undefined
                    : String(subject.trendFromPreviousTerm?.delta)
                }
                subDescription={`Class Avg: ${subject.classAverageMark}% (${subject.differenceFromClass >= 0 ? "+" : ""}${subject.differenceFromClass})`}
              />
            </Box>
          ))}
        </Box>
      )}

      {String(selectedTerm ?? "") === "All" &&
        termBreakdownSorted.length > 0 && (
          <Box sx={{ marginTop: 2 }}>
            {termBreakdownSorted.map((t: any) => {
              const p = t?.trend?.position;
              const avgTrend = t?.trend?.studentAverage;
              const fromTerm = t?.trend?.fromTerm as string | undefined;

              return (
                <Box
                  key={t.term}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                    },
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <DashboardCard
                    variant="gradient"
                    title={`Student Class Position`}
                    caption={yearLabel ? `${yearLabel}` : undefined}
                    titleIcon={<AdsClickIcon fontSize="large" />}
                    value={
                      t.studentPosition == null || t.studentPosition === ""
                        ? "-"
                        : String(t.studentPosition)
                    }
                    trend={mapTrendDirection(p?.direction) as any}
                    trendValue={p?.delta == null ? undefined : String(p?.delta)}
                    subDescription={`${t.term}`}
                  />

                  <DashboardCard
                    variant="gradient"
                    title={`Student Class Average`}
                    caption={yearLabel ? `${yearLabel}` : undefined}
                    titleIcon={<BarChartIcon fontSize="large" />}
                    value={t.studentAverage + "%"}
                    trend={mapTrendDirection(avgTrend?.direction) as any}
                    trendValue={
                      avgTrend?.delta == null
                        ? undefined
                        : String(avgTrend?.delta)
                    }
                    subDescription={`${t.term}`}
                  />
                </Box>
              );
            })}
          </Box>
        )}

      {String(selectedTerm ?? "") === "All" &&
        strongSubjectsData.length > 0 && (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
              Strong Subjects
            </Typography>
            {strongSubjectsData.map((subject: any, index: number) => (
              <Box
                key={`strong-${subject.subjectId}-${subject.term}-${index}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr",
                  },
                  gap: 2,
                  mb: 2,
                }}
              >
                <DashboardCard
                  variant="gradient"
                  title={`Strong Subject: ${subject.subjectName}`}
                  caption={yearLabel ? `${yearLabel}` : undefined}
                  titleIcon={<BarChartIcon fontSize="large" />}
                  value={`${subject.studentMark}%`}
                  trend={
                    mapTrendDirection(
                      subject.trendFromPreviousTerm?.direction,
                    ) as any
                  }
                  trendValue={
                    subject.trendFromPreviousTerm?.delta == null
                      ? undefined
                      : String(subject.trendFromPreviousTerm?.delta)
                  }
                  subDescription={`${subject.term} | Class Avg: ${subject.classAverageMark}% (${subject.differenceFromClass >= 0 ? "+" : ""}${subject.differenceFromClass})`}
                />
              </Box>
            ))}
          </Box>
        )}

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
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mb: 2,
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon fontSize="small" />}
                onClick={handleExportExcel}
                disabled={isMyChildrenReportFetching || !groupedReports.length}
              >
                Export Excel
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PictureAsPdfIcon fontSize="small" />}
                onClick={handleExportPdf}
                disabled={isMyChildrenReportFetching || !groupedReports.length}
              >
                Export PDF
              </Button>
            </Box>
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
                          <TableCell align="right">
                            Overall Class Average Mark
                          </TableCell>
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
                                {subject.classAverageMark.toFixed(2)}
                              </TableCell>
                              <TableCell align="right">
                                {subject.highestMark}
                              </TableCell>
                              <TableCell align="right">
                                {subject.highestGrade}
                              </TableCell>
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

      {selectedMyChild && year && selectedTerm && (
        <Box sx={{ marginTop: 2 }}>
          {isMyChildrenAISuggestionsFetching && (
            <Paper
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 3,
                borderRadius: 2,
                border: "1px solid #e0e0e0",
              }}
            >
              <CircularProgress size={24} sx={{ color: "#667eea" }} />
              <Typography sx={{ color: "#666", fontWeight: 500 }}>
                Generating AI insights...
              </Typography>
            </Paper>
          )}
          {!isMyChildrenAISuggestionsFetching &&
            (myChildrenAISuggestions as any)?.suggestion && (
              <Paper
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid #e0e0e0",
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 2.5,
                    backgroundColor: "#f8f9ff",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "12px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AutoAwesomeIcon sx={{ fontSize: 24, color: "#fff" }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: "#333" }}
                    >
                      AI Study Suggestions
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#666" }}>
                      Personalized recommendations based on performance
                    </Typography>
                  </Box>
                </Box>

                {/* Content */}
                <Box sx={{ p: 3, maxHeight: 350, overflowY: "auto" }}>
                  {((myChildrenAISuggestions as any).suggestion as string)
                    .split(/(?<=[.!?])\s+/)
                    .filter((sentence: string) => sentence.trim().length > 10)
                    .map((sentence: string, idx: number) => (
                      <Box
                        key={idx}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1.5,
                          mb: 1.5,
                          p: 1.5,
                          borderRadius: 1,
                          backgroundColor: idx % 2 === 0 ? "#f8f9ff" : "#fff",
                          border: "1px solid #f0f0f0",
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            mt: 0.8,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#444",
                            lineHeight: 1.6,
                          }}
                        >
                          {sentence.trim().replace(/^[-•*]\s*/, "")}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              </Paper>
            )}
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
