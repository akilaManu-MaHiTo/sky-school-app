import axios from "axios";
import { sub } from "date-fns";
import { z } from "zod";
import { ClassSchema, SubjectSchema } from "./academicGradeApi";

export const GradeSchema = z.object({
  id: z.number().optional(),
  grade: z.string(),
});

export const AcademicDetailSchema = z.object({
  id: z.number().optional(),
  academicGradeId: z.string(),
  academicSubjectId: z.string(),
  academicClassId: z.string().optional(),
  academicYear: z.string(),
  academicMedium: z.string(),

  grades: GradeSchema,
  subjects: SubjectSchema,
  classes: ClassSchema,

  group1: SubjectSchema.optional(),
  group2: SubjectSchema.optional(),
  group3: SubjectSchema.optional(),
});

export type AcademicDetail = z.infer<typeof AcademicDetailSchema>;

export const AcademicMedium = [
  {
    id: "1",
    academicMedium: "Sinhala",
  },
  { id: "3", academicMedium: "English" },
  {
    id: "2",
    academicMedium: "Tamil",
  },
];

export const createAcademicDetail = async (payload: AcademicDetail) => {
  console.log("payload", payload);
  const submitData = {
    ...payload,
    academicGradeId: Number(payload.grades.id),
    academicSubjectId: Number(payload.subjects.id),
    academicClassId: Number(payload.classes.id),
    academicMedium: payload.subjects.subjectMedium,
  };
  console.log("submitData", submitData);
  const res = await axios.post(`api/teacher-profiles`, submitData);
  return res.data;
};

export const updateAcademicDetail = async (payload: AcademicDetail) => {
  const submitData = {
    ...payload,
    academicGradeId: Number(payload.grades.id),
    academicSubjectId: Number(payload.subjects.id),
    academicClassId: Number(payload.classes.id),
    academicMedium: payload.subjects.subjectMedium,
  };
  const res = await axios.post(
    `api/teacher-profiles/${payload.id}`,
    submitData
  );
  return res.data;
};

export const deleteAcademicDetail = async (id: number) => {
  const res = await axios.delete(`api/teacher-profiles/${id}`);
  return res.data;
};

export const createAcademicStudentDetail = async (payload: AcademicDetail) => {
  console.log("payload", payload);
  const submitData = {
    ...payload,
    academicGradeId: Number(payload.grades.id),
    academicClassId: Number(payload.classes.id),
  };
  console.log("submitData", submitData);
  const res = await axios.post(`api/student-profiles`, submitData);
  return res.data;
};

export const updateAcademicStudentDetail = async (payload: AcademicDetail) => {
  const submitData = {
    ...payload,
    academicGradeId: Number(payload.grades.id),
    academicClassId: Number(payload.classes.id),
  };
  const res = await axios.post(
    `api/student-profiles/${payload.id}`,
    submitData
  );
  return res.data;
};
