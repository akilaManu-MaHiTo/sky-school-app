import axios from "axios";
import { z } from "zod";

export const dashBoardFilterSchema = z.object({
  gradeId: z.string(),
  teacherClassName: z.string(),
  teacherYear: z.string(),
});

export type TeacherDashBoardFilter = z.infer<typeof dashBoardFilterSchema>;

export const examTerms = ["Term 1", "Term 2", "Term 3", "Monthly Exam"];
export const examReportTerms = [
  "All",
  "Term 1",
  "Term 2",
  "Term 3",
  "Monthly Exam",
];
export const examReportStatus = [
  "All",
  "Pending",
  "Done"
];
export const markGrades = [
  "A","B","C","D","F"
];
export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function fetchStudentMarks(
  gradeId: number,
  classId: number,
  year: string,
  medium: string,
  subjectId: number,
  term: string,
  month: string
) {
  if (term === "Monthly Exam") {
    term = month;
  }
  const res = await axios.get(
    `/api/student-profiles/${gradeId}/${classId}/${year}/${medium}/${subjectId}/${term}marks`
  );
  return res.data;
}

export async function fetchTeacherYears() {
  const res = await axios.get(`/api/teacher-years`);
  return res.data;
}

export async function fetchTeacherGrade(year: string) {
  const res = await axios.get(`/api/teacher-grades/${year}`);
  return res.data;
}

export async function fetchTeacherMedium(year: string) {
  const res = await axios.get(`/api/teacher-mediums/${year}`);
  return res.data;
}

export async function fetchTeacherClass(year: string, grade: any) {
  const gradeId = grade.id;
  const res = await axios.get(`/api/teacher-class/${year}/${gradeId}`);
  return res.data;
}

export async function fetchTeacherSubject(
  year: string,
  grade: any,
  className: any,
  medium: string
) {
  const gradeId = grade.id;
  const classId = className.id;
  const res = await axios.get(
    `/api/teacher-subject/${year}/${gradeId}/${classId}/${medium}/subject`
  );
  return res.data;
}

export async function fetchExamStudentMarks(
  grade: any,
  className: any,
  year: string,
  medium: string,
  subject: any,
  term: string,
  month: string
) {
  if (term === "Monthly Exam") {
    term = month;
  }
  const gradeId = grade.id;
  const classId = className.id;
  const subjectId = subject.id;
  const res = await axios.get(
    `/api/student-profiles/${gradeId}/${classId}/${year}/${medium}/${subjectId}/${term}/marks`
  );
  return res.data;
}

export async function submitStudentMarks(payload: {
  studentProfileId: number;
  academicSubjectId: number;
  studentMark: string;
  markGrade: string;
  academicYear: string;
  academicTerm: string;
  isAbsentStudent?: boolean;
  selectedMonth: string;
}) {
  if (payload.academicTerm === "Monthly Exam" && payload.selectedMonth) {
    payload.academicTerm = payload.selectedMonth;
  }
  const {
    studentProfileId,
    academicSubjectId,
    studentMark,
    markGrade,
    academicYear,
    academicTerm,
    isAbsentStudent,
  } = payload;

  const marksData = {
    studentProfileId,
    academicSubjectId,
    studentMark,
    markGrade,
    academicYear,
    academicTerm,
    isAbsentStudent,
  };

  const res = await axios.post(`/api/student-marks`, marksData);
  return res.data;
}

export async function UpdateStudentMarks(payload: {
  studentProfileId: number;
  academicSubjectId: number;
  studentMark: string;
  markGrade: string;
  academicYear: string;
  academicTerm: string;
  markId: string;
  isAbsentStudent?: boolean;
  selectedMonth: string;
}) {
  if (payload.academicTerm === "Monthly Exam" && payload.selectedMonth) {
    payload.academicTerm = payload.selectedMonth;
  }
  const {
    studentProfileId,
    academicSubjectId,
    studentMark,
    markGrade,
    academicYear,
    academicTerm,
    markId,
    isAbsentStudent,
  } = payload;

  const marksData = {
    studentProfileId,
    academicSubjectId,
    studentMark,
    markGrade,
    academicYear,
    academicTerm,
    isAbsentStudent,
  };

  const res = await axios.post(`/api/student-marks/${markId}`, marksData);
  return res.data;
}

export async function getClassReportBarChart(
  year: any,
  grade: any,
  className: any,
  term: string,
  month: string
) {
  const yearId = year.year;
  const gradeId = grade.id;
  const classId = className.id;
  if (term === "Monthly Exam") {
    term = month;
  }
  const res = await axios.get(
    `/api/class-report/${yearId}/${gradeId}/${classId}/${term}/bar-chart`
  );
  return res.data;
}

export async function getClassReportCard(
  year: any,
  grade: any,
  className: any,
  term: string,
  month: string
) {
  const yearId = year.year;
  const gradeId = grade.id;
  const classId = className.id;
  if (term === "Monthly Exam") {
    term = month;
  }
  const res = await axios.get(
    `/api/class-report/${yearId}/${gradeId}/${classId}/${term}/report-card`
  );
  return res.data;
}

export async function getAllClassReportCard(
  year: any,
  grade: any,
  className: any
) {
  const yearId = year.year;
  const gradeId = grade.id;
  const classId = className.id;
  const res = await axios.get(
    `/api/class-report/${yearId}/${gradeId}/${classId}/All/all-report-card`
  );
  return res.data;
}

export async function getAllClassReportAllBarChart(
  year: any,
  grade: any,
  className: any
) {
  const yearId = year.year;
  const gradeId = grade.id;
  const classId = className.id;
  const res = await axios.get(
    `/api/class-report/${yearId}/${gradeId}/${classId}/All/all-bar-chart`
  );
  return res.data;
}

export async function getClassReportMarkGradesTable(
  year: any,
  grade: any,
  className: any,
  term: string,
  month: string
) {
  const yearId = year.year;
  const gradeId = grade.id;
  const classId = className.id;
  if (term === "Monthly Exam") {
    term = month;
  }
  const res = await axios.get(
    `/api/class-report/${yearId}/${gradeId}/${classId}/${term}/mark-grades-table`
  );
  return res.data;
}

export async function getAllClassReportAllMarkGradesTable(
  year: any,
  grade: any,
  className: any
) {
  const yearId = year.year;
  const gradeId = grade.id;
  const classId = className.id;
  const res = await axios.get(
    `/api/class-report/${yearId}/${gradeId}/${classId}/All/all-mark-grades-table`
  );
  return res.data;
}

export async function marksEntryMonitoring(
  year: any,
  gradeId: any,
  examType: string,
  status: string,
  keyword: string
) {
  const selectedYear = year.year;
  const selectedGradeId = gradeId.id;

  const res = await axios.get(
    `/api/mark-check/${selectedYear}/${selectedGradeId}/${examType}/${status}/search?search=${keyword}`
  );
  return res.data;
}

export async function getClassReportBarChartByGrades(
  year: any,
  grade: any,
  className: any,
  term: string,
  month: string,
  markGrade: string
) {
  const yearId = year.year;
  const gradeId = grade.id;
  const classId = className.id;
  if (term === "Monthly Exam") {
    term = month;
  }
  if (markGrade === null || markGrade === undefined) {
    markGrade = "A";
  }
  const res = await axios.get(
    `/api/class-report/${yearId}/${gradeId}/${classId}/${term}/${markGrade}/bar-chart`
  );
  return res.data;
}

export async function getAllClassReportAllBarChartMarkGrade(
  year: any,
  grade: any,
  className: any,
  markGrade: string
) {
  const yearId = year.year;
  const gradeId = grade.id;
  const classId = className.id;
  if (markGrade === null || markGrade === undefined) {
    markGrade = "A";
  }
  const res = await axios.get(
    `/api/class-report/${yearId}/${gradeId}/${classId}/All/${markGrade}/all-bar-chart`
  );
  return res.data;
}