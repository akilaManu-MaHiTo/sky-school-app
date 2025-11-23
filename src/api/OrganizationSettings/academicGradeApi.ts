import axios from "axios";
import { z } from "zod";

export const AcademicGradeSchema = z.object({
  id: z.number(),
  grade: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type AcademicGrade = z.infer<typeof AcademicGradeSchema>;

export async function getGradesData() {
  const res = await axios.get(`/api/grade`);
  return res.data;
}
export const createAcademicGrade = async (academicGrade: AcademicGrade) => {
  const res = await axios.post(`/api/grade`, academicGrade);
  return res.data;
}