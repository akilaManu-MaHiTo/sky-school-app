import {
  useCallback,
  useMemo,
  useRef,
  ChangeEvent,
  useEffect,
  useState,
} from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Typography,
  Paper,
  Stack,
  useMediaQuery,
  Theme,
  Box,
  TextField,
  LinearProgress,
  Chip,
  IconButton,
  Switch,
  InputAdornment,
  Tooltip,
  Alert,
} from "@mui/material";
import ColumnVisibilitySelector from "../../components/ColumnVisibilitySelector";
import CustomButton from "../../components/CustomButton";
import useColumnVisibility, {
  ColumnDefinition,
} from "../../components/useColumnVisibility";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  submitStudentMarks,
  UpdateStudentMarks,
} from "../../api/StudentMarks/studentMarksApi";
import { useSnackbar } from "notistack";
import queryClient from "../../state/queryClient";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import StudentMarksExcelDownload from "./StudentMarksExcelDownload";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  StudentMarkRow,
  getMarkGrade,
  parseStudentMarksExcel,
} from "./studentMarksUtils";
import RefreshIcon from "@mui/icons-material/Refresh";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { generateStudentMarksPdf } from "../../reportsUtils/StudentMarksReportPDF";
import useCurrentOrganization from "../../hooks/useCurrentOrganization";
// Props Interface
interface StudentMarksTableProps {
  rows: StudentMarkRow[] | null;
  selectedTerm: string;
  selectedSubject: { id: number } | null;
  selectedYear: string;
  isDataLoading?: boolean;
  selectedMonth: string;
  refetchData?: () => void;
  selectedGrade: any;
  selectedClass: any;
  selectedMedium: any;
  studentCount: number;
}

// Form Values Interface
type FormValues = {
  studentMarks: Array<string | number | null>;
  isAbsentStudents: Array<boolean>;
};

// Interface For Mark Table Rows
type MarkMutationPayload = {
  studentProfileId: number;
  academicSubjectId: number;
  studentMark: string;
  markGrade: string;
  academicYear: string;
  academicTerm: string;
  markId?: string | number | null;
  isAbsentStudent?: boolean;
  selectedMonth: string;
};
const normalizeMarkValue = (
  value: string | number | null | undefined
): string => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
};

const deriveMarksFromRows = (rows: StudentMarkRow[] | null | undefined) =>
  (rows ?? []).map((row) => normalizeMarkValue(row.studentMark));

const deriveAbsencesFromRows = (rows: StudentMarkRow[] | null | undefined) =>
  (rows ?? []).map((row) => Boolean(row.isAbsentStudent));

const buildRowSignature = (
  rows: StudentMarkRow[] | null | undefined
): Array<{ key: string; mark: string; isAbsent: boolean }> =>
  (rows ?? []).map((row, index) => ({
    key: String(
      row.studentProfileId ?? row.student?.employeeNumber ?? `row-${index}`
    ),
    mark: normalizeMarkValue(row.studentMark),
    isAbsent: Boolean(row.isAbsentStudent),
  }));

// Color for marking grades
const gradeColorMap: Record<
  string,
  "success" | "info" | "warning" | "error" | "default"
> = {
  A: "success",
  B: "info",
  C: "warning",
  D: "warning",
  F: "error",
};

const MARK_RANGE_ERROR_MESSAGE = "Marks must be between 0 and 100";

const validateMarkRange = (
  value: string | number | null | undefined
): true | string => {
  if (value === "" || value === null || value === undefined) {
    return true;
  }
  if (typeof value === "string" && value.trim() === "") {
    return true;
  }
  const numericValue =
    typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(numericValue) || Number.isNaN(numericValue)) {
    return MARK_RANGE_ERROR_MESSAGE;
  }
  if (numericValue < 0 || numericValue > 100) {
    return MARK_RANGE_ERROR_MESSAGE;
  }
  return true;
};
const isMarkValueWithinRange = (
  value: string | number | null | undefined
): boolean => validateMarkRange(value) === true;

// Main Function
const StudentMarksTable = ({
  rows = [],
  selectedTerm,
  selectedSubject,
  selectedYear,
  isDataLoading,
  selectedMonth,
  refetchData,
  selectedGrade,
  selectedClass,
  selectedMedium,
  studentCount,
}: StudentMarksTableProps) => {
  //Utils
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Organization Details for PDF Header
  const { organization } = useCurrentOrganization();
  const organizationName = organization?.organizationName;

  // Input Refs and Debounce Setup
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const successToastTimeout = useRef<NodeJS.Timeout | null>(null);

  const filtersForExport = useMemo(() => {
    const filters: { label: string; value: string }[] = [];

    if (selectedYear) {
      const yearValue =
        (selectedYear as any)?.academicYear ??
        (selectedYear as any)?.year ??
        selectedYear;
      filters.push({ label: "Year", value: String(yearValue) });
    }

    if (selectedGrade) {
      const gradeValue = (selectedGrade as any)?.grade ?? selectedGrade;
      filters.push({ label: "Grade", value: `Grade ${gradeValue}` });
    }

    if (selectedClass) {
      const className = (selectedClass as any)?.className ?? selectedClass;
      filters.push({ label: "Class", value: String(className) });
    }

    if (selectedMedium) {
      const mediumName =
        (selectedMedium as any)?.academicMedium ?? selectedMedium;
      filters.push({ label: "Medium", value: String(mediumName) });
    }

    if (selectedSubject) {
      const subjectName =
        (selectedSubject as any)?.subjectName ??
        (selectedSubject as any)?.name ??
        (selectedSubject as any)?.id ??
        selectedSubject;
      filters.push({ label: "Subject", value: String(subjectName) });
    }

    if (selectedTerm) {
      filters.push({ label: "Exam", value: String(selectedTerm) });
    }

    if (selectedTerm === "Monthly Exam" && selectedMonth) {
      const monthLabel =
        (selectedMonth as any)?.label ??
        (selectedMonth as any)?.name ??
        selectedMonth;
      filters.push({ label: "Month", value: String(monthLabel) });
    }

    return filters;
  }, [
    selectedYear,
    selectedGrade,
    selectedClass,
    selectedMedium,
    selectedSubject,
    selectedTerm,
    selectedMonth,
  ]);

  //Use Form For the mutation
  const { control, watch, formState, setValue, getValues, reset } =
    useForm<FormValues>({
      mode: "onChange",
      reValidateMode: "onChange",
      defaultValues: {
        studentMarks: deriveMarksFromRows(rows),
        isAbsentStudents: deriveAbsencesFromRows(rows),
      },
    });

  // Enter Button For next textfield
  const focusNextField = (currentIndex: number) => {
    for (
      let nextIndex = currentIndex + 1;
      nextIndex < inputRefs.current.length;
      nextIndex += 1
    ) {
      const nextInput = inputRefs.current[nextIndex];
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
        break;
      }
    }
  };

  // Watched Variables
  const watchedMarks = watch("studentMarks") || [];
  const watchedAbsences = watch("isAbsentStudents") || [];
  const filteredRowEntries = useMemo(() => {
    const indexedRows = (rows ?? []).map((row, index) => ({ row, index }));
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return indexedRows;
    }
    return indexedRows.filter(({ row }) => {
      const haystack = [
        row.student?.employeeNumber,
        row.student?.name,
        row.grade?.grade ? `Grade ${row.grade.grade}` : "",
        row.class?.className,
        row.subject?.subjectName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [rows, searchQuery]);
  const resolvedSubjectName = useMemo(() => {
    if (!rows.length) {
      return undefined;
    }
    const rowWithSubject = rows.find(
      (studentRow) => studentRow.subject?.subjectName
    );
    return rowWithSubject?.subject?.subjectName ?? undefined;
  }, [rows]);
  const resolvedMonthlyTermLabel = useMemo(() => {
    const trimmedMonth = selectedMonth?.trim();
    if (selectedTerm === "Monthly Exam" && trimmedMonth) {
      return `${selectedTerm} - ${trimmedMonth}`;
    }
    return undefined;
  }, [selectedMonth, selectedTerm]);
  useEffect(() => {
    const signatureEntries = buildRowSignature(rows);
    const nextSignature = JSON.stringify(signatureEntries);

    if (nextSignature === lastSyncedSignatureRef.current) {
      return;
    }

    lastSyncedSignatureRef.current = nextSignature;
    reset({
      studentMarks: signatureEntries.map((entry) => entry.mark),
      isAbsentStudents: signatureEntries.map((entry) => entry.isAbsent),
    });
  }, [reset, rows]);
  const lastSyncedSignatureRef = useRef<string>(
    JSON.stringify(buildRowSignature(rows))
  );

  const getStudentKey = (
    admissionNumber?: string | null,
    studentName?: string | null
  ) => {
    if (!admissionNumber || !studentName) {
      return null;
    }

    const trimmedName = studentName.trim();
    const trimmedAdmission = admissionNumber.trim();

    if (!trimmedName || !trimmedAdmission) {
      return null;
    }

    return `${trimmedAdmission.toLowerCase()}|${trimmedName.toLowerCase()}`;
  };

  // Mutation for Submitting Marks
  const scheduleSuccessToast = useCallback(() => {
    if (successToastTimeout.current) {
      clearTimeout(successToastTimeout.current);
    }
    successToastTimeout.current = setTimeout(() => {
      enqueueSnackbar("Marks saved", { variant: "success" });
      successToastTimeout.current = null;
    }, 800);
  }, [enqueueSnackbar]);
  const { mutate: persistMarkMutation, isPending: isSavingMarks } = useMutation(
    {
      mutationFn: (payload: MarkMutationPayload) => {
        if (payload.markId !== undefined && payload.markId !== null) {
          const { markId, ...rest } = payload;
          return UpdateStudentMarks({
            ...rest,
            markId: String(markId),
            selectedMonth,
          });
        }
        return submitStudentMarks(payload);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["academic-student-marks"] });
        queryClient.invalidateQueries({ queryKey: ["class-report-bar-chart"] });
        queryClient.invalidateQueries({ queryKey: ["class-report-card"] });
        queryClient.invalidateQueries({ queryKey: ["class-report-all-card"] });
        // Ensure class report charts that aggregate across all terms and mark grades
        // are also refreshed after marks are saved/updated.
        queryClient.invalidateQueries({
          queryKey: ["class-report-all-bar-chart"],
        });
        queryClient.invalidateQueries({
          queryKey: ["class-report-all-bar-chart-mark-grades"],
        });
        queryClient.invalidateQueries({
          queryKey: ["class-report-mark-grades-table"],
        });
        queryClient.invalidateQueries({
          queryKey: ["class-report-all-mark-grades-table"],
        });
        scheduleSuccessToast();
      },
      onError: (error: any) => {
        const message = error?.data?.message || error?.message || "Failed";
        enqueueSnackbar(message, { variant: "error" });
      },
    }
  );

  // Debounced Mutation Function
  const debouncedMutation = useCallback(
    (studentProfileId: number, payload: MarkMutationPayload) => {
      const timeoutMap = debounceTimeouts.current;
      const existingTimeout = timeoutMap.get(studentProfileId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      const timeoutId = setTimeout(() => {
        persistMarkMutation(payload);
        timeoutMap.delete(studentProfileId);
      }, 750);
      timeoutMap.set(studentProfileId, timeoutId);
    },
    [persistMarkMutation]
  );

  const cancelPendingMutation = useCallback(
    (studentProfileId?: number | null) => {
      if (!studentProfileId) {
        return;
      }
      const timeoutMap = debounceTimeouts.current;
      const existingTimeout = timeoutMap.get(studentProfileId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        timeoutMap.delete(studentProfileId);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      debounceTimeouts.current.forEach((timeoutId) => clearTimeout(timeoutId));
      debounceTimeouts.current.clear();
      if (successToastTimeout.current) {
        clearTimeout(successToastTimeout.current);
      }
    };
  }, []);

  const triggerMarkMutation = useCallback(
    (
      row: StudentMarkRow,
      markValue: string | number | null,
      isAbsentStudent?: boolean,
      options?: { immediate?: boolean }
    ) => {
      if (!row.studentProfileId || !selectedSubject?.id) {
        return;
      }
      const studentMarkValue =
        markValue === null || markValue === undefined ? "" : String(markValue);
      if (!isMarkValueWithinRange(studentMarkValue)) {
        cancelPendingMutation(row.studentProfileId);
        return;
      }
      const normalizedAbsent =
        isAbsentStudent === undefined
          ? Boolean(row.isAbsentStudent)
          : isAbsentStudent;
      const markIdentifier =
        row.markId === undefined || row.markId === null || row.markId === ""
          ? undefined
          : row.markId;
      const payload = {
        studentProfileId: row.studentProfileId,
        academicSubjectId: selectedSubject.id,
        studentMark: studentMarkValue,
        markGrade: getMarkGrade(studentMarkValue),
        academicYear: selectedYear,
        academicTerm: selectedTerm,
        markId: markIdentifier,
        isAbsentStudent: normalizedAbsent,
        selectedMonth,
      };
      if (options?.immediate) {
        cancelPendingMutation(row.studentProfileId);
        persistMarkMutation(payload);
        return;
      }
      debouncedMutation(row.studentProfileId, payload);
    },
    [
      cancelPendingMutation,
      debouncedMutation,
      persistMarkMutation,
      selectedSubject,
      selectedTerm,
      selectedYear,
    ]
  );

  const handleExcelUpload = useCallback(
    async (file: File) => {
      try {
        const parsedRecords = await parseStudentMarksExcel(file);
        if (!parsedRecords.length) {
          enqueueSnackbar("No marks found in uploaded Excel", {
            variant: "warning",
          });
          return;
        }
        const markMap = new Map(
          parsedRecords.map(
            ({
              normalizedName,
              admissionNumber,
              studentMark,
              isAbsentStudent,
            }) => [
              `${admissionNumber}|${normalizedName}`,
              {
                mark:
                  studentMark === null || studentMark === undefined
                    ? ""
                    : String(studentMark),
                isAbsent: isAbsentStudent,
              },
            ]
          )
        );
        const marksFromForm = getValues("studentMarks");
        const absencesFromForm = getValues("isAbsentStudents");
        const currentMarks = marksFromForm
          ? [...marksFromForm]
          : deriveMarksFromRows(rows);
        const currentAbsences = absencesFromForm
          ? [...absencesFromForm]
          : deriveAbsencesFromRows(rows);
        const pendingUpdates: Array<{
          row: StudentMarkRow;
          mark: string;
          isAbsent: boolean;
        }> = [];
        let appliedCount = 0;
        rows.forEach((row, index) => {
          const rowKey = getStudentKey(
            row.student?.employeeNumber ?? null,
            row.student?.nameWithInitials ?? row.student?.name ?? null
          );
          if (!rowKey) {
            return;
          }
          if (markMap.has(rowKey)) {
            appliedCount += 1;
            const mappedValue = markMap.get(rowKey);
            const hasExcelAbsent =
              mappedValue?.isAbsent !== undefined &&
              mappedValue?.isAbsent !== null;
            const resolvedAbsent = hasExcelAbsent
              ? Boolean(mappedValue?.isAbsent)
              : currentAbsences[index] ?? Boolean(row.isAbsentStudent);
            const markValue = resolvedAbsent ? "" : mappedValue?.mark ?? "";
            currentMarks[index] = markValue;
            currentAbsences[index] = resolvedAbsent;
            pendingUpdates.push({
              row,
              mark: markValue,
              isAbsent: resolvedAbsent,
            });
          }
        });
        if (!appliedCount) {
          enqueueSnackbar("Uploaded Excel does not match any students", {
            variant: "warning",
          });
          return;
        }
        setValue("studentMarks", currentMarks, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("isAbsentStudents", currentAbsences, {
          shouldDirty: true,
          shouldValidate: true,
        });
        pendingUpdates.forEach(({ row, mark, isAbsent }) => {
          triggerMarkMutation(row, mark, isAbsent, { immediate: true });
        });
        enqueueSnackbar(
          `Applied marks for ${appliedCount} student${
            appliedCount > 1 ? "s" : ""
          }`,
          {
            variant: "success",
          }
        );
      } catch (error) {
        enqueueSnackbar("Failed to read Excel file", { variant: "error" });
      }
    },
    [
      enqueueSnackbar,
      getValues,
      getStudentKey,
      rows,
      setValue,
      triggerMarkMutation,
    ]
  );

  const handleExcelInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleExcelUpload(file);
      }
      event.target.value = "";
    },
    [handleExcelUpload]
  );

  // Column Definitions and Visibility Setup
  const columns = useMemo<ColumnDefinition[]>(
    () => [
      { key: "markId", label: "Mark Id" },
      { key: "admissionNumber", label: "Admission Number" },
      { key: "name", label: "Name" },
      { key: "academicYear", label: "Academic Year", defaultVisible: false },
      { key: "academicTerm", label: "Academic Term" },
      { key: "academicMedium", label: "Medium", defaultVisible: false },
      { key: "grade", label: "Grade" },
      { key: "className", label: "Class" },
      { key: "subjectName", label: "Subject" },
      { key: "isAbsentStudent", label: "Is Absent" },
      { key: "studentMark", label: "Mark" },
      { key: "markGrade", label: "Grade Mark" },
    ],
    []
  );
  const { visibility, columnSelectorProps } = useColumnVisibility({ columns });
  const visibleColumnCount = useMemo(
    () => columns.filter((col) => visibility[col.key]).length,
    [columns, visibility]
  );

  const marksDataForExport = useMemo<StudentMarkRow[]>(() => {
    if (!filteredRowEntries.length) {
      return [];
    }
    return filteredRowEntries.map(({ row, index }) => {
      const watchedValue = watchedMarks[index];
      const hasWatchedValue =
        watchedValue !== undefined && watchedValue !== null;
      const watchedAbsent = watchedAbsences[index];
      const hasAbsentValue = watchedAbsent !== undefined;
      const isAbsentValue = hasAbsentValue
        ? watchedAbsent
        : Boolean(row.isAbsentStudent);
      const markValue = hasWatchedValue ? watchedValue : row.studentMark;
      const gradeValue = isAbsentValue
        ? "Absent"
        : hasWatchedValue && watchedValue !== ""
        ? isMarkValueWithinRange(watchedValue)
          ? getMarkGrade(watchedValue)
          : "-"
        : row.markGrade ??
          (row.studentMark !== undefined ? getMarkGrade(row.studentMark) : "-");
      const academicTermValue =
        resolvedMonthlyTermLabel !== undefined
          ? resolvedMonthlyTermLabel
          : row.academicTerm;
      return {
        ...row,
        studentMark: markValue,
        markGrade: gradeValue,
        isAbsentStudent: isAbsentValue,
        academicTerm: academicTermValue,
      };
    });
  }, [
    filteredRowEntries,
    resolvedMonthlyTermLabel,
    watchedAbsences,
    watchedMarks,
  ]);
  const handleDownloadPdf = useCallback(() => {
    if (!marksDataForExport.length) {
      enqueueSnackbar("No student marks to export", { variant: "warning" });
      return;
    }
    try {
      generateStudentMarksPdf(marksDataForExport, {
        organizationName,
        subjectName: resolvedSubjectName,
        academicYear: selectedYear,
        academicTerm: resolvedMonthlyTermLabel ?? selectedTerm,
        title: "Student Marks Report",
        columns,
        visibility,
        filters: filtersForExport,
      });
    } catch (error) {
      console.error("Unable to generate student marks PDF:", error);
      enqueueSnackbar("Unable to generate PDF", { variant: "error" });
    }
  }, [
    enqueueSnackbar,
    marksDataForExport,
    organizationName,
    resolvedMonthlyTermLabel,
    resolvedSubjectName,
    selectedTerm,
    selectedYear,
    columns,
    visibility,
    filtersForExport,
  ]);

  return (
    <Box>
      <Stack
        sx={{
          backgroundColor: "#fff",
          borderRadius: 2,
        }}
      >
        <Stack
          direction={isMobile ? "column" : "row"}
          gap={isMobile ? 2 : 3}
          sx={{
            justifyContent: "space-between",
          }}
          alignItems={isMobile ? "stretch" : "center"}
          p={isMobile ? 1.5 : 2}
        >
          <Stack
            direction={isMobile ? "column" : "row"}
            gap={isMobile ? 1.5 : 2}
            alignItems={isMobile ? "stretch" : "center"}
            flex={1}
          >
            <TextField
              label="Search Students"
              size="small"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              sx={{ minWidth: isMobile ? "100%" : 250 }}
              fullWidth={isMobile}
              placeholder="Name or admission no."
            />
            {!isMobile && (
              <ColumnVisibilitySelector
                {...columnSelectorProps}
                popoverTitle="Hide Columns"
                buttonText={isMobile ? "" : "Columns"}
              />
            )}
          </Stack>

          <Stack
            direction="row"
            gap={isMobile ? 1 : 2}
            alignItems="center"
            justifyContent={isMobile ? "flex-end" : "flex-start"}
            flexWrap={isMobile ? "wrap" : "nowrap"}
          >
            <Tooltip title="Refresh marks">
              <IconButton onClick={() => refetchData?.()}>
                <RefreshIcon fontSize="medium" color="info" />
              </IconButton>
            </Tooltip>
            <StudentMarksExcelDownload
              marksData={marksDataForExport}
              columns={columns}
              visibility={visibility}
              isLoading={isDataLoading || isSavingMarks}
              displayMode={isMobile ? "icon" : "button"}
              tooltip="Download Excel"
              filters={filtersForExport}
            />
            {isMobile ? (
              <Tooltip title="Download PDF">
                <span>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={handleDownloadPdf}
                    disabled={
                      isDataLoading ||
                      isSavingMarks ||
                      !marksDataForExport.length
                    }
                  >
                    <PictureAsPdfIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <CustomButton
                variant="outlined"
                size="medium"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleDownloadPdf}
                disabled={
                  isDataLoading || isSavingMarks || !marksDataForExport.length
                }
              >
                Download PDF
              </CustomButton>
            )}
            {isMobile ? (
              <Tooltip title="Upload Excel">
                <span>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => excelInputRef.current?.click()}
                    disabled={isDataLoading}
                  >
                    <UploadFileIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <CustomButton
                variant="outlined"
                size="medium"
                startIcon={<UploadFileIcon />}
                onClick={() => excelInputRef.current?.click()}
                disabled={isDataLoading}
              >
                Upload Excel
              </CustomButton>
            )}
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={excelInputRef}
              onChange={handleExcelInputChange}
              style={{ display: "none" }}
            />
            {isMobile && (
              <ColumnVisibilitySelector
                {...columnSelectorProps}
                popoverTitle="Hide Columns"
                buttonText={isMobile ? "" : "Columns"}
              />
            )}
          </Stack>
        </Stack>
        <Alert severity="info" sx={{ mb: 2 }}>
          Student Count {studentCount}
        </Alert>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            overflowX: "auto",
            maxWidth: isMobile ? "80vw" : "100%",
          }}
        >
          {isDataLoading && <LinearProgress sx={{ width: "100%" }} />}
          <Table aria-label="simple table">
            <TableHead sx={{ backgroundColor: "#f3f3f3ff" }}>
              <TableRow>
                {visibility.markId && <TableCell>Is Marked</TableCell>}
                {visibility.admissionNumber && (
                  <TableCell>Admission Number</TableCell>
                )}
                {visibility.name && <TableCell>Name</TableCell>}
                {visibility.academicYear && (
                  <TableCell>Academic Year</TableCell>
                )}
                {visibility.academicTerm &&
                  (selectedTerm === "Monthly Exam" ? (
                    <TableCell>Month</TableCell>
                  ) : (
                    <TableCell>Academic Term</TableCell>
                  ))}

                {visibility.academicMedium && <TableCell>Medium</TableCell>}
                {visibility.grade && <TableCell>Grade</TableCell>}
                {visibility.className && <TableCell>Class</TableCell>}
                {visibility.subjectName && <TableCell>Subject</TableCell>}
                {visibility.isAbsentStudent && <TableCell>Is Absent</TableCell>}
                {visibility.studentMark && <TableCell>Mark</TableCell>}
                {visibility.markGrade && <TableCell>Grade Mark</TableCell>}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRowEntries.length ? (
                filteredRowEntries.map(({ row, index }) => {
                  const watchedValue = watchedMarks[index];
                  const watchedAbsent = watchedAbsences[index];
                  const hasAbsentValue = watchedAbsent !== undefined;
                  const currentIsAbsent = hasAbsentValue
                    ? watchedAbsent
                    : Boolean(row.isAbsentStudent);
                  const hasWatchedValue =
                    watchedValue !== undefined &&
                    watchedValue !== null &&
                    watchedValue !== "";
                  const shouldUseWatchedGrade =
                    hasWatchedValue && isMarkValueWithinRange(watchedValue);
                  const baseGrade = hasWatchedValue
                    ? shouldUseWatchedGrade
                      ? getMarkGrade(watchedValue)
                      : "-"
                    : row.markGrade ??
                      (row.studentMark !== undefined
                        ? getMarkGrade(row.studentMark)
                        : "-");
                  const displayGrade = currentIsAbsent ? "Absent" : baseGrade;
                  const markError = formState.errors?.studentMarks?.[index];
                  const markErrorMessage =
                    typeof markError?.message === "string"
                      ? markError.message
                      : undefined;

                  return (
                    <TableRow
                      key={row.id ?? index}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      {visibility.markId && (
                        <TableCell>
                          {row.markId ? (
                            <IconButton
                              size="small"
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                backgroundColor: "var(--pallet-green)",
                              }}
                            >
                              <CheckIcon
                                sx={{ color: "#fff" }}
                                fontSize="small"
                              />
                            </IconButton>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      )}
                      {visibility.admissionNumber && (
                        <TableCell>
                          {row.student?.employeeNumber ?? "-"}
                        </TableCell>
                      )}
                      {visibility.name && (
                        <TableCell>
                          {row.student?.nameWithInitials ?? "-"}
                        </TableCell>
                      )}
                      {visibility.academicYear && (
                        <TableCell>{row.academicYear ?? "-"}</TableCell>
                      )}
                      {visibility.academicTerm && (
                        <TableCell>{row.academicTerm ?? "-"}</TableCell>
                      )}
                      {visibility.academicMedium && (
                        <TableCell>{row.academicMedium ?? "-"}</TableCell>
                      )}
                      {visibility.grade && (
                        <TableCell>
                          {row.grade?.grade ? `Grade ${row.grade.grade}` : "-"}
                        </TableCell>
                      )}
                      {visibility.className && (
                        <TableCell>{row.class?.className ?? "-"}</TableCell>
                      )}
                      {visibility.subjectName && (
                        <TableCell>{row.subject?.subjectName ?? "-"}</TableCell>
                      )}

                      {visibility.isAbsentStudent && (
                        <TableCell>
                          <Controller
                            name={`isAbsentStudents.${index}` as const}
                            control={control}
                            render={({ field }) => (
                              <Switch
                                {...field}
                                size="small"
                                checked={Boolean(field.value)}
                                onChange={(event) => {
                                  const checked = event.target.checked;
                                  field.onChange(checked);
                                  const markFieldName =
                                    `studentMarks.${index}` as const;
                                  if (checked) {
                                    setValue(markFieldName, "", {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });
                                  }
                                  const latestMark = checked
                                    ? ""
                                    : normalizeMarkValue(
                                        getValues(markFieldName) ??
                                          row.studentMark
                                      );
                                  triggerMarkMutation(
                                    row,
                                    latestMark,
                                    checked,
                                    { immediate: true }
                                  );
                                }}
                              />
                            )}
                          />
                        </TableCell>
                      )}

                      {visibility.studentMark && (
                        <TableCell sx={{ minWidth: 160 }}>
                          <Controller
                            name={`studentMarks.${index}`}
                            control={control}
                            rules={{
                              validate: (value) => validateMarkRange(value),
                            }}
                            render={({ field }) => {
                              const showClearButton =
                                !currentIsAbsent &&
                                field.value !== undefined &&
                                field.value !== null &&
                                field.value !== "";

                              const handleClearMark = () => {
                                field.onChange("");
                                cancelPendingMutation(row.studentProfileId);
                                triggerMarkMutation(row, "", currentIsAbsent, {
                                  immediate: true,
                                });
                                const input = inputRefs.current[index];
                                if (input) {
                                  input.focus();
                                }
                              };

                              return (
                                <TextField
                                  {...field}
                                  defaultValue={row.studentMark}
                                  id={`studentMark-${index}`}
                                  label={row.student?.employeeNumber ?? "Mark"}
                                  size="small"
                                  error={Boolean(markErrorMessage)}
                                  helperText={markErrorMessage}
                                  fullWidth
                                  inputRef={(el) => {
                                    inputRefs.current[index] = el;
                                  }}
                                  disabled={currentIsAbsent}
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      event.preventDefault();
                                      focusNextField(index);
                                    }
                                  }}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (
                                      val === "" ||
                                      /^-?\d*\.?\d*$/.test(val)
                                    ) {
                                      field.onChange(val);
                                      if (isMarkValueWithinRange(val)) {
                                        triggerMarkMutation(
                                          row,
                                          val,
                                          currentIsAbsent
                                        );
                                      } else {
                                        cancelPendingMutation(
                                          row.studentProfileId
                                        );
                                      }
                                    }
                                  }}
                                  value={field.value ?? ""}
                                  InputProps={{
                                    endAdornment: showClearButton ? (
                                      <InputAdornment position="end">
                                        <IconButton
                                          aria-label="Clear mark"
                                          size="small"
                                          onClick={handleClearMark}
                                        >
                                          <ClearIcon fontSize="small" />
                                        </IconButton>
                                      </InputAdornment>
                                    ) : undefined,
                                  }}
                                />
                              );
                            }}
                          />
                        </TableCell>
                      )}

                      {visibility.markGrade && (
                        <TableCell>
                          {displayGrade && displayGrade !== "-" ? (
                            <Chip
                              label={displayGrade}
                              color={
                                displayGrade === "Absent"
                                  ? "default"
                                  : gradeColorMap[displayGrade] ?? "default"
                              }
                              size="small"
                              sx={{
                                fontWeight: 600,
                                color:
                                  displayGrade === "Absent"
                                    ? undefined
                                    : "#fff",
                                backgroundColor:
                                  displayGrade === "S" ? "orange" : undefined,
                              }}
                            />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumnCount || columns.length}
                    align="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery.trim()
                        ? "No students match the search."
                        : "No student marks found."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Box>
  );
};

export default StudentMarksTable;
