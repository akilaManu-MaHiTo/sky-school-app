import axios from "axios";
import { z } from "zod";
import { GradeSchema } from "./OrganizationSettings/academicDetailsApi";
import {
  AcademicYearSchema,
  ClassSchema,
} from "./OrganizationSettings/academicGradeApi";

export const StudentNotificationSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  year: AcademicYearSchema,
  gradeId: GradeSchema,
  classId: ClassSchema,
});

export type StudentNotification = z.infer<typeof StudentNotificationSchema>;

export async function fetchAllStudentNotifications() {
  const res = await axios.get("/api/student-notifications");
  return res.data;
}
export async function fetchStudentNotificationsCreatedBy() {
  const res = await axios.get("/api/student-notifications-created-by");
  return res.data;
}
export async function fetchStudentNotificationCount() {
  const res = await axios.get("/api/student-notifications-count-by-student");
  return res.data;
}
export async function fetchParentNotificationCount() {
  const res = await axios.get("/api/student-notifications-count-by-parent");
  return res.data;
}
export async function fetchStudentNotifications() {
  const res = await axios.get("/api/student-notifications-by-student");
  return res.data;
}
export async function fetchParentNotifications() {
  const res = await axios.get("/api/student-notifications-by-parent");
  return res.data;
}

export async function markAsRead(notificationId: number) {
  const res = await axios.post(
    `/api/student-notifications/${notificationId}/mark-as-read`,
  );
  return res.data;
}

export async function markAllAsRead(data: { notificationIds: number[] }) {
  const res = await axios.post(
    `/api/student-notifications-mark-all-as-read`,
    data,
  );
  return res.data;
}

export async function createStudentNotification(payload: StudentNotification) {
  const data = {
    ...payload,
    year: payload.year.year,
    gradeId: payload.gradeId.id,
    classId: payload.classId.id,
  };
  const res = await axios.post("/api/student-notifications", data);
  return res.data;
}

export async function updateStudentNotification(payload: StudentNotification) {
  const res = await axios.post(
    `/api/student-notifications/${payload.id}`,
    payload,
  );
  return res.data;
}

export async function deleteStudentNotification(id: number | string) {
  const res = await axios.delete(`/api/student-notifications/${id}`);
  return res.data;
}
