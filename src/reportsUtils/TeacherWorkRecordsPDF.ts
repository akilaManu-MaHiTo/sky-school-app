import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";

export interface TeacherWorkRecordPdfRow {
  workDate?: string | Date | null;
  teacherName?: string | null;
  subjectName?: string | null;
  title?: string | null;
  academicWork?: string | null;
  time?: string | Date | null;
  status?: string | null;
}

export interface TeacherWorkRecordsPdfOptions extends PdfHeaderData {
  yearLabel?: string;
  gradeLabel?: string;
  classLabel?: string;
  categoryLabel?: string;
  periodLabel?: string;
}

const TABLE_MARGIN_TOP = 60;
const TABLE_MARGIN_BOTTOM = 25;

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
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

export const generateTeacherWorkRecordsPdf = (
  rows: TeacherWorkRecordPdfRow[] | null | undefined,
  headerData?: TeacherWorkRecordsPdfOptions,
) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    throw new Error("No teacher work records available for PDF generation");
  }

  const doc = new jsPDF("l", "mm", "a4");
  const title = headerData?.title || "Teacher Work Records";

  const headRow = [
    "#",
    "Work Date",
    "Teacher",
    "Subject",
    "Title",
    "Academic Work",
    "Time",
    "Status",
  ];

  const body = dataset.map((row, index) => [
    index + 1,
    formatDateValue(row.workDate ?? null),
    formatCellValue(row.teacherName),
    formatCellValue(row.subjectName),
    formatCellValue(row.title),
    formatCellValue(row.academicWork),
    formatTimeValue(row.time ?? null),
    formatCellValue(row.status),
  ]);

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
      1: { cellWidth: 20 },
      2: { cellWidth: 34 },
      3: { cellWidth: 34 },
      4: { cellWidth: 36 },
      5: { cellWidth: 44 },
      6: { cellWidth: 16 },
      7: { cellWidth: 18 },
    },
    didDrawPage: (dataArg) => {
      drawPdfHeader(doc, { ...headerData, title });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(6, 66, 115);
      doc.text(title, 15, 50);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);

      const summaryParts = [
        headerData?.yearLabel ? `Year: ${headerData.yearLabel}` : null,
        headerData?.gradeLabel ? `Grade: ${headerData.gradeLabel}` : null,
        headerData?.classLabel ? `Class: ${headerData.classLabel}` : null,
        headerData?.categoryLabel ? `Category: ${headerData.categoryLabel}` : null,
        headerData?.periodLabel ? `Period: ${headerData.periodLabel}` : null,
      ].filter(Boolean) as string[];

      if (summaryParts.length) {
        doc.text(summaryParts.join("  |  "), 15, 56);
      }

      drawPdfFooter(doc, dataArg.pageNumber, headerData?.organizationName);
    },
  });

  const timestamp = new Date().toISOString().split("T")[0];
  const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`${safeTitle || "teacher-work-records"}-${timestamp}.pdf`);
};