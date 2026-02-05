import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";

export interface MarksEntryMonitoringRow {
  academicYear: string;
  term: string;
  academicMedium: string;
  gradeName: string;
  className: string;
  subjectCode: string;
  subjectName: string;
  totalStudentsForSubject: number;
  markedStudentsCount: number;
  pendingStudentsCount: number;
  teacherStaffId: string;
  teacherNameWithInitials: string;
  teacherEmail: string;
  teacherMobile: string;
  status: string;
}

export interface MarksEntryMonitoringTermGroup {
  term: string;
  rows: MarksEntryMonitoringRow[];
}

export interface MarksEntryMonitoringPdfOptions extends PdfHeaderData {
  academicYear?: string;
  term?: string;
  gradeName?: string;
  status?: string;
}

const REPORT_TITLE = "Marks Entry Monitoring";
const TABLE_MARGIN_TOP = 72;
const TABLE_MARGIN_BOTTOM = 25;

const formatCellValue = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
};

const buildHeadRow = (): string[] => {
  return [
    "#",
    "Year",
    "Term",
    "Staff Id",
    "Teacher",
    "Email",
    "Mobile",
    "Medium",
    "Grade",
    "Class",
    "Subject Code",
    "Subject",
    "Total",
    "Marked",
    "Pending",
    "Status",
  ];
};

const buildBodyRows = (
  rows: MarksEntryMonitoringRow[],
  overrideTerm?: string
): string[][] => {
  return rows.map((row, index) => {
    const termLabel = overrideTerm ?? row.term ?? "";

    return [
      (index + 1).toString(),
      formatCellValue(row.academicYear || "-"),
      formatCellValue(termLabel || "-"),
      formatCellValue(row.teacherStaffId || "-"),
      formatCellValue(row.teacherNameWithInitials || "-"),
      formatCellValue(row.teacherEmail || "-"),
      formatCellValue(row.teacherMobile || "-"),
      formatCellValue(row.academicMedium || "-"),
      formatCellValue(row.gradeName || "-"),
      formatCellValue(row.className || "-"),
      formatCellValue(row.subjectCode || "-"),
      formatCellValue(row.subjectName || "-"),
      formatCellValue(row.totalStudentsForSubject ?? 0),
      formatCellValue(row.markedStudentsCount ?? 0),
      formatCellValue(row.pendingStudentsCount ?? 0),
      formatCellValue(row.status || "-"),
    ];
  });
};

export const generateMarksEntryMonitoringPdf = (
  rows: MarksEntryMonitoringRow[] | null | undefined,
  options: MarksEntryMonitoringPdfOptions = {}
) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    throw new Error("No marks entry monitoring data available for PDF generation");
  }

  const doc = new jsPDF("l", "mm", "a4");
  const title = options.title || REPORT_TITLE;

  const academicYear =
    options.academicYear || dataset[0]?.academicYear || "N/A";
  const termLabel = options.term || dataset[0]?.term || "N/A";
  const gradeLabel = options.gradeName || dataset[0]?.gradeName || "N/A";
  const statusLabel = options.status || dataset[0]?.status || "N/A";

  const headRow = buildHeadRow();
  const body = buildBodyRows(dataset, termLabel);

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
      drawPdfHeader(doc, { ...options, title });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(6, 66, 115);
      doc.text(title, 15, 50);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);

      const leftSummary = [
        `Academic Year: ${academicYear}`,
        `Term: ${termLabel}`,
        `Grade: ${gradeLabel}`,
      ];

      const rightSummary = [`Status Filter: ${statusLabel}`];

      leftSummary.forEach((line, index) => {
        doc.text(line, 15, 56 + index * 5);
      });

      rightSummary.forEach((line, index) => {
        doc.text(line, 140, 56 + index * 5);
      });

      drawPdfFooter(doc, dataArg.pageNumber, options.organizationName);
    },
  });

  const timestamp = new Date().toISOString().split("T")[0];
  const sanitizeText = (value?: string) => {
    if (!value) return undefined;
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const fileNameParts = [
    "marks-entry-monitoring",
    sanitizeText(academicYear),
    sanitizeText(termLabel),
    timestamp,
  ].filter(Boolean);

  doc.save(`${fileNameParts.join("-")}.pdf`);
};

export const generateMarksEntryMonitoringAllTermsPdf = (
  groups: MarksEntryMonitoringTermGroup[] | null | undefined,
  options: MarksEntryMonitoringPdfOptions = {}
) => {
  const dataset = Array.isArray(groups)
    ? groups.filter((group) => Array.isArray(group.rows) && group.rows.length)
    : [];

  if (!dataset.length) {
    throw new Error("No marks entry monitoring data available for PDF generation");
  }

  const doc = new jsPDF("l", "mm", "a4");
  let isFirstSection = true;

  dataset.forEach((group, index) => {
    if (!group.rows.length) {
      return;
    }

    if (!isFirstSection) {
      doc.addPage();
    }

    const sectionTitle = `${REPORT_TITLE} - ${group.term}`;
    const academicYear =
      options.academicYear || group.rows[0]?.academicYear || "N/A";
    const gradeLabel = options.gradeName || group.rows[0]?.gradeName || "N/A";
    const statusLabel = options.status || group.rows[0]?.status || "N/A";

    const headRow = buildHeadRow();
    const body = buildBodyRows(group.rows, group.term);

    autoTable(doc, {
      startY: 60,
      head: [headRow],
      body,
      pageBreak: "auto",
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
      margin: { top: 60, bottom: 15, left: 10, right: 10 },
      didDrawPage: (dataArg) => {
        drawPdfHeader(doc, {
          ...options,
          title: sectionTitle,
        });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(6, 66, 115);
        doc.text(sectionTitle, 15, 50);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);

        const leftLines = [
          `Academic Year: ${academicYear}`,
          `Term: ${group.term}`,
          `Grade: ${gradeLabel}`,
        ];

        const rightLines = [`Status Filter: ${statusLabel}`];

        leftLines.forEach((line, lineIndex) => {
          doc.text(line, 15, 56 + lineIndex * 5);
        });

        rightLines.forEach((line, lineIndex) => {
          doc.text(line, 140, 56 + lineIndex * 5);
        });

        drawPdfFooter(doc, dataArg.pageNumber, options.organizationName);
      },
    });

    isFirstSection = false;
  });

  const timestamp = new Date().toISOString().split("T")[0];
  const sanitizeText = (value?: string) => {
    if (!value) return undefined;
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const firstGroup = dataset[0];
  const academicYear =
    options.academicYear || firstGroup.rows[0]?.academicYear || "";

  const fileNameParts = [
    "marks-entry-monitoring-all-terms",
    sanitizeText(academicYear),
    timestamp,
  ].filter(Boolean);

  doc.save(`${fileNameParts.join("-")}.pdf`);
};
