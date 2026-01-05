import * as XLSX from "xlsx";
import { getPlainAddress } from "../util/plainText.util";

export interface ParentDetailsExcelOptions {
  title?: string;
  fileName?: string;
  organizationName?: string;
}

interface AcademicProfileLike {
  academicYear?: string | null;
  grade?: { grade?: string | number | null } | null;
  class?: { className?: string | null } | null;
}

interface ParentChildProfileLike {
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  gender?: string | null;
  employeeId?: string | number | null; // Admission Number
  academicProfiles?: AcademicProfileLike[] | null;
}

interface ParentUserLike {
  id?: number | string;
  nameWithInitials?: string | null;
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  gender?: string | null;
  address?: string | null;
  parentProfile?: ParentChildProfileLike[] | null;
}

const formatCellValue = (value: any): string | number => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return value;
};

export const exportParentDetailsToExcel = (
  rows: ParentUserLike[] | null | undefined,
  options?: ParentDetailsExcelOptions
) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    return;
  }

  const header = [
    "Parent ID",
    "Parent Name",
    "Parent Email",
    "Parent Mobile",
    "Parent Gender",
    "Address",
    "Student Name",
    "Admission No.",
    "Student Mobile",
    "Student Gender",
    "Academic Year",
    "Grade",
    "Class",
  ];

  const body = dataset.flatMap((row) => {
    const children = Array.isArray(row.parentProfile) ? row.parentProfile : [];

    if (!children.length) {
      return [
        [
          formatCellValue(row.id),
          formatCellValue(row.nameWithInitials ?? row.name),
          formatCellValue(row.email),
          formatCellValue(row.mobile),
          formatCellValue(row.gender),
          formatCellValue(getPlainAddress(row.address ?? undefined)),
          formatCellValue("-"),
          formatCellValue("-"),
          formatCellValue("-"),
          formatCellValue("-"),
          formatCellValue("-"),
          formatCellValue("-"),
          formatCellValue("-"),
          formatCellValue("-"),
        ],
      ];
    }

    const rowsForParent: (string | number)[][] = [];

    children.forEach((child) => {
      const academicProfiles = Array.isArray(child.academicProfiles)
        ? child.academicProfiles
        : [undefined];

      academicProfiles.forEach((profile) => {
        const year = profile?.academicYear ?? null;
        const grade = profile?.grade?.grade ?? null;
        const className = profile?.class?.className ?? null;

        rowsForParent.push([
          formatCellValue(row.id),
          formatCellValue(row.nameWithInitials ?? row.name),
          formatCellValue(row.email),
          formatCellValue(row.mobile),
          formatCellValue(row.gender),
          formatCellValue(getPlainAddress(row.address ?? undefined)),
          formatCellValue(child.name),
          formatCellValue(child.employeeId),
          formatCellValue(child.mobile),
          formatCellValue(child.gender),
          formatCellValue(year),
          formatCellValue(grade),
          formatCellValue(className),
        ]);
      });
    });

    return rowsForParent;
  });

  const worksheetData: (string | number)[][] = [header, ...body];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Parents");

  const baseTitle = options?.title || "parent-details";
  const safeTitle = baseTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const fileName = options?.fileName || `${safeTitle}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};
