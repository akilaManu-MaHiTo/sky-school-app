import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { drawPdfHeader, PdfHeaderData } from "./OrganizationHeaderPDF";
import { drawPdfFooter } from "./OrganizationFooter";

export interface StudentServiceChargeRow {
  admissionNo: string | number | null | undefined;
  studentName: string | null | undefined;
  grade: string | number | null | undefined;
  className: string | null | undefined;
  academicYear: string | number | null | undefined;
  chargesCategory: string | null | undefined;
  amount: number | string | null | undefined;
  dateCharged: string | null | undefined;
  remarks: string | null | undefined;
}

export interface StudentServiceChargesPdfOptions extends PdfHeaderData {}

const TABLE_MARGIN_TOP = 60;
const TABLE_MARGIN_BOTTOM = 25;

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
};

export const generateStudentServiceChargesPdf = (
  rows: StudentServiceChargeRow[] | any[] | null | undefined,
  headerData?: StudentServiceChargesPdfOptions,
) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    throw new Error("No student service charges available for PDF generation");
  }

  const doc = new jsPDF("p", "mm", "a4");
  const title = headerData?.title || "Student Service Charges";

  const headRow = [
    "#",
    "Admission No",
    "Student Name",
    "Grade",
    "Class",
    "Academic Year",
    "Charge Category",
    "Amount",
    "Date Charged",
    "Remarks",
    "Status",
  ];

  const body = dataset.map((row: any, index: number) => {
    const amount = row.amount ?? "-";
    const isPending =
      amount === "-" || amount === null || amount === undefined || amount === 0;
    const status = isPending ? "Payment Pending" : "Payment Done";

    return [
      index + 1,
      formatCellValue(row.admissionNo),
      formatCellValue(row.studentName),
      formatCellValue(row.grade),
      formatCellValue(row.className),
      formatCellValue(row.academicYear),
      formatCellValue(row.chargesCategory),
      typeof amount === "number" ? amount.toFixed(2) : formatCellValue(amount),
      formatCellValue(row.dateCharged),
      formatCellValue(row.remarks),
      status,
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
      1: { cellWidth: 24 },
      2: { cellWidth: 38 },
      3: { cellWidth: 16 },
      4: { cellWidth: 20 },
      5: { cellWidth: 24 },
      6: { cellWidth: 28 },
      7: { cellWidth: 20, halign: "right" },
      8: { cellWidth: 26 },
      9: { cellWidth: 32 },
      10: { cellWidth: 24 },
    },
    didDrawPage: (dataArg) => {
      drawPdfHeader(doc, { ...headerData, title });

      // Title below header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(6, 66, 115);
      doc.text(title, 15, 50);

      // Optional summary line (year / grade / class)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);

      const summaryParts: string[] = [];
      if (headerData?.yearLabel) summaryParts.push(`Year: ${headerData.yearLabel}`);
      if (headerData?.gradeLabel) summaryParts.push(`Grade: ${headerData.gradeLabel}`);
      if (headerData?.classLabel) summaryParts.push(`Class: ${headerData.classLabel}`);

      if (summaryParts.length) {
        doc.text(summaryParts.join("  |  "), 15, 56);
      }

      drawPdfFooter(doc, dataArg.pageNumber, headerData?.organizationName);
    },
  });

  const timestamp = new Date().toISOString().split("T")[0];
  const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`${safeTitle || "student-service-charges"}-${timestamp}.pdf`);
};
