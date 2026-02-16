import axios from "axios";
import { z } from "zod";
import { format } from "date-fns";
import { SubjectSchema } from "./OrganizationSettings/academicGradeApi";
import { userSchema, User } from "./userApi";

export const TeacherAcademicWorkSchema = z.object({
  id: z.number(),
  teacherId: userSchema,
  subjectId: SubjectSchema,
  title: z.string(),
  academicWork: z.string(),
  date: z.date(),
  time: z.date(),
  teacher: userSchema.optional(),
  subject: SubjectSchema.optional(),
});

export type TeacherAcademicWork = z.infer<typeof TeacherAcademicWorkSchema>;

export async function fetchTeacherAcademicWorksByDate(date: string) {
  const res = await axios.get(`/api/teacher-academic-works-by-date/${date}`);
  return res.data;
}

export async function fetchTeacherAcademicWorksByAdmin(
  year: string,
  gradeId: number,
  classId: number,
  date: string,
) {
  const res = await axios.get(
    `/api/teacher-academic-works-by-admin/${year}/${gradeId}/${classId}/${date}`,
  );
  return res.data;
}

function formatLocalDate(value: Date | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return format(value, "yyyy-MM-dd");
}

export async function createTeacherAcademicWork(payload: TeacherAcademicWork) {
  console.log("Payload in API call:", payload);
  const data = {
    ...payload,
    teacherId: payload.teacher.id,
    subjectId: payload.subject.id,
    date: formatLocalDate(payload.date),
  };

  const res = await axios.post("/api/teacher-academic-works", data);
  return res.data;
}

export async function updateTeacherAcademicWork(payload: TeacherAcademicWork) {
  const data = {
    ...payload,
    teacherId: payload.teacher.id,
    subjectId: payload.subject.id,
    date: formatLocalDate(payload.date),
  };

  const res = await axios.post(
    `/api/teacher-academic-works/${payload.id}`,
    data,
  );
  return res.data;
}

export async function deleteTeacherAcademicWork(id: number | string) {
  const res = await axios.delete(`/api/teacher-academic-works/${id}`);
  return res.data;
}

export async function approveTeacherAcademicWork({
  id,
}: {
  id: number | string;
}) {
  const res = await axios.post(`/api/teacher-academic-works-approve/${id}`);
  return res.data;
}
