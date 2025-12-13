import { useCallback, useMemo, useRef, ChangeEvent, useEffect } from "react";
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
  Button,
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
import StudentMarksExcelDownload from "./StudentMarksExcelDownload";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  StudentMarkRow,
  getMarkGrade,
  parseStudentMarksExcel,
} from "./studentMarksUtils";

// Props Interface
interface StudentMarksTableProps {
  rows: StudentMarkRow[] | null;
  selectedTerm: string;
  selectedSubject: { id: number } | null;
  selectedYear: string;
  isDataLoading?: boolean;
  refetchData?: () => void;
}
// Interface For Mark Table Rows
// Form Values Interface
type FormValues = {
  studentMarks: Array<string | number | null>;
};
type MarkMutationPayload = {
  studentProfileId: number;
  academicSubjectId: number;
  studentMark: string;
  markGrade: string;
  academicYear: string;
  academicTerm: string;
  markId?: string | number | null;
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

const buildRowSignature = (
  rows: StudentMarkRow[] | null | undefined
): Array<{ key: string; mark: string }> =>
  (rows ?? []).map((row, index) => ({
    key: String(
      row.studentProfileId ?? row.student?.employeeNumber ?? `row-${index}`
    ),
    mark: normalizeMarkValue(row.studentMark),
  }));
const gradeColorMap: Record<
  string,
  "success" | "info" | "warning" | "error" | "default"
> = {
  A: "success", // Green
  B: "info", // Blue
  C: "warning", // Yellow
  D: "warning", // Orange-ish (MUI warning leans yellow-orange)
  F: "error", // Red
};
const StudentMarksTable = ({
  rows = [],
  selectedTerm,
  selectedSubject,
  selectedYear,
  isDataLoading,
  refetchData,
}: StudentMarksTableProps) => {
  // Input Refs and Debounce Setup
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const successToastTimeout = useRef<NodeJS.Timeout | null>(null);
  const { control, watch, formState, setValue, getValues, reset } =
    useForm<FormValues>({
      defaultValues: {
        studentMarks: deriveMarksFromRows(rows),
      },
    });
  const { enqueueSnackbar } = useSnackbar();
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );
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
  const watchedMarks = watch("studentMarks") || [];
  useEffect(() => {
    const signatureEntries = buildRowSignature(rows);
    const nextSignature = JSON.stringify(signatureEntries);

    if (nextSignature === lastSyncedSignatureRef.current) {
      return;
    }

    lastSyncedSignatureRef.current = nextSignature;
    reset({ studentMarks: signatureEntries.map((entry) => entry.mark) });
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
  const { mutate: persistMarkMutation, isPending: isSavingMarks } = useMutation({
    mutationFn: (payload: MarkMutationPayload) => {
      if (payload.markId !== undefined && payload.markId !== null) {
        const { markId, ...rest } = payload;
        return UpdateStudentMarks({
          ...rest,
          markId: String(markId),
        });
      }
      return submitStudentMarks(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-student-marks"] });
      scheduleSuccessToast();
    },
    onError: (error: any) => {
      const message = error?.data?.message || error?.message || "Failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
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
      }, 2000);
      timeoutMap.set(studentProfileId, timeoutId);
    },
    [persistMarkMutation]
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
    (row: StudentMarkRow, markValue: string | number | null) => {
      if (!row.studentProfileId || !selectedSubject?.id) {
        return;
      }
      const studentMarkValue =
        markValue === null || markValue === undefined ? "" : String(markValue);
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
      };
      debouncedMutation(row.studentProfileId, payload);
    },
    [debouncedMutation, selectedSubject, selectedTerm, selectedYear]
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
            ({ normalizedName, admissionNumber, studentMark }) => [
              `${admissionNumber}|${normalizedName}`,
              studentMark === null || studentMark === undefined
                ? ""
                : String(studentMark),
            ]
          )
        );
        const currentMarks = [...(getValues("studentMarks") ?? [])];
        const pendingUpdates: Array<{ row: StudentMarkRow; mark: string }> = [];
        let appliedCount = 0;
        rows.forEach((row, index) => {
          const rowKey = getStudentKey(
            row.student?.employeeNumber ?? null,
            row.student?.name ?? null
          );
          if (!rowKey) {
            return;
          }
          if (markMap.has(rowKey)) {
            appliedCount += 1;
            const markValue = markMap.get(rowKey) ?? "";
            currentMarks[index] = markValue;
            pendingUpdates.push({ row, mark: markValue });
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
        pendingUpdates.forEach(({ row, mark }) => {
          triggerMarkMutation(row, mark);
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
      { key: "academicYear", label: "Academic Year" },
      { key: "academicTerm", label: "Academic Term" },
      { key: "academicMedium", label: "Medium" },
      { key: "grade", label: "Grade" },
      { key: "className", label: "Class" },
      { key: "subjectName", label: "Subject" },
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
    if (!rows?.length) {
      return [];
    }
    return rows.map((row, index) => {
      const watchedValue = watchedMarks[index];
      const hasWatchedValue = watchedValue !== undefined;
      const markValue = hasWatchedValue ? watchedValue : row.studentMark;
      const gradeValue =
        hasWatchedValue && watchedValue !== ""
          ? getMarkGrade(watchedValue)
          : row.markGrade ??
            (row.studentMark !== undefined
              ? getMarkGrade(row.studentMark)
              : "-");
      return {
        ...row,
        studentMark: markValue,
        markGrade: gradeValue,
      };
    });
  }, [rows, watchedMarks]);

  return (
    <Box>
      <Stack
        sx={{
          backgroundColor: "#fff",
          borderRadius: 2,
        }}
      >
        <Stack
          direction="row"
          gap={isMobile && 1}
          sx={{
            justifyContent: isMobile ? "flex-end" : "space-between",
          }}
          alignItems="center"
          flexDirection={isMobile ? "column" : "row"}
          p={2}
        >
          <ColumnVisibilitySelector
            {...columnSelectorProps}
            popoverTitle="Hide Columns"
            buttonText="Columns"
          />
          <Stack
            direction={isMobile ? "column" : "row"}
            gap={1}
            alignItems="center"
          >
            <StudentMarksExcelDownload
              marksData={marksDataForExport}
              columns={columns}
              visibility={visibility}
              isLoading={isDataLoading || isSavingMarks}
              sx={{
                backgroundColor: "var(--pallet-blue)",
              }}
            />
            <Button onClick={() => refetchData?.()}>Refresh</Button>
            <CustomButton
              variant="outlined"
              size="medium"
              startIcon={<UploadFileIcon />}
              onClick={() => excelInputRef.current?.click()}
              disabled={isDataLoading}
            >
              Upload Excel
            </CustomButton>
            <input
              type="file"
              accept=".xlsx,.xls"
              ref={excelInputRef}
              onChange={handleExcelInputChange}
              style={{ display: "none" }}
            />
          </Stack>
        </Stack>
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
                {visibility.academicTerm && (
                  <TableCell>Academic Term</TableCell>
                )}
                {visibility.academicMedium && <TableCell>Medium</TableCell>}
                {visibility.grade && <TableCell>Grade</TableCell>}
                {visibility.className && <TableCell>Class</TableCell>}
                {visibility.subjectName && <TableCell>Subject</TableCell>}
                {visibility.studentMark && <TableCell>Mark</TableCell>}
                {visibility.markGrade && <TableCell>Grade Mark</TableCell>}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length ? (
                rows.map((row, index) => {
                  const watchedValue = watchedMarks[index];
                  const computedGrade =
                    watchedValue !== undefined && watchedValue !== ""
                      ? getMarkGrade(watchedValue)
                      : row.markGrade ??
                        (row.studentMark !== undefined
                          ? getMarkGrade(row.studentMark)
                          : "-");

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
                        <TableCell>{row.student?.name ?? "-"}</TableCell>
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

                      {visibility.studentMark && (
                        <TableCell sx={{ minWidth: 160 }}>
                          <Controller
                            name={`studentMarks.${index}`}
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                defaultValue={row.studentMark}
                                id={`studentMark-${index}`}
                                label={row.student?.employeeNumber ?? "Mark"}
                                size="small"
                                error={
                                  !!formState.errors?.studentMarks?.[index]
                                }
                                fullWidth
                                inputRef={(el) => {
                                  inputRefs.current[index] = el;
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    focusNextField(index);
                                  }
                                }}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "" || /^-?\d*\.?\d*$/.test(val)) {
                                    field.onChange(val);
                                    triggerMarkMutation(row, val);
                                  }
                                }}
                                value={field.value ?? ""}
                              />
                            )}
                          />
                        </TableCell>
                      )}

                      {visibility.markGrade && (
                        <TableCell>
                          {computedGrade ? (
                            <Chip
                              label={computedGrade}
                              color={gradeColorMap[computedGrade] ?? "default"}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                color: "#fff",
                                backgroundColor:
                                  computedGrade === "S" ? "orange" : undefined,
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
                      No student marks found.
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
