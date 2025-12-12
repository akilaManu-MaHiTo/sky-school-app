import { useCallback, useEffect, useMemo, useRef } from "react";
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
} from "@mui/material";
import ColumnVisibilitySelector from "../../components/ColumnVisibilitySelector";
import useColumnVisibility, {
  ColumnDefinition,
} from "../../components/useColumnVisibility";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { submitStudentMarks } from "../../api/StudentMarks/studentMarksApi";
import { useSnackbar } from "notistack";
import queryClient from "../../state/queryClient";
import CheckIcon from "@mui/icons-material/Check";
// Props Interface
interface StudentMarksTableProps {
  rows: StudentMarkRow[] | null;
  selectedTerm: string;
  selectedSubject: { id: number } | null;
  selectedYear: string;
  isDataLoading?: boolean;
}
// Interface For Mark Table Rows
interface StudentMarkRow {
  studentProfileId?: number;
  markId?: boolean;
  id?: number | string;
  academicYear?: string;
  academicTerm?: string;
  academicMedium?: string;
  grade?: { grade?: string } | null;
  class?: { className?: string } | null;
  subject?: { subjectName?: string } | null;
  student?: { name?: string; employeeNumber?: string } | null;
  studentMark?: string | number | null;
  markGrade?: string | null;
  employeeNumber?: string | null;
}
// Form Values Interface
type FormValues = {
  studentMarks: Array<string | number | null>;
};
// Function to get Grade from Mark
const getMarkGrade = (mark: number | string | null | undefined) => {
  if (mark === null || mark === undefined || mark === "") return "-";
  const n = typeof mark === "string" ? parseFloat(mark) : mark;
  if (Number.isNaN(n)) return "-";
  if (n >= 75) return "A";
  if (n >= 65) return "B";
  if (n >= 55) return "C";
  if (n >= 40) return "S";
  return "F";
};
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
}: StudentMarksTableProps) => {
  // Input Refs and Debounce Setup
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const { control, watch, formState } = useForm<FormValues>({
    defaultValues: {
      studentMarks: rows?.map((r) =>
        r.studentMark === null || r.studentMark === undefined
          ? ""
          : r.studentMark
      ),
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

  // Mutation for Submitting Marks
  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: (payload: {
      studentProfileId: number;
      academicSubjectId: number;
      studentMark: string;
      markGrade: string;
      academicYear: string;
      academicTerm: string;
    }) => submitStudentMarks(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-student-marks"] });
      enqueueSnackbar("Marks Added", {
        variant: "success",
      });
    },
    onError: (error: any) => {
      const message = error?.data?.message || error?.message || "Failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
  // Debounced Mutation Function
  const debouncedMutation = useCallback(
    (payload: Parameters<typeof createMutation>[0]) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        createMutation(payload);
      }, 2000);
    },
    [createMutation]
  );

  // Column Definitions and Visibility Setup
  const columns = useMemo<ColumnDefinition[]>(
    () => [
      { key: "markId", label: "Mark Id" },
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
          justifyContent="space-between"
          alignItems="center"
          m="0.5rem"
        >
          <ColumnVisibilitySelector
            {...columnSelectorProps}
            popoverTitle="Hide Columns"
            buttonText="Columns"
          />
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
                              <CheckIcon sx={{color:"#fff"}} fontSize="small" />
                            </IconButton>
                          ) : (
                            "-"
                          )}
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
                                    if (
                                      !row.studentProfileId ||
                                      !selectedSubject ||
                                      !selectedSubject.id
                                    ) {
                                      return;
                                    }
                                    const numericMark = val;
                                    const payload = {
                                      studentProfileId: row.studentProfileId,
                                      academicSubjectId: selectedSubject.id,
                                      studentMark: numericMark,
                                      markGrade: getMarkGrade(numericMark),
                                      academicYear: selectedYear,
                                      academicTerm: selectedTerm,
                                    };

                                    debouncedMutation(payload);
                                  } else {
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
                                  computedGrade === "S"
                                    ? "orange"
                                    : undefined,
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
