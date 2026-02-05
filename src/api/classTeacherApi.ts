import { z } from "zod";
import axios from "axios";
import {
  AcademicGradeSchema,
  ClassSchema,
} from "./OrganizationSettings/academicGradeApi";
import { userSchema } from "./userApi";

export const classTeacherSchema = z.object({
  id: z.string(),
  year: z.string(),
  grade: AcademicGradeSchema,
  class: ClassSchema,
  teacher: userSchema,
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ClassTeacher = z.infer<typeof classTeacherSchema>;

export async function fetchClassTeacherData() {
  const res = await axios.get("/api/class-teacher");
  return res.data;
}

export async function fetchTeacherData() {
  const res = await axios.get("/api/teacher-users");
  return res.data;
}

export async function addClassTeacher(data: ClassTeacher) {
  const payload = {
    year: data.year,
    gradeId: data.grade.id,
    classId: data.class.id,
    teacherId: data.teacher.id,
  };

  const res = await axios.post("/api/class-teacher", payload);
  return res.data;
}

export async function updateClassTeacher(data: ClassTeacher) {
  const payload = {
    year: data.year,
    gradeId: data.grade.id,
    classId: data.class.id,
    teacherId: data.teacher.id,
  };

  const res = await axios.post(`/api/class-teacher/${data.id}`, payload);
  return res.data;
}

export async function deleteClassTeacher(id: string) {
  await axios.delete(`/api/class-teacher/${id}`);
}

export async function fetchTeacherDashboardStats(teacherId: number, year: any) {
  const selectedYear = year.year;
  const res = await axios.get(`/api/teacher-dashboard/${teacherId}/${selectedYear}`);
  return res.data;
}
