import * as XLSX from "xlsx";

export interface StudentMarkRow {
  studentProfileId?: number;
  markId?: boolean;
  id?: number | string;
  academicYear?: string;
  academicTerm?: string;
  academicMedium?: string;
  grade?: { grade?: string } | null;
  class?: { className?: string } | null;
  subject?: { subjectName?: string } | null;
  student?: { name?: string; employeeNumber?: string } | null;
  studentMark?: string | number | null;
  markGrade?: string | null;
  employeeNumber?: string | null;
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
}

const NAME_COLUMN = "Name";
const ADMISSION_COLUMN = "Admission Number";
const MARK_COLUMN = "Mark";

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

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: "",
  });

  return rows
    .map((row) => {
      const nameValue =
        typeof row[NAME_COLUMN] === "string" ? row[NAME_COLUMN] : "";
      const admissionValue = row[ADMISSION_COLUMN];
      const mark = row[MARK_COLUMN];

      const normalizedName = nameValue.trim().toLowerCase();
      const normalizedAdmission =
        admissionValue === null || admissionValue === undefined
          ? ""
          : String(admissionValue).trim().toLowerCase();

      if (!normalizedName || !normalizedAdmission) {
        return null;
      }

      return {
        normalizedName,
        admissionNumber: normalizedAdmission,
        studentMark: mark ?? "",
      } as ParsedStudentMarkRecord;
    })
    .filter((row): row is ParsedStudentMarkRecord => row !== null);
};
