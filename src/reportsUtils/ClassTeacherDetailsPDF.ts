import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ClassTeacher } from "../api/classTeacherApi";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";

export interface ClassTeacherDetailsPdfOptions extends PdfHeaderData {}

const TABLE_MARGIN_TOP = 60;
const TABLE_MARGIN_BOTTOM = 25;

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
};

const getGradeLabel = (grade?: { grade?: string | number | null }): string => {
  if (!grade) return "-";
  const value = grade.grade;
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return `Grade ${value}`;
};

export const generateClassTeacherDetailsPdf = (
  rows: ClassTeacher[] | null | undefined,
  headerData?: ClassTeacherDetailsPdfOptions,
) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    throw new Error("No class teacher data available for PDF generation");
  }

  const doc = new jsPDF("l", "mm", "a4");
  const title = headerData?.title || "Class Teacher Details";

  const headRow = [
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

  autoTable(doc, {
    startY: TABLE_MARGIN_TOP,
    head: [headRow],
    body,
    theme: "grid",
    styles: {
      fontSize: 8,
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
      1: { cellWidth: 22 },
      2: { cellWidth: 20 },
      3: { cellWidth: 24 },
      4: { cellWidth: 40 },
      5: { cellWidth: 24 },
      6: { cellWidth: 38 },
      7: { cellWidth: 24 },
      8: { cellWidth: 18 },
      9: { cellWidth: 22 },
      10: { cellWidth: 22 },
      11: { cellWidth: 18 },
    },
    didDrawPage: (dataArg) => {
      drawPdfHeader(doc, { ...headerData, title });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(6, 66, 115);
      doc.text(title, 15, 50);
      drawPdfFooter(doc, dataArg.pageNumber, headerData?.organizationName);
    },
  });

  const timestamp = new Date().toISOString().split("T")[0];
  const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`${safeTitle || "class-teacher-details"}-${timestamp}.pdf`);
};
