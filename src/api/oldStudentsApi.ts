import axios from "axios";
import { z } from "zod";

export const oldStudentUniversitySchema = z.object({
  id: z.number().optional(),
  studentId: z.number(),
  universityName: z.string(),
  country: z.string(),
  city: z.string(),
  degree: z.string(),
  faculty: z.string(),
  yearOfAdmission: z.string(),
  yearOfGraduation: z.string(),
});

export type OldStudentUniversity = z.infer<typeof oldStudentUniversitySchema>;

export type OldStudentUniversityForm = Omit<OldStudentUniversity, "id">;

export async function createOldStudentUniversity(
  data: OldStudentUniversityForm,
) {
  const res = await axios.post("/api/old-students-universities", data);
  return res.data;
}

export async function updateOldStudentUniversity(
  id: number | string,
  data: OldStudentUniversityForm,
) {
  const res = await axios.post(
    `/api/old-students-universities/${id}`,
    data,
  );
  return res.data;
}

export async function deleteOldStudentUniversity(id: number | string) {
  const res = await axios.delete(`/api/old-students-universities/${id}`);
  return res.data;
}

export const oldStudentOccupationSchema = z.object({
  id: z.number().optional(),
  studentId: z.number(),
  companyName: z.string(),
  occupation: z.string(),
  description: z.string().nullable().optional(),
  dateOfRegistration: z.string(),
  country: z.string(),
  city: z.string(),
});

export type OldStudentOccupation = z.infer<typeof oldStudentOccupationSchema>;

export type OldStudentOccupationForm = Omit<OldStudentOccupation, "id">;

export async function createOldStudentOccupation(
  data: OldStudentOccupationForm,
) {
  const res = await axios.post("/api/old-students-occupations", data);
  return res.data;
}

export async function updateOldStudentOccupation(
  id: number | string,
  data: OldStudentOccupationForm,
) {
  const res = await axios.post(`/api/old-students-occupations/${id}`, data);
  return res.data;
}

export async function deleteOldStudentOccupation(id: number | string) {
  const res = await axios.delete(`/api/old-students-occupations/${id}`);
  return res.data;
}

// Old Student listing & search

export const oldStudentSchema = z.object({
  id: z.number(),
  name: z.string(),
  userName: z.string(),
  nameWithInitials: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  employeeType: z.string().optional(),
  employeeNumber: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
  otp: z.any().optional(),
  otp_expires_at: z.any().optional(),
  emailVerifiedAt: z.any().optional(),
  userType: z.any().optional(),
  assigneeLevel: z.any().optional(),
  profileImage: z.any().optional(),
  availability: z.union([z.number(), z.boolean()]).nullable().optional(),
  gender: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  nationalId: z.string().nullable().optional(),
  dateOfRegister: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
  old_universities: z.array(oldStudentUniversitySchema).default([]),
  old_occupations: z.array(oldStudentOccupationSchema).default([]),
});

export type OldStudent = z.infer<typeof oldStudentSchema>;

const oldStudentsResponseSchema = z.array(oldStudentSchema);

export async function fetchOldStudents(search: string) {
  const res = await axios.get("/api/old-students", {
    params: {
      search,
    },
  });

  return oldStudentsResponseSchema.parse(res.data);
}
