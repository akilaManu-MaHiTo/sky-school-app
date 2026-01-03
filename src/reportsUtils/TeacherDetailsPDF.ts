import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";
import { getPlainAddress } from "../util/plainText.util";

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

export interface TeacherDetailsPdfOptions extends PdfHeaderData {}

const TABLE_MARGIN_TOP = 60;
const TABLE_MARGIN_BOTTOM = 25;

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

const formatCellValue = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
};

export const generateTeacherDetailsPdf = (
  rows: TeacherUserLike[] | null | undefined,
  headerData?: TeacherDetailsPdfOptions
) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    throw new Error("No teacher data available for PDF generation");
  }

  const doc = new jsPDF("l", "mm", "a4");
  const title = headerData?.title || "Teacher Details Report";

  const headRow = [
    "#",
    "ID",
    "Employee No.",
    "Name",
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

  const body = dataset.flatMap((row, rowIndex) => {
    const statusLabel = row.availability ? "Active" : "Inactive";
    const profiles =
      Array.isArray(row.userProfile) && row.userProfile.length
        ? row.userProfile
        : [undefined];

    return profiles.map((profile, profileIndex) => {
      const academicYear = profile?.academicYear ?? null;
      const medium = profile?.academicMedium ?? null;
      const grade = profile?.grade?.grade ?? null;
      const className = profile?.class?.className ?? null;
      const subjectName = profile?.subject?.subjectName ?? null;
      const subjectCode = profile?.subject?.subjectCode ?? null;

      // Row number should reflect each profile row
      const indexLabel = `${rowIndex + 1}.${profileIndex + 1}`;

      return [
        indexLabel,
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

  autoTable(doc, {
    startY: TABLE_MARGIN_TOP,
    head: [headRow],
    body,
    theme: "grid",
    styles: {
      fontSize: 7,
      textColor: [40, 40, 40],
      halign: "left",
      valign: "middle",
    },
    headStyles: {
      fillColor: [169, 227, 229],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    margin: {
      top: TABLE_MARGIN_TOP,
      bottom: TABLE_MARGIN_BOTTOM,
      left: 10,
      right: 10,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 12 },
      2: { cellWidth: 22 },
      3: { cellWidth: 35 },
      4: { cellWidth: 40 },
      5: { cellWidth: 22 },
      6: { cellWidth: 16 },
      7: { cellWidth: 22 },
      8: { cellWidth: 40 },
      9: { cellWidth: 22 },
      10: { cellWidth: 22 },
      11: { cellWidth: 16 },
      12: { cellWidth: 20 },
      13: { cellWidth: 18 },
      14: { cellWidth: 16 },
      15: { cellWidth: 20 },
      16: { cellWidth: 26 },
      17: { cellWidth: 22 },
    },
    didDrawPage: (dataArg) => {
      drawPdfHeader(doc, { ...headerData, title });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(6, 66, 115);
      doc.text(title, 15, 50);

      drawPdfFooter(doc, dataArg.pageNumber, headerData?.organizationName);
    },
  });

  const timestamp = new Date().toISOString().split("T")[0];
  const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`${safeTitle || "teacher-details"}-${timestamp}.pdf`);
};
