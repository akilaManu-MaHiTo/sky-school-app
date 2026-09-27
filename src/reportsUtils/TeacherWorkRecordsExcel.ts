import * as XLSX from "xlsx";
import { format } from "date-fns";

export interface TeacherWorkRecordExcelRow {
  workDate?: string | Date | null;
  teacherName?: string | null;
  subjectName?: string | null;
  title?: string | null;
  academicWork?: string | null;
  time?: string | Date | null;
  status?: string | null;
}

export interface TeacherWorkRecordsExcelOptions {
  title?: string;
  fileName?: string;
  organizationName?: string;
  yearLabel?: string;
  gradeLabel?: string;
  classLabel?: string;
  categoryLabel?: string;
  periodLabel?: string;
}

const formatCellValue = (value: unknown): string | number => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return typeof value === "number" ? value : String(value);
};

const formatDateValue = (value?: string | Date | null): string => {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return format(date, "yyyy-MM-dd");
};

const formatTimeValue = (value?: string | Date | null): string => {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return format(date, "hh:mm a");
};

export const exportTeacherWorkRecordsToExcel = (
  rows: TeacherWorkRecordExcelRow[] | null | undefined,
  options?: TeacherWorkRecordsExcelOptions,
) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    throw new Error("No teacher work records available for Excel export");
  }

  const title = options?.title || "Teacher Work Records";
  const summaryRows: (string | number)[][] = [[title]];

  if (options?.yearLabel) summaryRows.push(["Year", options.yearLabel]);
  if (options?.gradeLabel) summaryRows.push(["Grade", options.gradeLabel]);
  if (options?.classLabel) summaryRows.push(["Class", options.classLabel]);
  if (options?.categoryLabel) summaryRows.push(["Category", options.categoryLabel]);
  if (options?.periodLabel) summaryRows.push(["Period", options.periodLabel]);

  summaryRows.push([]);

  const headerRow = [
    "#",
    "Work Date",
    "Teacher",
    "Subject",
    "Title",
    "Academic Work",
    "Time",
    "Status",
  ];

  const dataRows = dataset.map((row, index) => [
    index + 1,
    formatDateValue(row.workDate ?? null),
    formatCellValue(row.teacherName),
    formatCellValue(row.subjectName),
    formatCellValue(row.title),
    formatCellValue(row.academicWork),
    formatTimeValue(row.time ?? null),
    formatCellValue(row.status),
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([
    ...summaryRows,
    headerRow,
    ...dataRows,
  ]);

  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 26 },
    { wch: 28 },
    { wch: 30 },
    { wch: 34 },
    { wch: 14 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Work Records");

  const timestamp = new Date().toISOString().split("T")[0];
  const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const fileName =
    options?.fileName ||
    `${safeTitle || "teacher-work-records"}-${timestamp}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};