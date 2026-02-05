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

  basketSubjectsIds: z.array(z.number()).optional(),
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

export const BasketGroup = [
  {
    id: "1",
    group: "Group 1",
  },
  { id: "2", group: "Group 2" },
  {
    id: "3",
    group: "Group 3",
  },
];

export const ClassCategories = [
  {
    id: "1",
    academicMedium: "1 - 5 Class",
  },
  { id: "2", academicMedium: "6 - 11 Class" },

  { id: "3", academicMedium: "12 - 13 Class" },
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

export const createAcademicDetailByAdmin = async (
  payload: AcademicDetail,
  teacherId: number,
) => {
  console.log("payload", payload);
  const submitData = {
    ...payload,
    academicGradeId: Number(payload.grades.id),
    academicSubjectId: Number(payload.subjects.id),
    academicClassId: Number(payload.classes.id),
    academicMedium: payload.subjects.subjectMedium,
  };
  console.log("submitData", submitData);
  const res = await axios.post(
    `api/teacher-profiles-create/admin/${teacherId}`,
    submitData,
  );
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
    submitData,
  );
  return res.data;
};

export const updateAcademicDetailsByAdmin = async (payload: AcademicDetail) => {
  const submitData = {
    ...payload,
    academicGradeId: Number(payload.grades.id),
    academicSubjectId: Number(payload.subjects.id),
    academicClassId: Number(payload.classes.id),
    academicMedium: payload.subjects.subjectMedium,
  };
  const res = await axios.post(
    `api/teacher-profiles/admin/${payload.id}`,
    submitData,
  );
  return res.data;
};

export const deleteAcademicDetail = async (id: number) => {
  const res = await axios.delete(`api/teacher-profiles/${id}`);
  return res.data;
};

export const createAcademicStudentDetail = async (payload: AcademicDetail) => {
  console.log("payload", payload);
  let basketSubjectsIds: number[] = [];
  if (payload.group1 || payload.group2 || payload.group3) {
    basketSubjectsIds = [
      payload?.group1?.id,
      payload?.group2?.id,
      payload?.group3?.id,
    ].filter((id) => id !== undefined);
  }
  const submitData = {
    ...payload,
    academicGradeId: Number(payload.grades.id),
    academicClassId: Number(payload.classes.id),
    basketSubjectsIds,
  };
  console.log("submitData", submitData);
  const res = await axios.post(`api/student-profiles`, submitData);
  return res.data;
};

export const createAcademicStudentDetailByAdmin = async (
  payload: AcademicDetail,
  studentId: number,
) => {
  console.log("payload", payload);
  let basketSubjectsIds: number[] = [];
  if (payload.group1 || payload.group2 || payload.group3) {
    basketSubjectsIds = [
      payload?.group1?.id,
      payload?.group2?.id,
      payload?.group3?.id,
    ].filter((id) => id !== undefined);
  }
  const submitData = {
    ...payload,
    academicGradeId: Number(payload.grades.id),
    academicClassId: Number(payload.classes.id),
    basketSubjectsIds,
  };
  console.log("submitData", submitData);
  const res = await axios.post(
    `api/student-profiles-create/admin/${studentId}`,
    submitData,
  );
  return res.data;
};
export const updateAcademicStudentDetail = async (payload: AcademicDetail) => {
  const gradeNumber = Number(payload.grades.grade);

  const isGroup1 = gradeNumber === 10 || gradeNumber === 11;
  const isGroup2 = gradeNumber >= 6 && gradeNumber <= 11;
  const isGroup3 = gradeNumber === 10 || gradeNumber === 11;

  let basketSubjectsIds: number[] = [];

  if (isGroup1 && payload.group1?.id !== undefined) {
    basketSubjectsIds.push(payload.group1.id);
  }

  if (isGroup2 && payload.group2?.id !== undefined) {
    basketSubjectsIds.push(payload.group2.id);
  }

  if (isGroup3 && payload.group3?.id !== undefined) {
    basketSubjectsIds.push(payload.group3.id);
  }

  const submitData = {
    ...payload,
    academicGradeId: Number(payload.grades.id),
    academicClassId: Number(payload.classes.id),
    basketSubjectsIds,
  };
  const res = await axios.post(
    `api/student-profiles/${payload.id}`,
    submitData,
  );
  return res.data;
};

export const updateAcademicStudentDetailsByAdmin = async (
  payload: AcademicDetail,
) => {
  const gradeNumber = Number(payload.grades.grade);

  const isGroup1 = gradeNumber === 10 || gradeNumber === 11;
  const isGroup2 = gradeNumber >= 6 && gradeNumber <= 11;
  const isGroup3 = gradeNumber === 10 || gradeNumber === 11;

  let basketSubjectsIds: number[] = [];

  if (isGroup1 && payload.group1?.id !== undefined) {
    basketSubjectsIds.push(payload.group1.id);
  }

  if (isGroup2 && payload.group2?.id !== undefined) {
    basketSubjectsIds.push(payload.group2.id);
  }

  if (isGroup3 && payload.group3?.id !== undefined) {
    basketSubjectsIds.push(payload.group3.id);
  }
  const submitData = {
    ...payload,
    academicGradeId: Number(payload.grades.id),
    academicClassId: Number(payload.classes.id),
    basketSubjectsIds,
  };
  const res = await axios.post(
    `api/student-profiles/admin/${payload.id}`,
    submitData,
  );
  return res.data;
};
