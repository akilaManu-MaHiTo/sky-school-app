import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { IconButton, SxProps, Theme, Tooltip } from "@mui/material";
import { useSnackbar } from "notistack";
import { ColumnDefinition } from "../../components/useColumnVisibility";
import CustomButton from "../../components/CustomButton";
import { StudentMarkRow, getMarkGrade } from "./studentMarksUtils";
import * as XLSX from "xlsx";

interface StudentMarksExcelDownloadProps {
  marksData: StudentMarkRow[];
  columns: ColumnDefinition[];
  visibility: Record<string, boolean>;
  fileName?: string;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
  displayMode?: "button" | "icon";
  tooltip?: string;
  filters?: { label: string; value: string | number }[];
}

const columnValueSelector: Record<
  string,
  (row: StudentMarkRow) => string | number
> = {
  markId: (row) => (row.markId ? "Yes" : "-"),
  admissionNumber: (row) => row.student?.employeeNumber ?? "-",
  name: (row) => row.student?.nameWithInitials ?? "-",
  academicYear: (row) => row.academicYear ?? "-",
  academicTerm: (row) => row.academicTerm ?? "-",
  academicMedium: (row) => row.academicMedium ?? "-",
  grade: (row) => (row.grade?.grade ? `Grade ${row.grade.grade}` : "-"),
  className: (row) => row.class?.className ?? "-",
  subjectName: (row) => row.subject?.subjectName ?? "-",
  isAbsentStudent: (row) =>
    row.isAbsentStudent === undefined || row.isAbsentStudent === null
      ? "-"
      : row.isAbsentStudent
      ? "Yes"
      : "No",
  studentMark: (row) => {
    if (row.isAbsentStudent) {
      return "Ab";
    }
    if (
      row.studentMark === null ||
      row.studentMark === undefined ||
      row.studentMark === ""
    ) {
      return "-";
    }
    return row.studentMark;
  },
  markGrade: (row) => row.markGrade ?? getMarkGrade(row.studentMark ?? null),
};

const StudentMarksExcelDownload = ({
  marksData,
  columns,
  visibility,
  fileName = "student-marks.xlsx",
  isLoading,
  sx,
  displayMode = "button",
  tooltip = "Download Excel",
  filters,
}: StudentMarksExcelDownloadProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleDownload = () => {
    if (!marksData?.length) {
      enqueueSnackbar("No marks available to export", { variant: "info" });
      return;
    }

    const visibleColumns = columns.filter(
      (column) =>
        visibility[column.key] &&
        column.key !== "markGrade" &&
        column.key !== "isAbsentStudent"
    );

    if (!visibleColumns.length) {
      enqueueSnackbar("Select at least one column to export", {
        variant: "warning",
      });
      return;
    }

    // Prepare filter rows to display selected filters at the top of the sheet
    const filterRows: (string | number)[][] = [];

    if (filters && filters.length) {
      filters.forEach((filter) => {
        const value = filter.value;
        if (value !== undefined && value !== null && value !== "") {
          filterRows.push([filter.label, value]);
        }
      });

      if (filterRows.length) {
        // Add an empty row after filters for spacing
        filterRows.push([]);
      }
    }

    // Header row based on visible columns
    const headerRow = visibleColumns.map((column) => column.label);

    // Data rows with support for serial number (#) instead of markId
    const dataRows = marksData.map((row, rowIndex) =>
      visibleColumns.map((column) => {
        if (column.key === "markId") {
          // Use a sequential number instead of internal markId
          return rowIndex + 1;
        }
        const selector = columnValueSelector[column.key];
        const value = selector ? selector(row) : "-";
        if (value === undefined || value === null || value === "") {
          return "-";
        }
        return value;
      })
    );

    const aoa = [...filterRows, headerRow, ...dataRows];

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Marks");
    XLSX.writeFile(workbook, fileName);
  };

  const isDisabled = isLoading || !marksData?.length;

  if (displayMode === "icon") {
    return (
      <Tooltip title={tooltip}>
        <span>
          <IconButton
            onClick={handleDownload}
            disabled={isDisabled}
            sx={sx}
            color="primary"
            size="small"
          >
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    );
  }
  // Default to button display mode
  // Default to button display mode
  // Default to button display mode

  return (
    <CustomButton
      variant="outlined"
      size="medium"
      startIcon={<ArrowDownwardIcon />}
      onClick={handleDownload}
      disabled={isDisabled}
      sx={sx}
    >
      Download Excel
    </CustomButton>
  );
};

export default StudentMarksExcelDownload;
