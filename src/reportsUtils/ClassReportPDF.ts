import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";
import { ClassReportRow, ClassReportSubject } from "./ClassReportExcel";

export interface ClassReportPdfOptions extends PdfHeaderData {
  title?: string;
}

interface ExportPayload {
  headerData?: ClassReportPdfOptions;
  subjects: ClassReportSubject[];
  groupNames: string[]; // kept for compatibility but not rendered
  rows: ClassReportRow[];
}

const TABLE_MARGIN_TOP = 60;
const TABLE_MARGIN_BOTTOM = 25;

const formatCellValue = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
};

export const generateClassReportPdf = ({
  headerData,
  subjects,
  groupNames,
  rows,
}: ExportPayload) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    throw new Error("No class report data available for PDF generation");
  }

  const doc = new jsPDF("l", "mm", "a4"); // landscape for wide tables

  const title =
    headerData?.title ||
    "Class Overall Report";

  const headRow: string[] = [
    "#",
    "Student",
    "Username",
    "Email",
    "Average",
    "Position",
    ...subjects.map((s) => s.subjectName),
  ];

  const body: RowInput[] = dataset.map((row, index) => {
    const base = [
      (index + 1).toString(),
      formatCellValue(row.nameWithInitials ?? row.userName),
      formatCellValue(row.userName),
      formatCellValue(row.email),
      formatCellValue(
        typeof row.averageOfMarks === "number"
          ? row.averageOfMarks.toFixed(2)
          : (row.averageOfMarks as string | null)
      ),
      formatCellValue(row.position as string | number | null),
    ];

    const subjectValues = subjects.map((subject) => {
      const value = row.subjectMarks?.[subject.subjectName];
      return formatCellValue(value);
    });

    return [...base, ...subjectValues];
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
    margin: { top: TABLE_MARGIN_TOP, bottom: TABLE_MARGIN_BOTTOM, left: 10, right: 10 },
    didDrawPage: (dataArg) => {
      drawPdfHeader(doc, { ...headerData, title });
      drawPdfFooter(doc, dataArg.pageNumber, headerData?.organizationName);
    },
  });

  const timestamp = new Date().toISOString().split("T")[0];
  const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`${safeTitle || "class-report"}-${timestamp}.pdf`);
};
