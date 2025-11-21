import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import LayersIcon from "@mui/icons-material/Layers";
import ScienceIcon from "@mui/icons-material/Science";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import KeyIcon from "@mui/icons-material/Key";
import SchoolIcon from "@mui/icons-material/School";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import Groups3Icon from "@mui/icons-material/Groups3";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AssessmentOutlinedIcon from "@mui/icons-material/Assessment";
import AddTaskIcon from '@mui/icons-material/AddTask';
import { PermissionKeys } from "../../views/Administration/SectionList";

export interface SidebarItem {
  title?: string;
  headline?: string;
  icon?: JSX.Element;
  open?: boolean;
  href?: string;
  disabled?: boolean;
  accessKey?: string;
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
  },
  {
    title: "Student/Parent Dashboard",
    href: "/home",
    icon: <DashboardIcon fontSize="small" />,
    accessKey: PermissionKeys.INSIGHT_VIEW,
  },
  {
    title: "Teachers Dashboard",
    href: "/student-dashboard",
    icon: <DashboardIcon fontSize="small" />,
    accessKey: PermissionKeys.INSIGHT_VIEW,
  },
  {
    title: "Management Dashboard",
    href: "/management-dashboard",
    icon: <DashboardIcon fontSize="small" />,
    accessKey: PermissionKeys.INSIGHT_VIEW,
  },
  {
    headline: "Administration",
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
        href: "/admin/school-management",
        icon: <SchoolIcon fontSize="small" />,
        accessKey: PermissionKeys.ADMIN_USERS_VIEW,
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
        accessKey: PermissionKeys.ADMIN_USERS_VIEW,
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
        accessKey: PermissionKeys.ADMIN_USERS_VIEW,
      },
    ],
  },
  {
    headline: "Reports",
  },
  {
    title: "Student/Parent Report",
    icon: <AssessmentOutlinedIcon fontSize="small" />,
    href: "/",
    nestedItems: [
      {
        title: "Parent Report",
        href: "/admin/parent-report",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.ADMIN_USERS_VIEW,
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
        href: "/admin/class-report",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.ADMIN_USERS_VIEW,
      },
      {
        title: "Student Report",
        href: "/admin/student-report",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.ADMIN_USERS_VIEW,
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
        href: "/admin/class-report",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.ADMIN_USERS_VIEW,
      },
      {
        title: "Student Report",
        href: "/admin/student-report",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.ADMIN_USERS_VIEW,
      },
    ],
  },
  {
    headline: "Academics",
  },
  {
    title: "Add Marks",
    icon: <AddTaskIcon fontSize="small" />,
    href: "/",
    accessKey: PermissionKeys.INSIGHT_VIEW,
  },
];
