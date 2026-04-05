import * as XLSX from "xlsx";

export interface StudentServiceChargeExcelRow {
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

export interface StudentServiceChargesExcelOptions {
  title?: string;
  fileName?: string;
  yearLabel?: string | number;
  gradeLabel?: string;
  classLabel?: string;
}

const formatCellValue = (value: unknown): string | number => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return typeof value === "number" ? value : String(value);
};

const getStatusLabel = (amount: unknown): string => {
  if (
    amount === "-" ||
    amount === null ||
    amount === undefined ||
    amount === 0
  ) {
    return "Payment Pending";
  }

  return "Payment Done";
};

export const exportStudentServiceChargesToExcel = (
  rows: StudentServiceChargeExcelRow[] | null | undefined,
  options?: StudentServiceChargesExcelOptions,
) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    throw new Error("No student service charges available for Excel export");
  }

  const title = options?.title || "Student Service Charges";
  const summaryRows: (string | number)[][] = [[title]];

  if (options?.yearLabel) {
    summaryRows.push(["Year", String(options.yearLabel)]);
  }

  if (options?.gradeLabel) {
    summaryRows.push(["Grade", options.gradeLabel]);
  }

  if (options?.classLabel) {
    summaryRows.push(["Class", options.classLabel]);
  }

  summaryRows.push([]);

  const headerRow = [
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

  const dataRows = dataset.map((row, index) => {
    const amount = row.amount ?? "-";

    return [
      index + 1,
      formatCellValue(row.admissionNo),
      formatCellValue(row.studentName),
      formatCellValue(row.grade),
      formatCellValue(row.className),
      formatCellValue(row.academicYear),
      formatCellValue(row.chargesCategory),
      typeof amount === "number" ? Number(amount.toFixed(2)) : formatCellValue(amount),
      formatCellValue(row.dateCharged),
      formatCellValue(row.remarks),
      getStatusLabel(amount),
    ];
  });

  const worksheet = XLSX.utils.aoa_to_sheet([
    ...summaryRows,
    headerRow,
    ...dataRows,
  ]);

  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 28 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
    { wch: 22 },
    { wch: 12 },
    { wch: 16 },
    { wch: 30 },
    { wch: 18 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Charges");

  const timestamp = new Date().toISOString().split("T")[0];
  const safeTitle = title.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const fileName =
    options?.fileName || `${safeTitle || "student-service-charges"}-${timestamp}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};