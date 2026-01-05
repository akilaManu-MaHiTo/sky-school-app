import * as XLSX from "xlsx";
import { format } from "date-fns";
import { getPlainAddress } from "../util/plainText.util";

export interface TeacherDetailsExcelOptions {
  title?: string;
  fileName?: string;
  organizationName?: string;
}

interface TeacherProfileLike {
  academicYear?: string | null;
  academicMedium?: string | null;
  grade?: { grade?: string | number | null } | null;
  subject?: { subjectName?: string | null; subjectCode?: string | null } | null;
  class?: { className?: string | null } | null;
}

interface TeacherUserLike {
  id?: number | string;
  nameWithInitials?: string | null;
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  gender?: string | null;
  birthDate?: string | Date | null;
  address?: string | null;
  employeeType?: string | null;
  userType?: { userType?: string | null } | null;
  availability?: boolean | number | null;
  employeeNumber?: string | number | null;
  userProfile?: TeacherProfileLike[] | null;
}

const formatCellValue = (value: any): string | number => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return value;
};

const formatDate = (value?: string | Date | null): string => {
  if (!value) return "-";
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return format(date, "yyyy-MM-dd");
  } catch {
    return "-";
  }
};

export const exportTeacherDetailsToExcel = (
  rows: TeacherUserLike[] | null | undefined,
  options?: TeacherDetailsExcelOptions
) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    return;
  }

  const header = [
    "ID",
    "Employee No.",
    "Name With Initials",
    "Email",
    "Mobile",
    "Gender",
    "Birthday",
    "Address",
    "User Role",
    "Access Role",
    "Status",
    "Academic Year",
    "Medium",
    "Grade",
    "Class",
    "Subject",
    "Subject Code",
  ];

  const body = dataset.flatMap((row) => {
    const statusLabel = row.availability ? "Active" : "Inactive";
    const profiles =
      Array.isArray(row.userProfile) && row.userProfile.length
        ? row.userProfile
        : [undefined];

    return profiles.map((profile) => {
      const academicYear = profile?.academicYear ?? null;
      const medium = profile?.academicMedium ?? null;
      const grade = profile?.grade?.grade ?? null;
      const className = profile?.class?.className ?? null;
      const subjectName = profile?.subject?.subjectName ?? null;
      const subjectCode = profile?.subject?.subjectCode ?? null;

      return [
        formatCellValue(row.id),
        formatCellValue(row.employeeNumber),
        formatCellValue(row.nameWithInitials ?? row.name),
        formatCellValue(row.email),
        formatCellValue(row.mobile),
        formatCellValue(row.gender),
        formatDate(row.birthDate ?? null),
        formatCellValue(getPlainAddress(row.address ?? undefined)),
        formatCellValue(row.employeeType),
        formatCellValue(row.userType?.userType ?? null),
        formatCellValue(statusLabel),
        formatCellValue(academicYear),
        formatCellValue(medium),
        formatCellValue(grade),
        formatCellValue(className),
        formatCellValue(subjectName),
        formatCellValue(subjectCode),
      ];
    });
  });

  const worksheetData: (string | number)[][] = [header, ...body];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");

  const baseTitle = options?.title || "teacher-details";
  const safeTitle = baseTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const fileName = options?.fileName || `${safeTitle}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};
