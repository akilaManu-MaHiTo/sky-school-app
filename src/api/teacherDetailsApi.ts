import { z } from "zod";
import axios from "axios";

export const teacherDetailsSchema = z.object({
  id: z.string(),
  civilStatus: z.string(),
  dateOfRetirement: z.string().nullable(),
  dateOfFirstRegistration: z.string().nullable(),
  teacherType: z.string().nullable(),
  teacherGrade: z.string().nullable(),
  dateOfGrade: z.string().nullable(),
  salaryType: z.string().nullable(),
  registerPostNumber: z.string().nullable(),
  registerPostDate: z.string().nullable(),
  registerSubject: z.string().nullable(),
});

export type TeacherDetails = z.infer<typeof teacherDetailsSchema>;


export async function fetchTeacherDetails(id: string) {
  const res = await axios.get(`/api/teacher-details/${id}`);
  return res.data;
}

export async function saveTeacherDetails(payload: TeacherDetails) {
  const res = await axios.post(`/api/teacher-details`, payload);
  return res.data;
}

export async function updateTeacherDetails(payload: TeacherDetails) {
  const res = await axios.post(`/api/teacher-details/${payload.id}`, payload);
  return res.data;
}