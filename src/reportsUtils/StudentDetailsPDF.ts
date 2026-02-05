import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";
import { getPlainAddress } from "../util/plainText.util";

interface StudentProfileLike {
  academicYear?: string | null;
  academicMedium?: string | null;
  grade?: { grade?: string | number | null } | null;
  class?: { className?: string | null } | null;
  basketSubjects?: Record<string, { subjectName?: string | null } | null> | null;
}

interface StudentUserLike {
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
  studentProfile?: StudentProfileLike[] | null;
}

export interface StudentDetailsPdfOptions extends PdfHeaderData {}

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

export const generateStudentDetailsPdf = (
  rows: StudentUserLike[] | null | undefined,
  headerData?: StudentDetailsPdfOptions
) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    throw new Error("No student data available for PDF generation");
  }

  const doc = new jsPDF("l", "mm", "a4");
  const title = headerData?.title || "Student Details Report";

  const headRow = [
    "#",
    "ID",
    "Admission No.",
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
    "Basket Subjects",
  ];

  const body = dataset.flatMap((row, rowIndex) => {
    const profiles =
      Array.isArray(row.studentProfile) && row.studentProfile.length
        ? row.studentProfile
        : [undefined];

    const statusLabel = row.availability ? "Active" : "Inactive";

    return profiles.map((profile, profileIndex) => {
      const academicYear = profile?.academicYear ?? null;
      const medium = profile?.academicMedium ?? null;
      const grade = profile?.grade?.grade ?? null;
      const className = profile?.class?.className ?? null;
      const basketSubjects = profile
        ? (() => {
            const subjects = profile.basketSubjects
              ? Object.values(profile.basketSubjects)
              : [];
            const names = subjects
              .map((s) => (s?.subjectName ? String(s.subjectName).trim() : ""))
              .filter((v) => v.length > 0);
            return names.length ? names.join(", ") : "-";
          })()
        : "-";

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
        formatCellValue(basketSubjects),
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
  doc.save(`${safeTitle || "student-details"}-${timestamp}.pdf`);
};
