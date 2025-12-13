import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { SxProps, Theme } from "@mui/material";
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
}

const columnValueSelector: Record<
  string,
  (row: StudentMarkRow) => string | number
> = {
  markId: (row) => (row.markId ? "Yes" : "-"),
  admissionNumber: (row) => row.student?.employeeNumber ?? "-",
  name: (row) => row.student?.name ?? "-",
  academicYear: (row) => row.academicYear ?? "-",
  academicTerm: (row) => row.academicTerm ?? "-",
  academicMedium: (row) => row.academicMedium ?? "-",
  grade: (row) =>
    row.grade?.grade ? `Grade ${row.grade.grade}` : "-",
  className: (row) => row.class?.className ?? "-",
  subjectName: (row) => row.subject?.subjectName ?? "-",
  studentMark: (row) =>
    row.studentMark === null || row.studentMark === undefined || row.studentMark === ""
      ? "-"
      : row.studentMark,
  markGrade: (row) => row.markGrade ?? getMarkGrade(row.studentMark ?? null),
};

const StudentMarksExcelDownload = ({
  marksData,
  columns,
  visibility,
  fileName = "student-marks.xlsx",
  isLoading,
  sx,
}: StudentMarksExcelDownloadProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleDownload = () => {
    if (!marksData?.length) {
      enqueueSnackbar("No marks available to export", { variant: "info" });
      return;
    }

    const visibleColumns = columns.filter((column) => visibility[column.key]);

    if (!visibleColumns.length) {
      enqueueSnackbar("Select at least one column to export", {
        variant: "warning",
      });
      return;
    }

    const worksheetData = marksData.map((row) => {
      const rowData: Record<string, string | number> = {};

      visibleColumns.forEach((column) => {
        const selector = columnValueSelector[column.key];
        rowData[column.label] = selector ? selector(row) : "-";
      });

      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Marks");
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <CustomButton
      variant="contained"
      size="medium"
      startIcon={<ArrowDownwardIcon />}
      onClick={handleDownload}
      disabled={isLoading || !marksData?.length}
      sx={sx}
    >
      Download Excel
    </CustomButton>
  );
};

export default StudentMarksExcelDownload;
