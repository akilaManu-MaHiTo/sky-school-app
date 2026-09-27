import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";
import type { GradeAverageRow, GradeCountSeries } from "./GradeReportExcel";

export interface GradeReportPdfOptions extends PdfHeaderData {
  marksGradeLabel?: string;
}

interface GradeReportPdfPayload {
  subjectNames: string[];
  averageRows: GradeAverageRow[];
  countCategories: string[];
  countSeries: GradeCountSeries[];
  options?: GradeReportPdfOptions;
}

const TABLE_MARGIN_TOP = 72;
const TABLE_MARGIN_BOTTOM = 24;

const compactHeaderLabel = (value: string, max = 16): string => {
  if (!value) {
    return "-";
  }

  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
};

const formatAverageValue = (value: unknown): string => {
  if (typeof value === "number" && value !== 0) {
    return `${value.toFixed(1)}%`;
  }

  return "-";
};

const sanitizeFileName = (name: string): string =>
  name
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

export const generateGradeReportPdf = ({
  subjectNames,
  averageRows,
  countCategories,
  countSeries,
  options,
}: GradeReportPdfPayload) => {
  if ((!averageRows || averageRows.length === 0) && countCategories.length === 0) {
    throw new Error("No grade report data available for PDF generation");
  }

  const title = options?.title || "Grade Report";
  const doc = new jsPDF("l", "mm", "a4");
  const compactSubjectNames = subjectNames.map((name) => compactHeaderLabel(name));

  const drawSummary = (subtitle: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(6, 66, 115);
    doc.text(title, 15, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);

    const leftLines = [
      options?.yearLabel ? `Year: ${options.yearLabel}` : undefined,
      options?.gradeLabel ? `Grade: ${options.gradeLabel}` : undefined,
      options?.termLabel ? `Exam: ${options.termLabel}` : undefined,
      options?.marksGradeLabel ? `Marks Grade: ${options.marksGradeLabel}` : undefined,
    ].filter(Boolean) as string[];

    doc.text(`Section: ${subtitle}`, 15, 56);

    leftLines.forEach((line, index) => {
      doc.text(line, 95, 56 + index * 5);
    });
  };

  if (averageRows.length > 0) {
    autoTable(doc, {
      startY: TABLE_MARGIN_TOP,
      head: [["Class Name", ...compactSubjectNames]],
      body: averageRows.map((row) => [
        row.className,
        ...subjectNames.map((subjectName) => formatAverageValue(row[subjectName])),
      ]),
      theme: "grid",
      styles: {
        fontSize: 7,
        textColor: [40, 40, 40],
        halign: "left",
        valign: "middle",
        overflow: "ellipsize",
        cellPadding: 1,
      },
      headStyles: {
        fillColor: [169, 227, 229],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 7,
      },
      margin: {
        top: TABLE_MARGIN_TOP,
        bottom: TABLE_MARGIN_BOTTOM,
        left: 10,
        right: 10,
      },
      didDrawPage: (dataArg) => {
        drawPdfHeader(doc, { ...options, title });
        drawSummary("Class-wise Subject Percentages");
        drawPdfFooter(doc, dataArg.pageNumber, options?.organizationName);
      },
    });
  }

  const hasCountData = countCategories.length > 0 && countSeries.length > 0;

  if (!hasCountData) {
    const safeTitle = sanitizeFileName(title || "grade-report");
    const timestamp = new Date().toISOString().split("T")[0];
    doc.save(`${safeTitle || "grade-report"}-${timestamp}.pdf`);
    return;
  }

  if (averageRows.length > 0) {
    doc.addPage();
  }

  const countHead = [
    "Class Name",
    ...countSeries.map((series) => compactHeaderLabel(series.name)),
  ];
  const countBody = countCategories.map((category, rowIndex) => [
    category,
    ...countSeries.map((series) => {
      const value = series.data?.[rowIndex];
      return typeof value === "number" ? String(value) : "0";
    }),
  ]);

  autoTable(doc, {
    startY: TABLE_MARGIN_TOP,
    head: [countHead],
    body: countBody,
    theme: "grid",
    styles: {
      fontSize: 7,
      textColor: [40, 40, 40],
      halign: "left",
      valign: "middle",
      overflow: "ellipsize",
      cellPadding: 1,
    },
    headStyles: {
      fillColor: [169, 227, 229],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 7,
    },
    margin: {
      top: TABLE_MARGIN_TOP,
      bottom: TABLE_MARGIN_BOTTOM,
      left: 10,
      right: 10,
    },
    didDrawPage: (dataArg) => {
      drawPdfHeader(doc, { ...options, title });
      drawSummary("Class-wise Grade Counts");
      drawPdfFooter(doc, dataArg.pageNumber, options?.organizationName);
    },
  });

  const safeTitle = sanitizeFileName(title || "grade-report");
  const timestamp = new Date().toISOString().split("T")[0];
  doc.save(`${safeTitle || "grade-report"}-${timestamp}.pdf`);
};
