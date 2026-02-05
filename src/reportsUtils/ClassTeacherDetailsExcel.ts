import * as XLSX from "xlsx";
import { ClassTeacher } from "../api/classTeacherApi";

export interface ClassTeacherExcelOptions {
  title?: string;
  fileName?: string;
}

const formatCellValue = (value: unknown): string | number => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return value as string | number;
};

const getGradeLabel = (grade?: { grade?: string | number | null }): string => {
  if (!grade) return "-";
  const value = grade.grade;
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return `Grade ${value}`;
};

const buildFileName = (options?: ClassTeacherExcelOptions): string => {
  const fallback = "class-teacher-details";
  const label = options?.fileName || options?.title || fallback;
  const sanitized = label.trim().toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
  return `${sanitized || fallback}.xlsx`;
};

export const exportClassTeacherDetailsToExcel = (
  rows: ClassTeacher[] | null | undefined,
  options?: ClassTeacherExcelOptions,
) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    return;
  }

  const header = [
    "#",
    "Academic Year",
    "Grade",
    "Class",
    "Teacher Name",
    "Staff Id",
    "Email",
    "Mobile",
    "Gender",
    "User Role",
    "Access Role",
    "Status",
  ];

  const body = dataset.map((row, index) => {
    const teacher = row?.teacher;

    return [
      index + 1,
      formatCellValue(row?.year),
      getGradeLabel(row?.grade),
      formatCellValue(row?.class?.className),
      formatCellValue(teacher?.nameWithInitials ?? teacher?.name),
      formatCellValue(teacher?.employeeNumber),
      formatCellValue(teacher?.email),
      formatCellValue(teacher?.mobile),
      formatCellValue(teacher?.gender),
      formatCellValue(teacher?.employeeType),
      formatCellValue(teacher?.userType?.userType),
      teacher?.availability ? "Active" : "Inactive",
    ];
  });

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Class Teachers");

  const fileName = buildFileName(options);
  XLSX.writeFile(workbook, fileName);
};
