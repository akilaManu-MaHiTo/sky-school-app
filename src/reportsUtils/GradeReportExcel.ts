import * as XLSX from "xlsx";

export interface GradeAverageRow {
  className: string;
  [subjectName: string]: string | number;
}

export interface GradeCountSeries {
  name: string;
  data: number[];
}

export interface GradeReportExcelOptions {
  title?: string;
  organizationName?: string;
  yearLabel?: string;
  gradeLabel?: string;
  termLabel?: string;
  marksGradeLabel?: string;
  fileName?: string;
}

interface GradeReportExcelPayload {
  subjectNames: string[];
  averageRows: GradeAverageRow[];
  countCategories: string[];
  countSeries: GradeCountSeries[];
  options?: GradeReportExcelOptions;
}

const formatCellValue = (value: unknown): string | number => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "number") {
    return value;
  }

  return String(value);
};

const createMetaRows = (
  options?: GradeReportExcelOptions,
  includeMarksGrade = false,
): string[] => {
  const rows: string[] = [];

  if (options?.organizationName) {
    rows.push(options.organizationName);
  }

  if (options?.title) {
    rows.push(options.title);
  }

  const details: string[] = [];
  if (options?.yearLabel) details.push(`Year: ${options.yearLabel}`);
  if (options?.gradeLabel) details.push(`Grade: ${options.gradeLabel}`);
  if (options?.termLabel) details.push(`Exam: ${options.termLabel}`);
  if (includeMarksGrade && options?.marksGradeLabel) {
    details.push(`Marks Grade: ${options.marksGradeLabel}`);
  }

  if (details.length) {
    rows.push(details.join(" | "));
  }

  return rows;
};

const sanitizeFileName = (name: string): string =>
  name
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

export const exportGradeReportToExcel = ({
  subjectNames,
  averageRows,
  countCategories,
  countSeries,
  options,
}: GradeReportExcelPayload) => {
  const workbook = XLSX.utils.book_new();

  const averageHeader = ["Class Name", ...subjectNames];
  const averageBody = averageRows.map((row) => [
    formatCellValue(row.className),
    ...subjectNames.map((subjectName) => {
      const rawValue = row[subjectName];
      if (typeof rawValue === "number" && rawValue !== 0) {
        return `${rawValue.toFixed(1)}%`;
      }
      return "-";
    }),
  ]);

  const averageMetaRows = createMetaRows(options).map((line) => [line]);
  const averageWorksheet = XLSX.utils.aoa_to_sheet([
    ...averageMetaRows,
    ...(averageMetaRows.length ? [Array(averageHeader.length).fill("")] : []),
    averageHeader,
    ...averageBody,
  ]);

  XLSX.utils.book_append_sheet(workbook, averageWorksheet, "Subject Averages");

  const countSubjects = countSeries.map((series) => series.name);
  const countHeader = ["Class Name", ...countSubjects];

  const countBody = countCategories.map((category, rowIndex) => [
    category,
    ...countSeries.map((series) => {
      const value = series.data?.[rowIndex];
      return typeof value === "number" ? value : 0;
    }),
  ]);

  const countMetaRows = createMetaRows(options, true).map((line) => [line]);
  const countWorksheet = XLSX.utils.aoa_to_sheet([
    ...countMetaRows,
    ...(countMetaRows.length ? [Array(countHeader.length).fill("")] : []),
    countHeader,
    ...countBody,
  ]);

  XLSX.utils.book_append_sheet(workbook, countWorksheet, "Grade Counts");

  const titlePart = sanitizeFileName(options?.title || "grade-report");
  const timestamp = new Date().toISOString().split("T")[0];
  const fileName = options?.fileName || `${titlePart || "grade-report"}-${timestamp}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};
