import { z } from "zod";

export const PermissionSectionsMap: PermissionSection[] = [
  {
    mainSection: "Main",
    subSections: [
      {
        name: "Insight",
        key: "INSIGHT",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
        },
      },
    ],
  },
  {
    mainSection: "Dashboard",
    subSections: [
      {
        name: "Student/Parent Dashboard",
        key: "STUDENT_PARENT_DASHBOARD",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
        },
      },
      {
        name: "Teachers Dashboard",
        key: "TEACHERS_DASHBOARD",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
        },
      },
      {
        name: "Management Dashboard",
        key: "MANAGEMENT_DASHBOARD",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
        },
      },
    ],
  },
  {
    mainSection: "Administration",
    subSections: [
      {
        break: true,
        name: "User Management",
      },
      {
        name: "User Management > All Users",
        key: "ADMIN_USERS",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: true,
          DELETE: true,
        },
      },
      {
        name: "User Management > Access Management",
        key: "ADMIN_ACCESS_MNG",
        permissionsExists: {
          VIEW: true,
          CREATE: true,
          EDIT: true,
          DELETE: true,
        },
      },
      {
        break: true,
        name: "School Management",
      },
      {
        name: "School Management > School Settings",
        key: "SCHOOL_SETTINGS",
        permissionsExists: {
          VIEW: true,
          CREATE: true,
          EDIT: true,
          DELETE: true,
        },
      },
      { break: true, name: "Staff Management" },
      {
        name: "Add Class Teacher",
        key: "ADD_CLASS_TEACHER",
        permissionsExists: {
          VIEW: true,
          CREATE: true,
          EDIT: true,
          DELETE: true,
        },
      },
      {
        break: true,
        name: "Student Management",
      },
      {
        name: "Student Promotion",
        key: "STUDENT_PROMOTION",
        permissionsExists: {
          VIEW: true,
          CREATE: true,
          EDIT: true,
          DELETE: true,
        },
      },
    ],
  },
  {
    mainSection: "Reports",
    subSections: [
      {
        break: true,
        name: "Student/Parent Reports",
      },
      {
        name: "Parent Reports",
        key: "STUDENT_PARENT_PARENT_REPORTS",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
        },
      },
      {
        break: true,
        name: "Teacher Reports",
      },
      {
        name: "Class Reports",
        key: "TEACHER_ClASS_REPORTS",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
        },
      },
      {
        name: "Student Reports",
        key: "TEACHER_STUDENT_REPORTS",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
        },
      },
      {
        break: true,
        name: "Management Staff Reports",
      },
      {
        name: "Marks Entry Monitoring",
        key: "MARKS_ENTRY_MONITORING_REPORTS",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
        },
      },
      {
        name: "Student Reports",
        key: "MANAGEMENT_STAFF_STUDENT_REPORTS",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
        },
      },
    ],
  },
  {
    mainSection: "Academics",
    subSections: [
      {
        name: "Add Marks",
        key: "ADD_MARKS",
        permissionsExists: {
          VIEW: true,
          CREATE: true,
          EDIT: true,
          DELETE: true,
        },
      },
    ],
  },
];

export interface PermissionSection {
  mainSection: string;
  subSections: SubSection[];
}

export interface SubSectionWithPermissions {
  name: string;
  key: string;
  permissionsExists: PermissionsExists;
}

export interface SubSectionBreak {
  break: boolean;
  name: string;
}

export type SubSection = SubSectionWithPermissions | SubSectionBreak;

export interface PermissionsExists {
  VIEW: boolean;
  CREATE: boolean;
  EDIT: boolean;
  DELETE: boolean;
}

export enum PermissionKeys {
  //Insight
  INSIGHT_VIEW = "INSIGHT_VIEW",
  // Dashboard
  STUDENT_PARENT_DASHBOARD_VIEW = "STUDENT_PARENT_DASHBOARD_VIEW",
  TEACHERS_DASHBOARD_VIEW = "TEACHERS_DASHBOARD_VIEW",
  MANAGEMENT_DASHBOARD_VIEW = "MANAGEMENT_DASHBOARD_VIEW",
  // Administration > User Management > All Users
  ADMIN_USERS_VIEW = "ADMIN_USERS_VIEW",
  ADMIN_USERS_EDIT = "ADMIN_USERS_EDIT",
  ADMIN_USERS_DELETE = "ADMIN_USERS_DELETE",
  // Administration > User Management > Access Management
  ADMIN_ACCESS_MNG_VIEW = "ADMIN_ACCESS_MNG_VIEW",
  ADMIN_ACCESS_MNG_CREATE = "ADMIN_ACCESS_MNG_CREATE",
  ADMIN_ACCESS_MNG_EDIT = "ADMIN_ACCESS_MNG_EDIT",
  ADMIN_ACCESS_MNG_DELETE = "ADMIN_ACCESS_MNG_DELETE",
  // Administration > School Management > School Settings
  SCHOOL_SETTINGS_VIEW = "SCHOOL_SETTINGS_VIEW",
  SCHOOL_SETTINGS_CREATE = "SCHOOL_SETTINGS_CREATE",
  SCHOOL_SETTINGS_EDIT = "SCHOOL_SETTINGS_EDIT",
  SCHOOL_SETTINGS_DELETE = "SCHOOL_SETTINGS_DELETE",
  // Administration > Staff Management > Add Class Teacher
  ADD_CLASS_TEACHER_VIEW = "ADD_CLASS_TEACHER_VIEW",
  ADD_CLASS_TEACHER_CREATE = "ADD_CLASS_TEACHER_CREATE",
  ADD_CLASS_TEACHER_EDIT = "ADD_CLASS_TEACHER_EDIT",
  ADD_CLASS_TEACHER_DELETE = "ADD_CLASS_TEACHER_DELETE",
  // Administration > Student Management > Student Promotion
  STUDENT_PROMOTION_VIEW = "STUDENT_PROMOTION_VIEW",
  STUDENT_PROMOTION_CREATE = "STUDENT_PROMOTION_CREATE",
  STUDENT_PROMOTION_EDIT = "STUDENT_PROMOTION_EDIT",
  STUDENT_PROMOTION_DELETE = "STUDENT_PROMOTION_DELETE",
  // Reports > Student/Parent Reports > Parent Reports
  STUDENT_PARENT_PARENT_REPORTS_VIEW = "STUDENT_PARENT_PARENT_REPORTS_VIEW",
  // Reports > Teacher Reports > Class Reports
  TEACHER_ClASS_REPORTS_VIEW = "TEACHER_ClASS_REPORTS_VIEW",
  // Reports > Teacher Reports > Student Reports
  TEACHER_STUDENT_REPORTS_VIEW = "TEACHER_STUDENT_REPORTS_VIEW",
  // Reports > Management Staff Reports > Marks Entry Monitoring
  MARKS_ENTRY_MONITORING_REPORTS_VIEW = "MARKS_ENTRY_MONITORING_REPORTS_VIEW",
  // Reports > Management Staff Reports > Student Reports
  MANAGEMENT_STAFF_STUDENT_REPORTS_VIEW = "MANAGEMENT_STAFF_STUDENT_REPORTS_VIEW",
  
  // Academics
  ADD_MARKS_VIEW = "ADD_MARKS_VIEW",
  ADD_MARKS_CREATE = "ADD_MARKS_CREATE",
  ADD_MARKS_EDIT = "ADD_MARKS_EDIT",
  ADD_MARKS_DELETE = "ADD_MARKS_DELETE",
}

// Create the Zod schema using the enum values
export const PermissionKeysObjectSchema = z.object(
  Object.values(PermissionKeys).reduce((acc, key) => {
    acc[key] = z.boolean();
    return acc;
  }, {} as Record<PermissionKeys, z.ZodBoolean>)
);

// Infer the TypeScript type from the Zod schema
export type PermissionKeysObject = z.infer<typeof PermissionKeysObjectSchema>;

export const defaultAdminPermissions = Object.values(PermissionKeys).reduce(
  (acc, key) => {
    acc[key] = true;
    return acc;
  },
  {} as Record<PermissionKeys, boolean>
);

export const defaultViewerPermissions: PermissionKeysObject = {
  // Insight
  INSIGHT_VIEW: true,
  // Dashboard
  STUDENT_PARENT_DASHBOARD_VIEW: true,
  TEACHERS_DASHBOARD_VIEW: true,
  MANAGEMENT_DASHBOARD_VIEW: true,
  // Administration > User Management > All Users
  ADMIN_USERS_VIEW: true,
  ADMIN_USERS_EDIT: true,
  ADMIN_USERS_DELETE: true,
  // Administration > User Management > Access Management
  ADMIN_ACCESS_MNG_VIEW: true,
  ADMIN_ACCESS_MNG_CREATE: true,
  ADMIN_ACCESS_MNG_EDIT: true,
  ADMIN_ACCESS_MNG_DELETE: true,
  // Administration > School Management > School Settings
  SCHOOL_SETTINGS_VIEW: true,
  SCHOOL_SETTINGS_CREATE: true,
  SCHOOL_SETTINGS_EDIT: true,
  SCHOOL_SETTINGS_DELETE: true,
  // Administration > Staff Management > Add Class Teacher
  ADD_CLASS_TEACHER_VIEW: true,
  ADD_CLASS_TEACHER_CREATE: true,
  ADD_CLASS_TEACHER_EDIT: true,
  ADD_CLASS_TEACHER_DELETE: true,
  // Administration > Student Management > Student Promotion
  STUDENT_PROMOTION_VIEW: true,
  STUDENT_PROMOTION_CREATE: true,
  STUDENT_PROMOTION_EDIT: true,
  STUDENT_PROMOTION_DELETE: true,
  // Reports > Student/Parent Reports > Parent Reports
  STUDENT_PARENT_PARENT_REPORTS_VIEW: true,
  // Reports > Teacher Reports > Class Reports
  TEACHER_ClASS_REPORTS_VIEW: true,
  // Reports > Teacher Reports > Student Reports
  TEACHER_STUDENT_REPORTS_VIEW: true,
  // Reports > Management Staff Reports > Marks Entry Monitoring
  MARKS_ENTRY_MONITORING_REPORTS_VIEW: true,
  // Reports > Management Staff Reports > Student Reports
  MANAGEMENT_STAFF_STUDENT_REPORTS_VIEW: true,
  // Academics
  ADD_MARKS_VIEW: true,
  ADD_MARKS_CREATE: true,
  ADD_MARKS_EDIT: true,
  ADD_MARKS_DELETE: true,
};
