import * as XLSX from "xlsx";

export interface StudentMarkRow {
  studentProfileId?: number;
  markId?: string | number | null;
  id?: number | string;
  academicYear?: string;
  academicTerm?: string;
  academicMedium?: string;
  grade?: { grade?: string } | null;
  class?: { className?: string } | null;
  subject?: { subjectName?: string } | null;
  student?: { name?: string; employeeNumber?: string; userName?: string; nameWithInitials?:string } | null;
  studentMark?: string | number | null;
  markGrade?: string | null;
  employeeNumber?: string | null;
  isAbsentStudent?: boolean | null;
}

export const getMarkGrade = (
  mark: number | string | null | undefined
): string => {
  if (mark === null || mark === undefined || mark === "") return "-";
  const n = typeof mark === "string" ? parseFloat(mark) : mark;
  if (Number.isNaN(n)) return "-";
  if (n >= 75) return "A";
  if (n >= 65) return "B";
  if (n >= 55) return "C";
  if (n >= 40) return "S";
  return "F";
};

export interface ParsedStudentMarkRecord {
  normalizedName: string;
  admissionNumber: string;
  studentMark: string | number;
  isAbsentStudent?: boolean;
}

const NAME_COLUMN = "Name";
const ADMISSION_COLUMN = "Admission Number";
const MARK_COLUMN = "Mark";
const ABSENT_COLUMN = "Is Absent Student";

const normalizeMarkValue = (
  value: unknown
): { mark: string | number; inferredAbsent: boolean } => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return { mark: "", inferredAbsent: false };
    }
    if (trimmed.toLowerCase() === "ab") {
      return { mark: "", inferredAbsent: true };
    }
    return { mark: trimmed, inferredAbsent: false };
  }

  if (value === null || value === undefined) {
    return { mark: "", inferredAbsent: false };
  }

  return { mark: value as string | number, inferredAbsent: false };
};

const normalizeAbsentValue = (value: unknown): boolean | undefined => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return undefined;
    }
    if (["true", "yes", "1", "absent"].includes(normalized)) {
      return true;
    }
    if (["false", "no", "0", "present"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
};

export const parseStudentMarksExcel = async (
  file: File
): Promise<ParsedStudentMarkRecord[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const [firstSheetName] = workbook.SheetNames;
  if (!firstSheetName) {
    return [];
  }

  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet) {
    return [];
  }

  // Read as an array-of-arrays so we can skip any filter/header rows
  const sheetRows = XLSX.utils.sheet_to_json<(string | number)[]>(
    worksheet,
    {
      header: 1,
      defval: "",
    }
  );

  if (!sheetRows.length) {
    return [];
  }

  // Find the header row that contains our expected columns
  const headerRowIndex = sheetRows.findIndex((row) => {
    const cells = row.map((cell) => String(cell));
    const hasName = cells.includes(NAME_COLUMN);
    const hasAdmission = cells.includes(ADMISSION_COLUMN);
    const hasMark = cells.includes(MARK_COLUMN);
    return hasName && hasAdmission && hasMark;
  });

  if (headerRowIndex === -1) {
    // No matching header row – cannot parse
    return [];
  }

  const headerRow = sheetRows[headerRowIndex].map((cell) => String(cell));
  const nameIndex = headerRow.indexOf(NAME_COLUMN);
  const admissionIndex = headerRow.indexOf(ADMISSION_COLUMN);
  const markIndex = headerRow.indexOf(MARK_COLUMN);
  const absentIndex = headerRow.indexOf(ABSENT_COLUMN);

  if (nameIndex === -1 || admissionIndex === -1 || markIndex === -1) {
    return [];
  }

  const dataRows = sheetRows.slice(headerRowIndex + 1);

  return dataRows
    .map((row) => {
      const nameCell = row[nameIndex];
      const admissionCell = row[admissionIndex];
      const markCell = row[markIndex];
      const absentCell =
        absentIndex >= 0 ? row[absentIndex] : undefined;

      const nameValue =
        typeof nameCell === "string" ? nameCell : String(nameCell ?? "");
      const admissionValue = admissionCell;
      const { mark, inferredAbsent } = normalizeMarkValue(markCell);
      const absentValue = normalizeAbsentValue(absentCell);
      const hasExplicitMark =
        typeof mark === "number"
          ? true
          : typeof mark === "string"
          ? mark.trim() !== ""
          : false;

      const normalizedName = nameValue.trim().toLowerCase();
      const normalizedAdmission =
        admissionValue === null || admissionValue === undefined
          ? ""
          : String(admissionValue).trim().toLowerCase();

      // Skip completely empty rows
      if (!normalizedName && !normalizedAdmission) {
        return null;
      }

      if (!normalizedName || !normalizedAdmission) {
        return null;
      }

      const resolvedAbsent = inferredAbsent
        ? true
        : hasExplicitMark
        ? false
        : absentValue;

      return {
        normalizedName,
        admissionNumber: normalizedAdmission,
        studentMark: mark ?? "",
        isAbsentStudent: resolvedAbsent,
      } as ParsedStudentMarkRecord;
    })
    .filter((row): row is ParsedStudentMarkRecord => row !== null);
};
