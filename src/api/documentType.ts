import { z } from "zod";
import axios from "axios";

export const categorySchema = z.object({
  id: z.string(),
  documentType: z.string(),
});

export type categorySchema = z.infer<typeof categorySchema>;


export async function fetchAllDocumentType() {
  const res = await axios.get("/api/documents-types");
  return res.data;
}

export async function fetchClassStudentCounts(
  year: any
) {
  const selectedYear = year.year
  const res = await axios.get(`/api/staff-dashboard/${selectedYear}`);
  return res.data;
}
export async function fetchAllStudents(
  year: any
) {
  const selectedYear = year.year
  const res = await axios.get(`/api/staff-dashboard-all-students/${selectedYear}`);
  return res.data;
}
export async function fetchAllTeachers(
  year: any
) {
  const selectedYear = year.year
  const res = await axios.get(`/api/staff-dashboard-all-teachers/${selectedYear}`);
  return res.data;
}
export async function fetchAllParents(
  year: any
) {
  const selectedYear = year.year
  const res = await axios.get(`/api/staff-dashboard/${selectedYear}`);
  return res.data;
}