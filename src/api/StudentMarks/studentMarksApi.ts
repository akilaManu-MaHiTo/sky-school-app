import axios from "axios";
import { z } from "zod";

export const dashBoardFilterSchema = z.object({
  gradeId: z.string(),
  teacherClassName: z.string(),
  teacherYear: z.string(),
});

export type TeacherDashBoardFilter = z.infer<typeof dashBoardFilterSchema>;

export const examTerms = ["Term 1", "Term 2", "Term 3"];

export async function fetchStudentMarks(
  gradeId: number,
  classId: number,
  year: string,
  medium: string,
  subjectId: number,
  term: string
) {
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
  term: string
) {
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
}) {
  const {
    studentProfileId,
    academicSubjectId,
    studentMark,
    markGrade,
    academicYear,
    academicTerm,
  } = payload;

  const marksData = {
    studentProfileId,
    academicSubjectId,
    studentMark,
    markGrade,
    academicYear,
    academicTerm,
  };

  const res = await axios.post(`/api/student-marks`, marksData);
  return res.data;
}
