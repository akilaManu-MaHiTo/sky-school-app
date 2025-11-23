import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import KeyIcon from "@mui/icons-material/Key";
import SchoolIcon from "@mui/icons-material/School";
import Groups3Icon from "@mui/icons-material/Groups3";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AssessmentOutlinedIcon from "@mui/icons-material/Assessment";
import AddTaskIcon from "@mui/icons-material/AddTask";
import { PermissionKeys } from "../../views/Administration/SectionList";

export interface SidebarItem {
  title?: string;
  headline?: string;
  icon?: JSX.Element;
  open?: boolean;
  href?: string;
  disabled?: boolean;
  accessKey?: string;
  accessKeys?: string[];
  nestedItems?: {
    title: string;
    href: string;
    icon: JSX.Element;
    accessKey?: string;
    open?: boolean;
    disabled?: boolean;
    nestedItems?: {
      accessKey?: string;
      title: string;
      href: string;
      icon: JSX.Element;
      disabled?: boolean;
    }[];
  }[];
}

export const sidebarItems: Array<SidebarItem> = [
  {
    headline: "Dashboard",
    accessKeys: [
      PermissionKeys.STUDENT_PARENT_DASHBOARD_VIEW,
      PermissionKeys.TEACHERS_DASHBOARD_VIEW,
      PermissionKeys.MANAGEMENT_DASHBOARD_VIEW,
    ],
  },
  {
    title: "Student/Parent Dashboard",
    href: "/student-parent-dashboard",
    icon: <DashboardIcon fontSize="small" />,
    accessKey: PermissionKeys.STUDENT_PARENT_DASHBOARD_VIEW,
  },
  {
    title: "Teachers Dashboard",
    href: "/teacher-dashboard",
    icon: <DashboardIcon fontSize="small" />,
    accessKey: PermissionKeys.TEACHERS_DASHBOARD_VIEW,
  },
  {
    title: "Management Dashboard",
    href: "/management-dashboard",
    icon: <DashboardIcon fontSize="small" />,
    accessKey: PermissionKeys.MANAGEMENT_DASHBOARD_VIEW,
  },
  {
    headline: "Administration",
    accessKeys: [
      PermissionKeys.ADMIN_USERS_VIEW,
      PermissionKeys.ADMIN_ACCESS_MNG_VIEW,
      PermissionKeys.SCHOOL_SETTINGS_VIEW,
      PermissionKeys.ADD_CLASS_TEACHER_VIEW,
      PermissionKeys.STUDENT_PROMOTION_VIEW,
    ],
  },
  {
    title: "User Management",
    icon: <PeopleAltIcon fontSize="small" />,
    href: "/admin/users",
    nestedItems: [
      {
        title: "All Users",
        href: "/admin/users",
        icon: <PeopleAltIcon fontSize="small" />,
        accessKey: PermissionKeys.ADMIN_USERS_VIEW,
      },
      {
        title: "Access Management",
        icon: <KeyIcon fontSize="small" />,
        href: "/admin/access-management",
        accessKey: PermissionKeys.ADMIN_ACCESS_MNG_VIEW,
      },
    ],
  },
  {
    title: "School Management",
    icon: <SchoolIcon fontSize="small" />,
    href: "/admin/school",
    nestedItems: [
      {
        title: "School Settings",
        href: "/admin/school-settings",
        icon: <SchoolIcon fontSize="small" />,
        accessKey: PermissionKeys.SCHOOL_SETTINGS_VIEW,
      },
    ],
  },
  {
    title: "Staff Management",
    icon: <Groups3Icon fontSize="small" />,
    href: "/admin/staff",
    nestedItems: [
      {
        title: "Add Class Teacher",
        href: "/admin/add-class-teacher",
        icon: <BookmarkAddedIcon fontSize="small" />,
        accessKey: PermissionKeys.ADD_CLASS_TEACHER_VIEW,
      },
    ],
  },
  {
    title: "Student Management",
    icon: <LocalLibraryIcon fontSize="small" />,
    href: "/admin/staff",
    nestedItems: [
      {
        title: "Student Promotion",
        href: "/admin/student-promotion",
        icon: <FileUploadIcon fontSize="small" />,
        accessKey: PermissionKeys.STUDENT_PROMOTION_VIEW,
      },
    ],
  },
  {
    headline: "Reports",
    accessKeys: [
      PermissionKeys.STUDENT_PARENT_PARENT_REPORTS_VIEW,
      PermissionKeys.TEACHER_ClASS_REPORTS_VIEW,
      PermissionKeys.TEACHER_STUDENT_REPORTS_VIEW,
      PermissionKeys.MARKS_ENTRY_MONITORING_REPORTS_VIEW,
      PermissionKeys.MANAGEMENT_STAFF_STUDENT_REPORTS_VIEW,
    ],
  },
  {
    title: "Student/Parent Report",
    icon: <AssessmentOutlinedIcon fontSize="small" />,
    href: "/",
    nestedItems: [
      {
        title: "Parent Report",
        href: "/reports/parent-report",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.STUDENT_PARENT_PARENT_REPORTS_VIEW,
      },
    ],
  },
  {
    title: "Teacher Report",
    icon: <AssessmentOutlinedIcon fontSize="small" />,
    href: "/",
    nestedItems: [
      {
        title: "Class Report",
        href: "/reports/teacher-class-report",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.TEACHER_ClASS_REPORTS_VIEW,
      },
      {
        title: "Student Report",
        href: "/reports/teacher-student-report",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.TEACHER_STUDENT_REPORTS_VIEW,
      },
    ],
  },
  {
    title: "Management Staff Report",
    icon: <AssessmentOutlinedIcon fontSize="small" />,
    href: "/",
    nestedItems: [
      {
        title: "Marks Entry Monitoring",
        href: "/reports/marks-entry-monitor",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.MARKS_ENTRY_MONITORING_REPORTS_VIEW,
      },
      {
        title: "Student Report",
        href: "/reports/management-student-report",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.MANAGEMENT_STAFF_STUDENT_REPORTS_VIEW,
      },
    ],
  },
  {
    headline: "Academics",
    accessKeys: [PermissionKeys.ADD_MARKS_VIEW],
  },
  {
    title: "Add Marks",
    icon: <AddTaskIcon fontSize="small" />,
    href: "/academics/add-marks",
    accessKey: PermissionKeys.ADD_MARKS_VIEW,
  },
];
