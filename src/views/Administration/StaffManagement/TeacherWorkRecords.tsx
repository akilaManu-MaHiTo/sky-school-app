import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  LinearProgress,
  Paper,
  Switch,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  TextField,
  Typography,
  Button,
  Alert,
  Icon,
  Chip,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { addDays, addMonths, format, subDays, subMonths } from "date-fns";
import PageTitle from "../../../components/PageTitle";
import Breadcrumb from "../../../components/BreadCrumb";
import theme from "../../../theme";
import useIsMobile from "../../../customHooks/useIsMobile";
import DatePickerComponent from "../../../components/DatePickerComponent";
import { getYearsData } from "../../../api/OrganizationSettings/organizationSettingsApi";
import {
  AcademicClass,
  AcademicGrade,
  AcademicYear,
  getClassesData,
  getGradesData,
} from "../../../api/OrganizationSettings/academicGradeApi";
import {
  approveTeacherAcademicWork,
  fetchTeacherAcademicWorksByAdmin,
} from "../../../api/teacherAcademicWorksApi";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import queryClient from "../../../state/queryClient";
import { useSnackbar } from "notistack";
import { exportTeacherWorkRecordsToExcel } from "../../../reportsUtils/TeacherWorkRecordsExcel";
import { generateTeacherWorkRecordsPdf } from "../../../reportsUtils/TeacherWorkRecordsPDF";

type TeacherWorkRecordsFilters = {
  year: AcademicYear | null;
  grade: AcademicGrade | null;
  class: AcademicClass | null;
  date: Date | null;
  category: string | null;
  week?: string | null;
};

type MonthlyWorkGroup = {
  date: string;
  works: Array<Record<string, any>>;
};

type TeacherWorkExportRow = {
  workDate: string | Date | null;
  teacherName: string;
  subjectName: string;
  title: string;
  academicWork: string;
  time: string | Date | null;
  status: string;
};

const TeacherWorkRecords = () => {
  const { isMobile, isTablet } = useIsMobile();
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TeacherWorkRecordsFilters>({
    defaultValues: {
      year: null,
      grade: null,
      class: null,
      date: null,
      week: null,
      category: null,
    },
  });

  const selectedYear = watch("year");
  const selectedGrade = watch("grade");
  const selectedClass = watch("class");
  const selectedDate = watch("date");
  const selectedCategory = watch("category");
  const selectedWeek = watch("week");
  const formattedDate =
    selectedCategory === "Monthly"
      ? "Monthly"
      : selectedCategory === "Weekly"
        ? (selectedWeek ?? "")
        : selectedCategory === "Daily"
          ? selectedDate
            ? format(selectedDate, "yyyy-MM-dd")
            : ""
          : "";

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Staff Management" },
    { title: "Teacher Work Records" },
  ];

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

  const filteredClassOptions = useMemo(() => {
    const classes = Array.isArray(classData) ? classData : [];
    if (!selectedGrade?.id) return classes;
    return classes.filter((c) =>
      c?.gradeId ? c.gradeId === selectedGrade.id : true,
    );
  }, [classData, selectedGrade]);

  useEffect(() => {
    if (!selectedClass?.id) return;
    if (!selectedGrade?.id) return;

    const classGradeId = selectedClass?.gradeId;
    if (classGradeId && classGradeId !== selectedGrade.id) {
      setValue("class", null);
    }
  }, [selectedClass, selectedGrade, setValue]);

  const { data: academicWorks, isFetching: isAcademicWorksFetching } = useQuery(
    {
      queryKey: [
        "teacher-academic-works-by-admin",
        selectedYear?.year,
        selectedGrade?.id,
        selectedClass?.id,
        formattedDate,
      ],
      queryFn: () =>
        fetchTeacherAcademicWorksByAdmin(
          selectedYear?.year ?? "",
          selectedGrade?.id ?? 0,
          selectedClass?.id ?? 0,
          formattedDate,
        ),
      enabled:
        !!selectedYear?.year && !!selectedGrade?.id && !!selectedClass?.id,
    },
  );

  const {
    mutate: approveAcademicWorkMutation,
    isPending: isAcademicWorkApproving,
  } = useMutation({
    mutationFn: approveTeacherAcademicWork,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teacher-academic-works-by-admin"],
      });
      enqueueSnackbar("Teacher academic work approved successfully!", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to approve teacher academic work.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const isLoading =
    isYearDataFetching ||
    isGradeDataFetching ||
    isClassDataFetching ||
    isAcademicWorksFetching ||
    isAcademicWorkApproving;

  const showTable =
    !!selectedYear && !!selectedGrade && !!selectedClass && !!formattedDate;
  const workRows = Array.isArray(academicWorks?.rows)
    ? academicWorks.rows
    : Array.isArray(academicWorks)
      ? academicWorks
      : [];
  const groupedWorkRecords: MonthlyWorkGroup[] = Array.isArray(academicWorks)
    ? academicWorks.filter(
        (group): group is MonthlyWorkGroup =>
          !!group &&
          typeof group === "object" &&
          "date" in group &&
          "works" in group,
      )
    : [];

  const exportRows = useMemo<TeacherWorkExportRow[]>(() => {
    const mapRow = (row: Record<string, any>, workDate: string | Date | null) => {
      const teacher = row.teacher ?? null;
      const subject = row.subject ?? null;

      return {
        workDate,
        teacherName:
          teacher?.nameWithInitials ?? teacher?.name ?? teacher?.userName ?? "--",
        subjectName: subject
          ? `${subject.subjectName} - ${subject.subjectMedium} Medium`
          : "--",
        title: row.title ?? "--",
        academicWork: row.academicWork ?? "--",
        time: row.time ?? null,
        status: row?.isApproved || row?.approved ? "Approved" : "Pending",
      };
    };

    if (selectedCategory === "Daily") {
      return workRows.map((row) => mapRow(row, row.date ?? selectedDate ?? null));
    }

    if (selectedCategory === "Weekly" || selectedCategory === "Monthly") {
      return groupedWorkRecords.flatMap((group) =>
        group.works.map((row) => mapRow(row, group.date)),
      );
    }

    return [];
  }, [groupedWorkRecords, selectedCategory, selectedDate, workRows]);

  const exportTitle = useMemo(() => {
    const parts = ["Teacher Work Records"];

    if (selectedYear?.year) parts.push(`Year ${selectedYear.year}`);
    if (selectedGrade?.grade) parts.push(`Grade ${selectedGrade.grade}`);
    if (selectedClass?.className) parts.push(`Class ${selectedClass.className}`);
    if (selectedCategory) parts.push(selectedCategory);
    if (selectedCategory === "Daily" && selectedDate) {
      parts.push(format(selectedDate, "yyyy-MM-dd"));
    }
    if (selectedCategory === "Weekly" && selectedWeek) {
      parts.push(selectedWeek);
    }

    return parts.join(" - ");
  }, [
    selectedCategory,
    selectedClass?.className,
    selectedDate,
    selectedGrade?.grade,
    selectedWeek,
    selectedYear?.year,
  ]);

  const exportFileName = useMemo(() => {
    return exportTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  }, [exportTitle]);

  const handleMoveDate = (direction: "prev" | "next") => {
    if (!selectedDate) return;
    const nextDate =
      direction === "next"
        ? addDays(selectedDate, 1)
        : subDays(selectedDate, 1);
    setValue("date", nextDate, { shouldDirty: true });
  };

  const handleMoveMonth = (direction: "prev" | "next") => {
    if (!selectedDate) return;
    const nextDate =
      direction === "next"
        ? addMonths(selectedDate, 1)
        : subMonths(selectedDate, 1);
    setValue("date", nextDate, { shouldDirty: true });
  };

  const handleExportExcel = () => {
    if (!exportRows.length) return;

    exportTeacherWorkRecordsToExcel(exportRows, {
      title: exportTitle,
      fileName: `${exportFileName}.xlsx`,
      yearLabel: selectedYear?.year ?? undefined,
      gradeLabel: selectedGrade?.grade ? `Grade ${selectedGrade.grade}` : undefined,
      classLabel: selectedClass?.className ?? undefined,
      categoryLabel: selectedCategory ?? undefined,
      periodLabel:
        selectedCategory === "Daily" && selectedDate
          ? format(selectedDate, "yyyy-MM-dd")
          : selectedCategory === "Weekly"
            ? selectedWeek ?? undefined
            : selectedCategory === "Monthly"
              ? "Monthly"
              : undefined,
    });
  };

  const handleExportPdf = () => {
    if (!exportRows.length) return;

    generateTeacherWorkRecordsPdf(exportRows, {
      title: exportTitle,
      yearLabel: selectedYear?.year ?? undefined,
      gradeLabel: selectedGrade?.grade ? `Grade ${selectedGrade.grade}` : undefined,
      classLabel: selectedClass?.className ?? undefined,
      categoryLabel: selectedCategory ?? undefined,
      periodLabel:
        selectedCategory === "Daily" && selectedDate
          ? format(selectedDate, "yyyy-MM-dd")
          : selectedCategory === "Weekly"
            ? selectedWeek ?? undefined
            : selectedCategory === "Monthly"
              ? "Monthly"
              : undefined,
    });
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
        <PageTitle title="Teacher Work Records" />
        <Breadcrumb breadcrumbs={breadcrumbItems} />
      </Box>

      <Accordion expanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{
            borderBottom: "1px solid var(--pallet-lighter-grey)",
          }}
        >
          <Typography variant="subtitle2">Teacher Work Filters</Typography>
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
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.year}
                          helperText={errors.year && "Required"}
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
                      getOptionLabel={(option) => `Grade ${option.grade}`}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.grade}
                          helperText={errors.grade && "Required"}
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
                      options={filteredClassOptions}
                      getOptionLabel={(option) => option.className}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.class}
                          helperText={errors.class && "Required"}
                          label="Select Class"
                          name="class"
                        />
                      )}
                    />
                  )}
                />
              </Box>
            </Stack>
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
                  name="category"
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
                      options={["Daily", "Weekly", "Monthly"]}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.category}
                          helperText={errors.category && "Required"}
                          label="Select Category"
                          name="category"
                        />
                      )}
                    />
                  )}
                />
              </Box>
              {selectedCategory == "Daily" && (
                <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
                  <Controller
                    name="date"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <DatePickerComponent
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        label="Select Date"
                        error={errors.date ? "Required" : ""}
                      />
                    )}
                  />
                </Box>
              )}
              {selectedCategory == "Weekly" && (
                <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
                  <Controller
                    name="week"
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
                        options={["Week 1", "Week 2", "Week 3", "Week 4"]}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            required
                            error={!!errors.category}
                            helperText={errors.category && "Required"}
                            label="Select Week"
                            name="week"
                          />
                        )}
                      />
                    )}
                  />
                </Box>
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
                reset({
                  year: null,
                  grade: null,
                  class: null,
                  date: null,
                  category: null,
                });
              }}
            sx={{ color: "var(--pallet-blue)", marginRight: "0.5rem" }}
            >
              Reset
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
      {!showTable && (
        <Alert severity="info" sx={{ marginTop: 2 }}>
          Please select all filters to view teacher work records.
        </Alert>
      )}
      {showTable && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            mt: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon fontSize="small" />}
            onClick={handleExportExcel}
            disabled={isLoading || !exportRows.length}
          >
            Export Excel
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PictureAsPdfIcon fontSize="small" />}
            onClick={handleExportPdf}
            disabled={isLoading || !exportRows.length}
          >
            Export PDF
          </Button>
        </Box>
      )}
      {selectedCategory === "Weekly" && (
        <TableContainer
          component={Paper}
          sx={{
            overflowX: "auto",
            maxWidth: isMobile ? "65vw" : "100%",
            marginTop: theme.spacing(2),
            p: 2,
          }}
        >
          {isLoading && <LinearProgress sx={{ width: "100%" }} />}
          <Stack spacing={2} sx={{ width: "100%" }}>
            <Box
              sx={{
                px: 2,
                py: 1,
                backgroundColor: "var(--pallet-lighter-blue)",
                border: "1px solid var(--pallet-lighter-grey)",
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                {`Selected Week: ${selectedWeek ?? ""}`}
              </Typography>
            </Box>

            {groupedWorkRecords.length > 0 ? (
              groupedWorkRecords.map((group) => (
                <Paper
                  key={group.date}
                  elevation={0}
                  sx={{
                    border: "1px solid var(--pallet-lighter-grey)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      backgroundColor: "var(--pallet-lighter-blue)",
                      borderBottom: "1px solid var(--pallet-lighter-grey)",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {format(new Date(group.date), "MMMM dd, yyyy")}
                    </Typography>
                  </Box>

                  <Table aria-label={`teacher weekly work records ${group.date}`}>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Teacher</TableCell>
                        <TableCell align="center">Subject</TableCell>
                        <TableCell align="center">Title</TableCell>
                        <TableCell align="center">Academic Work</TableCell>
                        <TableCell align="center">Time</TableCell>
                        <TableCell align="center">Approve</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.works.length > 0 ? (
                        group.works.map((row, index) => {
                          const teacher = row.teacher ?? null;
                          const subject = row.subject ?? null;

                          return (
                            <TableRow
                              key={`${group.date}-${row.id ?? index}-${index}`}
                              hover
                            >
                              <TableCell align="center">
                                {teacher?.nameWithInitials ??
                                  teacher?.name ??
                                  teacher?.userName ??
                                  "--"}
                              </TableCell>
                              <TableCell align="center">
                                {subject
                                  ? `${subject.subjectName} - ${subject.subjectMedium} Medium`
                                  : "--"}
                              </TableCell>
                              <TableCell align="center">{row.title}</TableCell>
                              <TableCell align="center">
                                {row.academicWork}
                              </TableCell>
                              <TableCell align="center">
                                {row.time
                                  ? format(
                                      typeof row.time === "string"
                                        ? new Date(row.time)
                                        : row.time,
                                      "hh:mm a",
                                    )
                                  : "--"}
                              </TableCell>
                              <TableCell align="center">
                                <Switch
                                  size="small"
                                  checked={Boolean(
                                    row?.isApproved ?? row?.approved,
                                  )}
                                  onChange={() => {
                                    if (!row?.id) return;
                                    approveAcademicWorkMutation({ id: row.id });
                                  }}
                                  disabled={isAcademicWorkApproving || !row?.id}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  color={
                                    row?.isApproved || row?.approved
                                      ? "success"
                                      : "warning"
                                  }
                                  label={
                                    row?.isApproved || row?.approved
                                      ? "Approved"
                                      : "Pending"
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography variant="body2">
                              No teacher work records found for this date
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              ))
            ) : (
              <Box sx={{ py: 2, textAlign: "center" }}>
                <Typography variant="body2">
                  {isLoading ? "" : "No teacher work records found"}
                </Typography>
              </Box>
            )}
          </Stack>
        </TableContainer>
      )}
      {selectedCategory === "Monthly" && (
        <TableContainer
          component={Paper}
          sx={{
            overflowX: "auto",
            maxWidth: isMobile ? "65vw" : "100%",
            marginTop: theme.spacing(2),
            p: 2,
          }}
        >
          {isLoading && <LinearProgress sx={{ width: "100%" }} />}
          <Stack spacing={2} sx={{ width: "100%" }}>
            {groupedWorkRecords.length > 0 ? (
              groupedWorkRecords.map((group) => (
                <Paper
                  key={group.date}
                  elevation={0}
                  sx={{
                    border: "1px solid var(--pallet-lighter-grey)",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      backgroundColor: "var(--pallet-lighter-blue)",
                      borderBottom: "1px solid var(--pallet-lighter-grey)",
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {format(new Date(group.date), "MMMM dd, yyyy")}
                    </Typography>
                  </Box>

                  <Table
                    aria-label={`teacher monthly work records ${group.date}`}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">Teacher</TableCell>
                        <TableCell align="center">Subject</TableCell>
                        <TableCell align="center">Title</TableCell>
                        <TableCell align="center">Academic Work</TableCell>
                        <TableCell align="center">Time</TableCell>
                        <TableCell align="center">Approve</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.works.length > 0 ? (
                        group.works.map((row, index) => {
                          const teacher = row.teacher ?? null;
                          const subject = row.subject ?? null;

                          return (
                            <TableRow
                              key={`${group.date}-${row.id ?? index}-${index}`}
                              hover
                            >
                              <TableCell align="center">
                                {teacher?.nameWithInitials ??
                                  teacher?.name ??
                                  teacher?.userName ??
                                  "--"}
                              </TableCell>
                              <TableCell align="center">
                                {subject
                                  ? `${subject.subjectName} - ${subject.subjectMedium} Medium`
                                  : "--"}
                              </TableCell>
                              <TableCell align="center">{row.title}</TableCell>
                              <TableCell align="center">
                                {row.academicWork}
                              </TableCell>
                              <TableCell align="center">
                                {row.time
                                  ? format(
                                      typeof row.time === "string"
                                        ? new Date(row.time)
                                        : row.time,
                                      "hh:mm a",
                                    )
                                  : "--"}
                              </TableCell>
                              <TableCell align="center">
                                <Switch
                                  size="small"
                                  checked={Boolean(
                                    row?.isApproved ?? row?.approved,
                                  )}
                                  onChange={() => {
                                    if (!row?.id) return;
                                    approveAcademicWorkMutation({ id: row.id });
                                  }}
                                  disabled={isAcademicWorkApproving || !row?.id}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  color={
                                    row?.isApproved || row?.approved
                                      ? "success"
                                      : "warning"
                                  }
                                  label={
                                    row?.isApproved || row?.approved
                                      ? "Approved"
                                      : "Pending"
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography variant="body2">
                              No teacher work records found for this date
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              ))
            ) : (
              <Box sx={{ py: 2, textAlign: "center" }}>
                <Typography variant="body2">
                  {isLoading ? "" : "No teacher work records found"}
                </Typography>
              </Box>
            )}
          </Stack>
        </TableContainer>
      )}

      {showTable && selectedCategory == "Daily" && (
        <TableContainer
          component={Paper}
          sx={{
            overflowX: "auto",
            maxWidth: isMobile ? "65vw" : "100%",
            marginTop: theme.spacing(2),
          }}
        >
          {isLoading && <LinearProgress sx={{ width: "100%" }} />}
          <Table aria-label="teacher work records table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell align="center">Teacher</TableCell>
                <TableCell align="center">Subject</TableCell>
                <TableCell align="center">Title</TableCell>
                <TableCell align="center">Academic Work</TableCell>
                <TableCell align="center">Date</TableCell>
                <TableCell align="center">Time</TableCell>
                <TableCell align="center">Approve</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workRows.length > 0 ? (
                workRows.map((row) => {
                  const teacher = row.teacher ?? null;
                  const subject = row.subject ?? null;

                  return (
                    <TableRow key={String(row.id)} hover>
                      <TableCell align="center">
                        {teacher?.nameWithInitials ??
                          teacher?.name ??
                          teacher?.userName ??
                          "--"}
                      </TableCell>
                      <TableCell align="center">
                        {subject
                          ? `${subject.subjectName} - ${subject.subjectMedium} Medium`
                          : "--"}
                      </TableCell>
                      <TableCell align="center">{row.title}</TableCell>
                      <TableCell align="center">{row.academicWork}</TableCell>
                      <TableCell align="center">{row.date}</TableCell>
                      <TableCell align="center">
                        {row.time
                          ? format(
                              typeof row.time === "string"
                                ? new Date(row.time)
                                : row.time,
                              "hh:mm a",
                            )
                          : "--"}
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          size="small"
                          checked={Boolean(row?.isApproved ?? row?.approved)}
                          onChange={() => {
                            if (!row?.id) return;
                            approveAcademicWorkMutation({ id: row.id });
                          }}
                          disabled={isAcademicWorkApproving || !row?.id}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          variant="outlined"
                          color={
                            row?.isApproved || row?.approved
                              ? "success"
                              : "warning"
                          }
                          label={
                            row?.isApproved || row?.approved
                              ? "Approved"
                              : "Pending"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2">
                      {isLoading ? "" : "No teacher work records found"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Box
            sx={{
              p: 0.2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ alignContent: "center", ml: 1 }}>
              <Typography variant="subtitle2" color="var(--pallet-blue)">
                {`${format(selectedDate ?? new Date(), "MMMM dd, yyyy")}`}
              </Typography>
            </Box>
            <Box>
              <IconButton
                onClick={() => handleMoveMonth("prev")}
                disabled={!selectedDate || isLoading}
              >
                <KeyboardDoubleArrowRightIcon
                  fontSize="small"
                  sx={{
                    transform: "rotate(180deg)",
                    color: "var(--pallet-blue)",
                  }}
                />
              </IconButton>
              <IconButton
                onClick={() => handleMoveDate("prev")}
                disabled={!selectedDate || isLoading}
              >
                <NavigateNextIcon
                  fontSize="small"
                  sx={{
                    transform: "rotate(180deg)",
                    color: "var(--pallet-blue)",
                  }}
                />
              </IconButton>
              <IconButton
                onClick={() => handleMoveDate("next")}
                disabled={!selectedDate || isLoading}
              >
                <NavigateNextIcon
                  fontSize="small"
                  sx={{ color: "var(--pallet-blue)" }}
                />
              </IconButton>
              <IconButton
                onClick={() => handleMoveMonth("next")}
                disabled={!selectedDate || isLoading}
              >
                <KeyboardDoubleArrowRightIcon
                  fontSize="small"
                  sx={{ color: "var(--pallet-blue)" }}
                />
              </IconButton>
            </Box>
          </Box>
        </TableContainer>
      )}
    </Stack>
  );
};

export default TeacherWorkRecords;
