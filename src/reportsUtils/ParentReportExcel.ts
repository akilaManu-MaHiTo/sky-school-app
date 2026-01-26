import * as XLSX from "xlsx";

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

export interface ParentReportExcelOptions {
  organizationName?: string;
  studentName?: string;
  admissionNumber?: string | number;
  yearLabel?: string | number | null;
  gradeLabel?: string | number | null;
  classLabel?: string | null;
}

interface ExportPayload {
  sections: ParentReportSection[];
  options?: ParentReportExcelOptions;
}

const formatCellValue = (value: any): string | number => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  if (typeof value === "number") {
    return value;
  }
  return String(value);
};

export const exportParentReportToExcel = ({
  sections,
  options,
}: ExportPayload) => {
  const dataset = Array.isArray(sections) ? sections : [];

  if (!dataset.length) {
    return;
  }

  const workbook = XLSX.utils.book_new();

  dataset.forEach((section, index) => {
    const header = [
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

    const columnCount = header.length;

    const padRow = (row: (string | number)[]): (string | number)[] => {
      if (row.length >= columnCount) {
        return row.slice(0, columnCount);
      }
      return [...row, ...Array(columnCount - row.length).fill("")];
    };

    const metaRows: (string | number)[][] = [];

    if (options?.organizationName) {
      metaRows.push([options.organizationName]);
    }

    if (options?.studentName) {
      const studentLabel = options.admissionNumber
        ? `${options.studentName} (${options.admissionNumber})`
        : options.studentName;
      metaRows.push([studentLabel]);
    }

    const yearLabel =
      section.academicDetails?.year ?? options?.yearLabel ?? null;
    const gradeLabel =
      section.academicDetails?.grade ?? options?.gradeLabel ?? null;
    const classLabel =
      section.academicDetails?.className ?? options?.classLabel ?? null;

    const details: string[] = [];
    if (yearLabel != null) details.push(`Year: ${yearLabel}`);
    if (gradeLabel != null) details.push(`Grade: ${gradeLabel}`);
    if (classLabel) details.push(`Class: ${classLabel}`);

    if (details.length) {
      metaRows.push([details.join(" | ")]);
    }

    const examTitle = section.examType || `Exam ${index + 1}`;
    metaRows.push([examTitle]);

    if (section.overall) {
      const avg =
        typeof section.overall.averageOfMarks === "number"
          ? section.overall.averageOfMarks.toFixed(2)
          : section.overall.averageOfMarks;
      const position = section.overall.position ?? "-";
      metaRows.push([
        `Overall Average: ${avg ?? "-"} | Position: ${position}`,
      ]);
    }

    const worksheetData: (string | number)[][] = [
      ...metaRows.map(padRow),
      ...(metaRows.length ? [Array(columnCount).fill("")] : []),
      header,
      ...body,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    const rawTitle = examTitle || `Exam ${index + 1}`;
    const sheetTitle = String(rawTitle).slice(0, 31) || `Exam-${index + 1}`;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);
  });

  const baseStudent = options?.studentName
    ? options.admissionNumber
      ? `${options.studentName}-${options.admissionNumber}`
      : options.studentName
    : "parent-report";

  const suffix = dataset.length > 1 ? "all-terms" : "single-term";
  const safeBase = baseStudent.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const timestamp = new Date().toISOString().split("T")[0];
  const fileName = `${safeBase || "parent-report"}-${suffix}-${timestamp}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};
