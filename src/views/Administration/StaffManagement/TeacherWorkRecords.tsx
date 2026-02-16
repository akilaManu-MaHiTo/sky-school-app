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
import queryClient from "../../../state/queryClient";
import { useSnackbar } from "notistack";

type TeacherWorkRecordsFilters = {
  year: AcademicYear | null;
  grade: AcademicGrade | null;
  class: AcademicClass | null;
  date: Date | null;
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
    },
  });

  const selectedYear = watch("year");
  const selectedGrade = watch("grade");
  const selectedClass = watch("class");
  const selectedDate = watch("date");

  const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

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
        !!selectedYear?.year &&
        !!selectedGrade?.id &&
        !!selectedClass?.id &&
        !!formattedDate,
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
                reset({ year: null, grade: null, class: null, date: null });
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
