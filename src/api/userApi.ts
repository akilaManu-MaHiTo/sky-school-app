import axios from "axios";
import { z } from "zod";
import { PermissionKeysObjectSchema } from "../views/Administration/SectionList";
import { StorageFileSchema } from "../utils/StorageFiles.util";

export const userRoleSchema = z.object({
  id: z.number(),
  userType: z.string(),
  description: z.string().optional(),
  permissionObject: PermissionKeysObjectSchema,
  created_at: z.string(),
});

export type UserRole = z.infer<typeof userRoleSchema>;

export const userTypeSchema = z.object({
  id: z.number(),
  userType: z.string(),
  description: z.string().optional(),
  permissionObject: PermissionKeysObjectSchema,
  created_at: z.string(),
});

export const userLevelSchema = z.object({
  id: z.string(),
  levelId: z.string(),
  levelName: z.string().optional(),
  created_at: z.string(),
});

export const teacherProfileSchema = z.object({
  id: z.string(),
  academicSubjectId: z.string(),
  academicClassId: z.string().optional(),
  academicYear: z.string(),
  academicMedium: z.string(),
});

type TeacherProfile = z.infer<typeof teacherProfileSchema>;

export enum EmployeeType {
  TEACHER = "Teacher",
  STUDENT = "Student",
  PARENT = "Parent",
}
export type UserLevel = z.infer<typeof userLevelSchema>;

export type UserType = z.infer<typeof userTypeSchema>;

export const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  userTypeId: z.number(),
  name: z.string(),
  userName: z.string(),
  mobile: z.string(),
  emailVerifiedAt: z.string().nullable(),
  role: z.string(),
  roleId: z.string(),
  gender: z.string(),
  availability: z.boolean(),
  responsibleSection: z.array(z.string()),
  userType: userTypeSchema,
  userLevel: userLevelSchema,
  profileImage: z
    .array(z.union([z.instanceof(File), StorageFileSchema]))
    .optional(),
  status: z.string(),
  isCompanyEmployee: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  department: z.string(),
  assignedFactory: z.array(z.string()),
  employeeNumber: z.string(),
  jobPosition: z.string(),
  assigneeLevel: z.string(),
  permissionObject: PermissionKeysObjectSchema,

  birthDate: z.string().optional(),
  userProfile: z.array(teacherProfileSchema)
});

export type User = z.infer<typeof userSchema>;

export const passwordResetSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
  newPassword_confirmation: z.string(),
});

export type PasswordReset = z.infer<typeof passwordResetSchema>;

export async function login({
  userName,
  password,
}: {
  userName: string;
  password: string;
}) {
  const res = await axios.post("/api/login", {
    userName,
    password,
  });
  return res.data;
}

export async function userPasswordReset(data: PasswordReset) {
  const res = await axios.post(`/api/user-change-password`, data);
  return res.data;
}

export async function registerUser({
  name,
  userName,
  email,
  mobileNumber: mobile,
  password,
  confirmPassword: password_confirmation,
  employeeType,
  employeeNumber,
}: {
  email: string;
  password: string;
  name: string;
  mobileNumber: string;
  confirmPassword: string;
  userName: string;
  employeeType: string;
  employeeNumber: string;
}) {
  const res = await axios.post("/api/register", {
    email,
    password,
    name,
    mobile,
    password_confirmation,
    userName,
    employeeType,
    employeeNumber,
  });
  return res.data;
}

export async function validateUser() {
  const res = await axios.get("/api/user");
  return res.data;
}

export async function fetchAllUsers() {
  const res = await axios.get("/api/all-users");
  return res.data;
}

export async function forgotPassword({ email }: { email: string }) {
  const res = await axios.post("/api/forgot-password", {
    email,
  });
  return res.data;
}

export async function otpVerification({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) {
  const res = await axios.post("/api/reset-password", {
    email,
    otp,
  });
  return res.data;
}

export async function resetPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const res = await axios.post("/api/change-password", {
    email,
    password,
  });
  return res.data;
}

export async function fetchAllAssigneeLevel() {
  const res = await axios.get("/api/assignee-level");
  return res.data;
}

export async function updateUserType({
  id,
  userTypeId,
  assigneeLevel,
  department,
  availability,
  jobPosition,
  assignedFactory,
  responsibleSection,
}: {
  id: number;
  userTypeId: number;
  assigneeLevel: string;
  department: string;
  availability: boolean;
  jobPosition: string;
  assignedFactory: string[];
  responsibleSection: string[];
}) {
  const parsedAssignedFactory = Array.isArray(assignedFactory)
    ? assignedFactory
    : JSON.parse(assignedFactory || "[]");
  const parsedResponsibleSection = Array.isArray(responsibleSection)
    ? responsibleSection
    : JSON.parse(responsibleSection || "[]");

  const res = await axios.post(`/api/users/${id}/update`, {
    userType: userTypeId.toString(),
    assigneeLevel: assigneeLevel.toString(),
    department,
    availability,
    jobPosition,
    assignedFactory: parsedAssignedFactory,
    responsibleSection: parsedResponsibleSection,
  });

  return res.data;
}

//assignee by the responsible section
export async function fetchHazardRiskAssignee() {
  const res = await axios.get("/api/hazard-risks-assignee");
  return res.data;
}

export async function fetchAccidentAssignee() {
  const res = await axios.get("/api/accidents-assignee");
  return res.data;
}

export async function fetchIncidentAssignee() {
  const res = await axios.get("/api/incidents-assignee");
  return res.data;
}

export async function fetchMedicineRequestAssignee() {
  const res = await axios.get("/api/medicine-request-assignee");
  return res.data;
}

export async function fetchInternalAuditAssignee() {
  const res = await axios.get("/api/internal-audit-assignee");
  return res.data;
}

export async function fetchExternalAuditAssignee() {
  const res = await axios.get("/api/external-audit-assignee");
  return res.data;
}

export async function updateUserProfileImage({
  id,
  imageFile,
}: {
  id: number;
  imageFile: File;
}) {
  const formData = new FormData();
  formData.append("profileImage[0]", imageFile); // Backend expects an array

  const res = await axios.post(`/api/user/${id}/profile-update`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

export async function updateUserProfileDetails({
  id,
  name,
  gender,
  mobile,
}: {
  id: number;
  name: string;
  gender: string;
  mobile: string;
}) {
  const data = {
    name,
    gender,
    mobile,
  };

  const res = await axios.post(`/api/user/${id}/profile-update`, data);

  return res.data;
}

export async function resetProfileEmail({
  currentEmail,
  id,
}: {
  currentEmail: string;
  id: number;
}) {
  const res = await axios.post(`/api/user/${id}/email-change`, {
    currentEmail,
  });
  return res.data;
}

export async function resetProfileEmailVerification({
  otp,
  id,
}: {
  otp: string;
  id: number;
}) {
  const res = await axios.post(`/api/user/${id}/email-change-verify`, {
    otp,
  });
  return res.data;
}

export async function resetProfileEmailConfirm({
  newEmail,
  id,
}: {
  newEmail: string;
  id: number;
}) {
  const res = await axios.post(`/api/user/${id}/email-change-confirm`, {
    newEmail,
  });
  return res.data;
}
