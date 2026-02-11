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
