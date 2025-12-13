import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { StudentMarkRow } from "../views/Academics/studentMarksUtils";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";

export interface StudentMarksPdfOptions extends PdfHeaderData {
  academicYear?: string;
  academicTerm?: string;
  subjectName?: string;
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

  autoTable(doc, {
    startY: TABLE_MARGIN_TOP,
    head: [
      [
        "#",
        "Admission No.",
        "Student",
        "Grade",
        "Class",
        "Mark",
        "Mark Grade",
        "Absent",
      ],
    ],
    body: dataset.map((row, index) => [
      (index + 1).toString(),
      row.student?.employeeNumber || row.employeeNumber || "-",
      row.student?.name || "-",
      row.grade?.grade ? `Grade ${row.grade.grade}` : "-",
      row.class?.className || "-",
      resolveMarkValue(row),
      resolveGradeValue(row),
      row.isAbsentStudent ? "Yes" : "No",
    ]),
    theme: "grid",
    styles: {
      fontSize: 8,
      textColor: [40, 40, 40],
      halign: "left",
      valign: "middle",
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 28 },
      2: { cellWidth: 42 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 18, halign: "center" },
      6: { cellWidth: 20, halign: "center" },
      7: { cellWidth: 18, halign: "center" },
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
