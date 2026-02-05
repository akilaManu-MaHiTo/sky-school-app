import * as XLSX from "xlsx";

export interface ClassReportSubject {
  id?: string | number;
  subjectName: string;
}

export interface ClassReportRow {
  id: string;
  admissionNumber?: string | number | null;
  userName?: string | null;
  nameWithInitials?: string | null;
  email?: string | null;
  averageOfMarks?: number | string | null;
  position?: number | string | null;
  subjectMarks: Record<string, number | string | null>;
  groupMarks: Record<string, number | string | null>;
}

export interface ClassReportExcelOptions {
  title?: string;
  fileName?: string;
  organizationName?: string;
  gradeLabel?: string;
  classLabel?: string;
  yearLabel?: string;
  termLabel?: string;
}

interface ExportPayload {
  title?: string;
  subjects: ClassReportSubject[];
  groupNames: string[]; // kept for compatibility but not used in export
  rows: ClassReportRow[];
  options?: ClassReportExcelOptions;
}

const formatCellValue = (value: any): string | number => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return value;
};

export const exportClassReportToExcel = ({
  title,
  subjects,
  groupNames,
  rows,
  options,
}: ExportPayload) => {
  const dataset = Array.isArray(rows) ? rows : [];

  if (!dataset.length) {
    return;
  }

  const metaTitle = options?.title || title;
  const metaOrgName = options?.organizationName;
  const metaGrade = options?.gradeLabel;
  const metaClass = options?.classLabel;
  const metaYear = options?.yearLabel;
  const metaTerm = options?.termLabel;

  const header = [
    "Admission Number",
    "Student",
    "Average",
    "Position",
    ...subjects.map((s) => s.subjectName),
  ];

  const body = dataset.map((row) => {
    const base = [
      formatCellValue(row.admissionNumber),
      formatCellValue(row.nameWithInitials ?? row.userName),
      formatCellValue(
        typeof row.averageOfMarks === "number"
          ? row.averageOfMarks.toFixed(2)
          : row.averageOfMarks,
      ),
      formatCellValue(row.position),
    ];

    const subjectValues = subjects.map((subject) => {
      const value = row.subjectMarks?.[subject.subjectName];
      return formatCellValue(value);
    });

    return [...base, ...subjectValues];
  });

  const columnCount = header.length;

  const padRow = (row: (string | number)[]): (string | number)[] => {
    if (row.length >= columnCount) {
      return row.slice(0, columnCount);
    }
    return [...row, ...Array(columnCount - row.length).fill("")];
  };

  const metaRows: (string | number)[][] = [];

  if (metaOrgName) {
    metaRows.push([metaOrgName]);
  }

  if (metaTitle) {
    metaRows.push([metaTitle]);
  }
  if (metaYear) {
    metaRows.push([metaYear]);
  }

  const worksheetData: (string | number)[][] = [
    ...metaRows.map(padRow),
    ...(metaRows.length ? [Array(columnCount).fill("")] : []),
    header,
    ...body,
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Class Report");

  const safeTitle = (options?.title || title || "class-report").replace(
    /[^a-z0-9]+/gi,
    "-",
  );
  const fileName = options?.fileName || `${safeTitle.toLowerCase()}.xlsx`;

  XLSX.writeFile(workbook, fileName);
};
