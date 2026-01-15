import axios from "axios";
import { z } from "zod";
import { StorageFileSchema } from "../../utils/StorageFiles.util";

export const ColorPalletSchema = z.object({
  palletId: z.number(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  buttonColor: z.string(),
});
export type ColorPallet = z.infer<typeof ColorPalletSchema>;

export const OrganizationSchema = z.object({
  id: z.number(),
  organizationName: z.string(),
  organizationFactoryName: z.string(),
  logoUrl: z.array(z.union([z.instanceof(File), StorageFileSchema])).optional(),
  insightDescription: z.string(),
  colorPallet: z.array(ColorPalletSchema),
  insightImage: z
    .array(z.union([z.instanceof(File), StorageFileSchema]))
    .optional(),
  created_at: z.date(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export async function getOrganization() {
  const res = await axios.get(`/api/organizations`);
  return res.data;
}

export const updateOrganization = async (organization: Organization) => {
  if (!organization.id) {
    throw new Error("Org must have an ID for an update.");
  }

  const formData = new FormData();

  // Explicitly handle logoUrl
  if (Array.isArray(organization.logoUrl)) {
    const logo = organization.logoUrl[0];
    if (logo instanceof File) {
      formData.append("logoUrl", logo);
    }
  }

  // Explicitly handle insightImage
  if (Array.isArray(organization.insightImage)) {
    const insight = organization.insightImage[0];
    if (insight instanceof File) {
      formData.append("insightImage", insight);
    }
  }

  // Handle all other fields
  Object.keys(organization).forEach((key) => {
    const value = organization[key as keyof Organization];

    if (key === "logoUrl" || key === "insightImage") return;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        formData.append(`${key}[${index}]`, JSON.stringify(item));
      });
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else if (value !== null && value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  console.log("datass", formData);
  try {
    const response = await axios.post(
      `/api/organizations/${organization.id}/update`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating Org:", error);
    throw error;
  }
};

export async function getGradesData() {
  const res = await axios.get(`/api/grade`);
  return res.data;
}
export async function getYearsData() {
  const res = await axios.get(`/api/year`);
  return res.data;
}
export async function getSubjectData({ query }: { query: string }) {
  const res = await axios.get(`/api/subject?search=${query}`);
  return res.data;
}

export async function getAllSubjectData() {
  const res = await axios.get(`/api/all-subjects`);
  return res.data;
}
export async function getGroup1SubjectData() {
  const res = await axios.get(`/api/group1-subjects`);
  return res.data;
}
export async function getGroup2SubjectData() {
  const res = await axios.get(`/api/group2-subjects`);
  return res.data;
}
export async function getGroup3SubjectData() {
  const res = await axios.get(`/api/group3-subjects`);
  return res.data;
}
export async function getUserData({
  query,
  role,
  sortBy,
}: {
  query: string;
  role: string;
  sortBy: string;
}) {
  const res = await axios.get(
    `/api/users/${role}/${sortBy}/search?keyword=${query}`
  );
  return res.data;
}

export async function updateUserActiveStatus(
  id: number,
  availability: boolean
) {
  const res = await axios.post(`/api/users/${id}/active-status`, {
    availability,
  });
  return res.data;
}

export async function getMyChildYears(studentId: number) {
  const res = await axios.get(`/api/my-children-year/${studentId}`);
  return res.data;
}
export async function getMyChildGrades(studentId: number) {
  const res = await axios.get(`/api/my-children-grade/${studentId}`);
  return res.data;
}
export async function getMyChildClasses(studentId: number) {
  const res = await axios.get(`/api/my-children-class/${studentId}`);
  return res.data;
}

export async function getMyChildReport(
  studentId: number,
  year: string,
  examType: string
) {
  const res = await axios.get(
    `/api/parent-report/${studentId}/${year}/${examType}`
  );
  return res.data;
}

export async function getMyChildReportLineChart(
  studentId: number,
) {
  const res = await axios.get(
    `/api/parent-report-line-chart/${studentId}`
  );
  return res.data;
}
