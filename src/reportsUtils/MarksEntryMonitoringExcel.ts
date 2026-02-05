import * as XLSX from "xlsx";

export interface MarksEntryMonitoringExcelOptions {
  title?: string;
  fileName?: string;
  organizationName?: string;
  academicYear?: string;
  term?: string;
  gradeName?: string;
  status?: string;
}

export interface MarksEntryMonitoringRow {
  academicYear: string;
  term: string;
  academicMedium: string;
  gradeName: string;
  className: string;
  subjectCode: string;
  subjectName: string;
  totalStudentsForSubject: number;
  markedStudentsCount: number;
  pendingStudentsCount: number;
  teacherStaffId: string;
  teacherNameWithInitials: string;
  teacherEmail: string;
  teacherMobile: string;
  status: string;
}

export interface MarksEntryMonitoringTermGroup {
  term: string;
  rows: MarksEntryMonitoringRow[];
}

const formatCellValue = (value: any): string | number => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return value;
};

const buildRowArray = (
  row: MarksEntryMonitoringRow,
  overrideTerm?: string
): (string | number)[] => {
  const termLabel = overrideTerm ?? row.term ?? "";

  return [
    formatCellValue(row.academicYear || "-"),
    formatCellValue(termLabel || "-"),
    formatCellValue(row.teacherStaffId || "-"),
    formatCellValue(row.teacherNameWithInitials || "-"),
    formatCellValue(row.teacherEmail || "-"),
    formatCellValue(row.teacherMobile || "-"),
    formatCellValue(row.academicMedium || "-"),
    formatCellValue(row.gradeName || "-"),
    formatCellValue(row.className || "-"),
    formatCellValue(row.subjectCode || "-"),
    formatCellValue(row.subjectName || "-"),
    formatCellValue(row.totalStudentsForSubject ?? 0),
    formatCellValue(row.markedStudentsCount ?? 0),
    formatCellValue(row.pendingStudentsCount ?? 0),
    formatCellValue(row.status || "-"),
  ];
};

export const exportMarksEntryMonitoringToExcel = (
  rows: MarksEntryMonitoringRow[] | null | undefined,
  options?: MarksEntryMonitoringExcelOptions
) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    return;
  }

  const header = [
    "Year",
    "Term",
    "Staff Id",
    "Teacher",
    "Email",
    "Mobile",
    "Medium",
    "Grade",
    "Class",
    "Subject Code",
    "Subject",
    "Total Students",
    "Marked",
    "Pending",
    "Status",
  ];

  const body = dataset.map((row) => buildRowArray(row));

  const worksheetData: (string | number)[][] = [header, ...body];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();

  const sheetTitleRaw = options?.term || "Report";
  const sheetTitle = String(sheetTitleRaw).slice(0, 31) || "Report";
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);

  const baseTitle = options?.title || "marks-entry-monitoring";
  const safeTitle = baseTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const fileName = options?.fileName || `${safeTitle}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};

export const exportMarksEntryMonitoringAllTermsToExcel = (
  groups: MarksEntryMonitoringTermGroup[] | null | undefined,
  options?: MarksEntryMonitoringExcelOptions
) => {
  const dataset = Array.isArray(groups)
    ? groups.filter((group) => Array.isArray(group.rows) && group.rows.length)
    : [];

  if (!dataset.length) {
    return;
  }

  const workbook = XLSX.utils.book_new();

  dataset.forEach((group) => {
    const header = [
      "Year",
      "Term",
      "Staff Id",
      "Teacher",
      "Email",
      "Mobile",
      "Medium",
      "Grade",
      "Class",
      "Subject Code",
      "Subject",
      "Total Students",
      "Marked",
      "Pending",
      "Status",
    ];

    const body = group.rows.map((row) => buildRowArray(row, group.term));

    const worksheetData: (string | number)[][] = [header, ...body];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const sheetTitleRaw = group.term || "Term";
    const sheetTitle = String(sheetTitleRaw).slice(0, 31) || "Term";

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);
  });

  const baseTitle = options?.title || "marks-entry-monitoring-all-terms";
  const safeTitle = baseTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const fileName = options?.fileName || `${safeTitle}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};
