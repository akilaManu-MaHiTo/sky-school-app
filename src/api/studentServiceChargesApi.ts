import axios from "axios";
import { z } from "zod";
import { userSchema, type User } from "./userApi";
import { AcademicYearSchema } from "./OrganizationSettings/academicGradeApi";

export const studentServiceChargeSchema = z.object({
  student: userSchema,
  chargesCategory: z.string(),
  yearForCharge: AcademicYearSchema,
  amount: z.number(),
  dateCharged: z.date(),
  remarks: z.string().optional(),
});

export const chargeCategories = [
  "School Service Charges Fees",
  "Sports Meet Fees",
];

export const chargeFilterCategories = [
  "School Service Charges Fees",
  "Sports Meet Fees",
  "All",
];

export type StudentServiceChargeForm = z.infer<
  typeof studentServiceChargeSchema
>;

export interface CreateStudentServiceChargeOptions {
  confirmForChildren?: boolean;
  studentIds?: number[];
}

export interface StudentServiceCharge extends StudentServiceChargeForm {
  id: string;
}

function mapToApiPayload(
  data: StudentServiceChargeForm | (StudentServiceChargeForm & { id?: string }),
  options?: CreateStudentServiceChargeOptions,
) {
  return {
    studentId: (data.student as User).id,
    chargesCategory: data.chargesCategory,
    yearForCharge: data.yearForCharge.year,
    amount: data.amount,
    dateCharged: data.dateCharged.toISOString().split("T")[0],
    remarks: data.remarks,
    ...(options?.confirmForChildren !== undefined && {
      confirmForChildren: options.confirmForChildren,
    }),
    ...(options?.studentIds && options.studentIds.length > 0 && {
      studentIds: options.studentIds,
    }),
  };
}

export async function fetchStudentServiceCharges(id: number) {
  const res = await axios.get(`/api/student-service-charges/${id}/student`);
  return res.data;
}
export async function fetchCheckingStudentServiceCharges(
  year: any,
  gradeId: any,
  classId: any,
  category: string,
) {
  const selectedYear = year.year;
  const selectedGradeId = gradeId.id;
  const selectedClassId = classId.id;
  const res = await axios.get(
    `/api/student-service-charges/${selectedYear}/${selectedGradeId}/${selectedClassId}/${category}/check`,
  );
  return res.data;
}

export async function createStudentServiceCharge(
  data: StudentServiceChargeForm,
  options?: CreateStudentServiceChargeOptions,
) {
  const payload = mapToApiPayload(data, options);
  const res = await axios.post("/api/student-service-charges", payload);
  return res.data;
}

export async function updateStudentServiceCharge(
  id: string,
  data: StudentServiceChargeForm,
) {
  const payload = mapToApiPayload(data);
  const res = await axios.post(`/api/student-service-charges/${id}`, payload);
  return res.data;
}

export async function deleteStudentServiceCharge(id: string) {
  const res = await axios.delete(`/api/student-service-charges/${id}`);
  return res.data;
}
