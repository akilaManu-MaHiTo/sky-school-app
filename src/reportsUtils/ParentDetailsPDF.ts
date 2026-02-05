import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";
import { getPlainAddress } from "../util/plainText.util";

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

export interface ParentDetailsPdfOptions extends PdfHeaderData {}

const TABLE_MARGIN_TOP = 60;
const TABLE_MARGIN_BOTTOM = 25;

const formatCellValue = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
};

export const generateParentDetailsPdf = (
  rows: ParentUserLike[] | null | undefined,
  headerData?: ParentDetailsPdfOptions
) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    throw new Error("No parent data available for PDF generation");
  }

  const doc = new jsPDF("l", "mm", "a4");
  const title = headerData?.title || "Parent Details Report";

  const headRow = [
    "#",
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

  const body = dataset.flatMap((row, rowIndex) => {
    const children = Array.isArray(row.parentProfile) ? row.parentProfile : [];

    if (!children.length) {
      return [
        [
          String(rowIndex + 1),
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

    const rowsForParent: string[][] = [];

    children.forEach((child, childIndex) => {
      const academicProfiles = Array.isArray(child.academicProfiles)
        ? child.academicProfiles
        : [undefined];

      academicProfiles.forEach((profile, profileIndex) => {
        const year = profile?.academicYear ?? null;
        const grade = profile?.grade?.grade ?? null;
        const className = profile?.class?.className ?? null;

        const indexLabel = `${rowIndex + 1}.${childIndex + 1}.${
          profileIndex + 1
        }`;

        rowsForParent.push([
          indexLabel,
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
  doc.save(`${safeTitle || "parent-details"}-${timestamp}.pdf`);
};
