import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";

export interface ParentReportSubjectRow {
  subjectName: string;
  studentMark: number | string | null;
  studentGrade: string | null;
  classAverageMark: number | string | null;
  highestMark: number | string | null;
  highestGrade: string | null;
}

export interface ParentReportSection {
  examType: string;
  academicDetails?: {
    year?: string | number | null;
    grade?: string | number | null;
    className?: string | null;
  };
  overall?: {
    averageOfMarks?: number | string | null;
    position?: number | string | null;
  } | null;
  subjects: ParentReportSubjectRow[];
}

export interface ParentReportPdfOptions extends PdfHeaderData {
  studentName?: string;
  admissionNumber?: string | number;
}

interface ExportPayload {
  sections: ParentReportSection[];
  options?: ParentReportPdfOptions;
}

const TABLE_MARGIN_TOP = 72;
const TABLE_MARGIN_BOTTOM = 25;

const formatCellValue = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "number") {
    return String(value);
  }
  return String(value);
};

const sanitizeText = (value?: string | number | null) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  const text = String(value).trim();
  if (!text) return undefined;
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const generateParentReportPdf = ({
  sections,
  options,
}: ExportPayload) => {
  const dataset = Array.isArray(sections) ? sections : [];

  if (!dataset.length) {
    throw new Error("No parent report data available for PDF generation");
  }

  const doc = new jsPDF();

  dataset.forEach((section, sectionIndex) => {
    if (sectionIndex > 0) {
      doc.addPage();
    }

    const yearLabel =
      section.academicDetails?.year ?? options?.yearLabel ?? "N/A";
    const gradeLabel =
      section.academicDetails?.grade ?? options?.gradeLabel ?? "N/A";
    const classLabel =
      section.academicDetails?.className ?? options?.classLabel ?? "N/A";

    const examLabel = section.examType || `Exam ${sectionIndex + 1}`;
    const headerTitle = options?.title || "Parent Report";
    const fullTitle = `${headerTitle} - ${examLabel}`;

    const studentLabel = options?.studentName
      ? options.admissionNumber
        ? `${options.studentName} (${options.admissionNumber})`
        : options.studentName
      : "N/A";

    const overallAverage =
      typeof section.overall?.averageOfMarks === "number"
        ? section.overall?.averageOfMarks.toFixed(2)
        : section.overall?.averageOfMarks ?? "-";
    const overallPosition = section.overall?.position ?? "-";

    const headRow: string[] = [
      "Subject",
      "Student Mark",
      "Grade",
      "Overall Class Average Mark",
      "Highest Class Mark",
      "Highest Class Grade",
    ];

    const body = (section.subjects ?? []).map((subject) => [
      formatCellValue(subject.subjectName),
      formatCellValue(subject.studentMark),
      formatCellValue(subject.studentGrade),
      formatCellValue(
        typeof subject.classAverageMark === "number"
          ? subject.classAverageMark.toFixed(2)
          : subject.classAverageMark,
      ),
      formatCellValue(subject.highestMark),
      formatCellValue(subject.highestGrade),
    ]);

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
        left: 12,
        right: 12,
      },
      didDrawPage: (dataArg) => {
        drawPdfHeader(doc, {
          ...options,
          title: fullTitle,
          organizationName: options?.organizationName,
        });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(6, 66, 115);
        doc.text(fullTitle, 15, 50);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);

        const leftLines: string[] = [];
        const rightLines: string[] = [];

        leftLines.push(`Student: ${studentLabel}`);
        leftLines.push(`Year: ${yearLabel}`);
        leftLines.push(`Grade: ${gradeLabel}`);
        leftLines.push(`Class: ${classLabel}`);

        rightLines.push(`Exam: ${examLabel}`);
        rightLines.push(`Overall Average: ${overallAverage}`);
        rightLines.push(`Position: ${overallPosition}`);

        leftLines.forEach((line, index) => {
          doc.text(line, 15, 56 + index * 5);
        });

        rightLines.forEach((line, index) => {
          doc.text(line, 140, 56 + index * 5);
        });

        drawPdfFooter(doc, dataArg.pageNumber, options?.organizationName);
      },
    });
  });

  const baseParts: (string | undefined)[] = [
    sanitizeText(options?.studentName),
    sanitizeText(options?.admissionNumber),
    sanitizeText(options?.yearLabel),
  ];

  const baseName = baseParts.filter(Boolean).join("-") || "parent-report";
  const suffix = dataset.length > 1 ? "all-terms" : "single-term";
  const timestamp = new Date().toISOString().split("T")[0];

  doc.save(`${baseName}-${suffix}-${timestamp}.pdf`);
};
