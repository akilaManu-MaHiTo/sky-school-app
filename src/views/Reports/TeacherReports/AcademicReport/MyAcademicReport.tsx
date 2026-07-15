import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Stack,
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
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
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import theme from "../../../../theme";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";

import { Controller, useForm } from "react-hook-form";

import {
  AcademicClass,
  AcademicGrade,
  getClassesData,
  getGradesData,
  getMyWorkRecords,
} from "../../../../api/OrganizationSettings/academicGradeApi";
import useIsMobile from "../../../../customHooks/useIsMobile";
import useCurrentUser from "../../../../hooks/useCurrentUser";
import DatePickerComponent from "../../../../components/DatePickerComponent";
import { addDays, format, subDays } from "date-fns";

type MyAcademicReportForm = {
  date: Date | null;
  grade: AcademicGrade | null;
  class: AcademicClass | null;
};

type MyAcademicWorkRecord = {
  id?: number;
  teacherId?: number;
  subjectId?: number;
  title?: string;
  academicWork?: string;
  date?: string;
  time?: string | Date;
  approved?: number | boolean;
  isApproved?: boolean;
  gradeId?: number;
  classId?: number;
  grade?: AcademicGrade | null;
  class?: AcademicClass | null;
  teacherGrade?: AcademicGrade | null;
  teacherClass?: AcademicClass | null;
  teacherProfile?: {
    academicGradeId?: number;
    academicClassId?: number;
    grade?: AcademicGrade | null;
    class?: AcademicClass | null;
  } | null;
  teacher?: {
    name?: string | null;
    userName?: string | null;
    nameWithInitials?: string | null;
  } | null;
  subject?: {
    subjectName?: string | null;
    subjectMedium?: string | null;
  } | null;
};

const breadcrumbItems = [
  { title: "Home", href: "/home" },
  { title: "Reports" },
  { title: "Teacher Reports" },
  { title: "Student Report" },
];

export default function MyAcademicReport() {
  const {
    watch,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<MyAcademicReportForm>({
    defaultValues: {
      date: new Date(),
      grade: null,
      class: null,
    },
  });

  const { user } = useCurrentUser();

  const selectedDate = watch("date");
  const selectedGrade = watch("grade");
  const selectedClass = watch("class");
  const formattedDate = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : "";
  const { data: gradeData, isFetching: isGradeDataFetching } = useQuery({
    queryKey: ["academic-grades"],
    queryFn: getGradesData,
  });
  const { data: classData, isFetching: isClassDataFetching } = useQuery({
    queryKey: ["academic-classes"],
    queryFn: getClassesData,
  });
  const { data: myWorkRecordsData, isFetching: isMyWorkRecordsDataFetching } =
    useQuery({
      queryKey: ["my-work", user?.id, formattedDate],
      queryFn: () => getMyWorkRecords(user?.id ?? 0, formattedDate),
      enabled: !!user?.id && !!formattedDate,
    });
  const { isMobile, isTablet } = useIsMobile();

  const filteredClassOptions = Array.isArray(classData)
    ? classData.filter((academicClass: AcademicClass) =>
        selectedGrade?.id ? academicClass.gradeId === selectedGrade.id : true,
      )
    : [];

  const workRecords: MyAcademicWorkRecord[] = Array.isArray(myWorkRecordsData)
    ? myWorkRecordsData
    : Array.isArray(myWorkRecordsData?.rows)
      ? myWorkRecordsData.rows
      : [];

  const getRecordGrade = (record: MyAcademicWorkRecord) =>
    record.grade ??
    record.teacherGrade ??
    record.teacherProfile?.grade ??
    null;

  const getRecordClass = (record: MyAcademicWorkRecord) =>
    record.class ??
    record.teacherClass ??
    record.teacherProfile?.class ??
    null;

  const getRecordGradeId = (record: MyAcademicWorkRecord) =>
    record.gradeId ?? record.teacherProfile?.academicGradeId ?? getRecordGrade(record)?.id;

  const getRecordClassId = (record: MyAcademicWorkRecord) =>
    record.classId ?? record.teacherProfile?.academicClassId ?? getRecordClass(record)?.id;

  const filteredWorkRecords = workRecords.filter((record) => {
    const recordGradeId = getRecordGradeId(record);
    const recordClassId = getRecordClassId(record);

    const gradeMatches = !selectedGrade?.id || !recordGradeId || recordGradeId === selectedGrade.id;
    const classMatches = !selectedClass?.id || !recordClassId || recordClassId === selectedClass.id;

    return gradeMatches && classMatches;
  });

  const handleMoveDate = (direction: "prev" | "next") => {
    if (!selectedDate) return;
    const nextDate = direction === "next" ? addDays(selectedDate, 1) : subDays(selectedDate, 1);
    setValue("date", nextDate, { shouldDirty: true });
  };

  const isLoading =
    isGradeDataFetching ||
    isClassDataFetching ||
    isMyWorkRecordsDataFetching;

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
        <PageTitle title="My Academic Report" />
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
          <Typography variant="subtitle2">Academic Filters</Typography>
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
              {/* <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
                <Controller
                  name="grade"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      value={field.value ?? null}
                      onChange={(e, newVal) => {
                        field.onChange(newVal);
                        setValue("class", null);
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
                          label="Select Grade"
                          name="grade"
                        />
                      )}
                    />
                  )}
                />
              </Box> */}

              {/* <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
                <Controller
                  name="class"
                  control={control}
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
                          label="Select Class"
                          name="class"
                        />
                      )}
                    />
                  )}
                />
              </Box> */}

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
          </Stack>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
              mt: 2,
              px: 1,
              py: 1,
              borderRadius: 2,
              backgroundColor: "var(--pallet-lighter-blue)",
            }}
          >
            <IconButton
              onClick={() => handleMoveDate("prev")}
              disabled={!selectedDate || isLoading}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <Typography variant="subtitle2" fontWeight={600}>
              {selectedDate ? format(selectedDate, "MMMM dd, yyyy") : "Select a date"}
            </Typography>
            <IconButton
              onClick={() => handleMoveDate("next")}
              disabled={!selectedDate || isLoading}
            >
              <NavigateNextIcon />
            </IconButton>
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
          </Box>
        </AccordionDetails>
      </Accordion>
      {!selectedDate && (
        <Alert severity="info" sx={{ marginTop: 2 }}>
          Please select a date to view academic records.
        </Alert>
      )}

      {selectedDate && (
        <TableContainer
          component={Paper}
          sx={{
            overflowX: "auto",
            maxWidth: isMobile ? "65vw" : "100%",
            marginTop: theme.spacing(2),
          }}
        >
          {isLoading && <LinearProgress sx={{ width: "100%" }} />}
          <Table aria-label="my academic report table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell align="center">Date</TableCell>
                <TableCell align="center">Teacher</TableCell>
                <TableCell align="center">Grade</TableCell>
                <TableCell align="center">Class</TableCell>
                <TableCell align="center">Subject</TableCell>
                <TableCell align="center">Title</TableCell>
                <TableCell align="center">Academic Work</TableCell>
                <TableCell align="center">Time</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWorkRecords.length > 0 ? (
                filteredWorkRecords.map((row) => {
                  const teacher = row.teacher ?? null;
                  const subject = row.subject ?? null;

                  return (
                    <TableRow key={String(row.id ?? `${row.date}-${row.title}`)} hover>
                      <TableCell align="center">{row.date ?? formattedDate}</TableCell>
                      <TableCell align="center">
                        {teacher?.nameWithInitials ??
                          teacher?.name ??
                          teacher?.userName ??
                          "--"}
                      </TableCell>
                      <TableCell align="center">
                        {getRecordGrade(row)?.grade
                          ? `Grade ${getRecordGrade(row)?.grade}`
                          : getRecordGradeId(row)
                            ? `Grade ${getRecordGradeId(row)}`
                            : "--"}
                      </TableCell>
                      <TableCell align="center">
                        {getRecordClass(row)?.className ??
                          (getRecordClassId(row) ? String(getRecordClassId(row)) : "--")}
                      </TableCell>
                      <TableCell align="center">
                        {subject
                          ? `${subject.subjectName ?? ""}${subject.subjectMedium ? ` - ${subject.subjectMedium}` : ""}`
                          : "--"}
                      </TableCell>
                      <TableCell align="center">{row.title ?? "--"}</TableCell>
                      <TableCell align="center">{row.academicWork ?? "--"}</TableCell>
                      <TableCell align="center">
                        {row.time
                          ? format(
                              typeof row.time === "string" ? new Date(row.time) : row.time,
                              "hh:mm a",
                            )
                          : "--"}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          variant="outlined"
                          color={row.approved || row.isApproved ? "success" : "warning"}
                          label={row.approved || row.isApproved ? "Approved" : "Pending"}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2">
                      {isLoading ? "" : "No academic records found for the selected filters"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
