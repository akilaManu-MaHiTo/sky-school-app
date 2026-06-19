import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";

export interface GradeMarksPdfSection {
  title: string;
  rows: any[];
}

export interface GradeMarksPdfOptions extends PdfHeaderData {
  title?: string;
  gradeLabel?: string;
  classLabel?: string;
  yearLabel?: string;
  termLabel?: string;
}

interface GenerateGradeMarksPdfPayload {
  headerData?: GradeMarksPdfOptions;
  columns: string[];
  sections: GradeMarksPdfSection[];
}

const TABLE_MARGIN_TOP = 70;
const TABLE_MARGIN_BOTTOM = 25;

const formatCellValue = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
};

const sanitizeText = (value?: string) => {
  if (!value) return undefined;

  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const generateGradeMarksPdf = ({
  headerData,
  columns,
  sections,
}: GenerateGradeMarksPdfPayload) => {
  const dataset = Array.isArray(sections)
    ? sections.filter(
        (section) => Array.isArray(section.rows) && section.rows.length,
      )
    : [];

  if (!dataset.length) {
    throw new Error("No grade marks data available for PDF generation");
  }

  const doc = new jsPDF("l", "mm", "a4");
  const fallbackTitle = headerData?.title || "Subject Mark Grades";

  dataset.forEach((section, index) => {
    if (index > 0) {
      doc.addPage();
    }

    const sectionTitle = section.title || fallbackTitle;
    const headRow = ["Subject", ...columns];
    const body = section.rows.map((row: any) => [
      formatCellValue(row?.subjectName),
      ...columns.map((column) => formatCellValue(row?.[column] ?? 0)),
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
      didDrawPage: (dataArg) => {
        drawPdfHeader(doc, { ...headerData, title: sectionTitle });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(6, 66, 115);
        doc.text(sectionTitle, 15, 50);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);

        const leftLines = [
          headerData?.yearLabel ? `Academic Year: ${headerData.yearLabel}` : null,
          headerData?.gradeLabel ? `Grade: ${headerData.gradeLabel}` : null,
          headerData?.classLabel ? `Class: ${headerData.classLabel}` : null,
        ].filter(Boolean) as string[];

        const rightLines = [
          headerData?.termLabel ? `Term: ${headerData.termLabel}` : null,
        ].filter(Boolean) as string[];

        leftLines.forEach((line, lineIndex) => {
          doc.text(line, 15, 56 + lineIndex * 5);
        });

        rightLines.forEach((line, lineIndex) => {
          doc.text(line, 140, 56 + lineIndex * 5);
        });

        drawPdfFooter(doc, dataArg.pageNumber, headerData?.organizationName);
      },
    });
  });

  const timestamp = new Date().toISOString().split("T")[0];
  const fileNameParts = [
    sanitizeText(headerData?.title || fallbackTitle) || "grade-marks-report",
    timestamp,
  ].filter(Boolean);

  doc.save(`${fileNameParts.join("-")}.pdf`);
};