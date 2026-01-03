import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { StudentMarkRow } from "../views/Academics/studentMarksUtils";
import { ColumnDefinition } from "../components/useColumnVisibility";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";

export interface StudentMarksPdfOptions extends PdfHeaderData {
  academicYear?: string;
  academicTerm?: string;
  subjectName?: string;
  columns?: ColumnDefinition[];
  visibility?: Record<string, boolean>;
  filters?: { label: string; value: string | number }[];
}

const REPORT_TITLE = "Student Marks Report";
const TABLE_MARGIN_TOP = 72;
const TABLE_MARGIN_BOTTOM = 25;

const sanitizeText = (value?: string | null) => {
  if (!value) {
    return undefined;
  }
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const resolveMarkValue = (row: StudentMarkRow): string => {
  if (row.isAbsentStudent) {
    return "-";
  }
  if (row.studentMark === null || row.studentMark === undefined) {
    return "-";
  }
  const value = String(row.studentMark).trim();
  return value === "" ? "-" : value;
};

const resolveGradeValue = (row: StudentMarkRow): string => {
  if (row.isAbsentStudent) {
    return "Absent";
  }
  if (!row.markGrade || row.markGrade === "-") {
    return "-";
  }
  return row.markGrade;
};

const columnValueSelector: Record<
  string,
  (row: StudentMarkRow) => string | number
> = {
  admissionNumber: (row) =>
    row.student?.employeeNumber || row.employeeNumber || "-",
  name: (row) =>
    row.student?.nameWithInitials || row.student?.name || "-",
  academicYear: (row) => row.academicYear ?? "-",
  academicTerm: (row) => row.academicTerm ?? "-",
  academicMedium: (row) => row.academicMedium ?? "-",
  grade: (row) => (row.grade?.grade ? `Grade ${row.grade.grade}` : "-"),
  className: (row) => row.class?.className || "-",
  subjectName: (row) => row.subject?.subjectName || "-",
  isAbsentStudent: (row) => (row.isAbsentStudent ? "Yes" : "No"),
  studentMark: (row) => resolveMarkValue(row),
  markGrade: (row) => resolveGradeValue(row),
};

export const generateStudentMarksPdf = (
  rows: StudentMarkRow[] | null | undefined,
  options: StudentMarksPdfOptions = {}
) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    throw new Error("No student marks available for PDF generation");
  }

  const doc = new jsPDF();
  const headerTitle = options.title || REPORT_TITLE;
  const totalStudents = dataset.length;
  const absentCount = dataset.filter((row) => row.isAbsentStudent).length;
  const presentCount = totalStudents - absentCount;
  const subjectLabel = options.subjectName || "N/A";
  const yearLabel = options.academicYear || "N/A";
  const termLabel = options.academicTerm || "N/A";

  const drawSummary = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(6, 66, 115);
    doc.text(headerTitle, 15, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);

    const summaryLeft = [
      `Subject: ${subjectLabel}`,
      `Academic Year: ${yearLabel}`,
      `Term: ${termLabel}`,
    ];
    const summaryRight = [
      `Total Students: ${totalStudents}`,
      `Present: ${presentCount}`,
      `Absent: ${absentCount}`,
    ];

    summaryLeft.forEach((line, index) => {
      doc.text(line, 15, 56 + index * 5);
    });

    summaryRight.forEach((line, index) => {
      doc.text(line, 120, 56 + index * 5);
    });

    
  };

  const defaultColumns: ColumnDefinition[] = [
    { key: "admissionNumber", label: "Admission No." },
    { key: "name", label: "Student" },
    { key: "grade", label: "Grade" },
    { key: "className", label: "Class" },
    { key: "studentMark", label: "Mark" },
    { key: "markGrade", label: "Mark Grade" },
    { key: "isAbsentStudent", label: "Absent" },
  ];

  const columns = options.columns ?? defaultColumns;
  const visibility =
    options.visibility ??
    columns.reduce<Record<string, boolean>>((acc, col) => {
      acc[col.key] = true;
      return acc;
    }, {});

  const exportColumns = columns.filter(
    (column) => visibility[column.key] && column.key !== "isAbsentStudent"
  );

  const headRow = ["#", ...exportColumns.map((column) => column.label)];

  const body = dataset.map((row, index) => [
    (index + 1).toString(),
    ...exportColumns.map((column) => {
      const selector = columnValueSelector[column.key];
      if (!selector) {
        return "-";
      }
      const value = selector(row);
      if (value === undefined || value === null || value === "") {
        return "-";
      }
      return value;
    }),
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
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
    },
    margin: { top: TABLE_MARGIN_TOP, bottom: TABLE_MARGIN_BOTTOM, left: 12, right: 12 },
    didDrawPage: (dataArg) => {
      drawPdfHeader(doc, { ...options, title: headerTitle });
      drawSummary();
      drawPdfFooter(doc, dataArg.pageNumber, options.organizationName);
    },
  });

  const timestamp = new Date().toISOString().split("T")[0];
  const fileNameParts = [
    "student-marks",
    sanitizeText(options.subjectName),
    sanitizeText(options.academicYear),
    sanitizeText(options.academicTerm),
    timestamp,
  ].filter(Boolean);

  doc.save(`${fileNameParts.join("-")}.pdf`);
};
