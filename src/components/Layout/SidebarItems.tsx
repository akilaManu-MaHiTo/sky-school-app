import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import LayersIcon from "@mui/icons-material/Layers";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import SpaIcon from "@mui/icons-material/Spa";
import ForestIcon from "@mui/icons-material/Forest";
import ScienceIcon from "@mui/icons-material/Science";
import EmergencyIcon from "@mui/icons-material/Emergency";
import ChangeHistoryIcon from "@mui/icons-material/ChangeHistory";
import FolderIcon from "@mui/icons-material/Folder";
import ConstructionIcon from "@mui/icons-material/Construction";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import DatasetLinkedOutlinedIcon from "@mui/icons-material/DatasetLinkedOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import KeyIcon from "@mui/icons-material/Key";
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
    headline: "Main",
  },
  {
    title: "Insight",
    href: "/home",
    icon: <HomeIcon fontSize="small" />,
    accessKey: PermissionKeys.INSIGHT_VIEW,
  },
  {
    headline: "Administration",
  },
  {
    title: "Users",
    icon: <PeopleAltIcon fontSize="small" />,
    href: "/admin/users",
    accessKey: PermissionKeys.ADMIN_USERS_VIEW,
  },
  {
    title: "Access Management",
    icon: <KeyIcon fontSize="small" />,
    href: "/admin/access-management",
    accessKey: PermissionKeys.ADMIN_ACCESS_MNG_VIEW,
  },
  {
    headline: "Design",
  },
  {
    title: "Components",
    icon: <LayersIcon fontSize="small" />,
    href: "/components",
    open: false,
    disabled: false,
    nestedItems: [
      {
        title: "Accordion & Divider",
        href: "/components/accordion-divider",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.COMPONENTS_ACCORDION_DIVIDER_VIEW,
      },
      {
        title: "Image Designs",
        href: "/components/image-designs",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.COMPONENTS_IMAGE_DESIGNS_VIEW,
      },
      {
        title: "Tab Panel",
        href: "/components/tab-panels",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.COMPONENTS_TAB_PANEL_VIEW,
      },
      {
        title: "Under Development",
        href: "/components/under-development",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.COMPONENTS_UNDER_DEVELOPMENT_VIEW,
      },
    ],
  },
  {
    title: "Input Fields",
    icon: <LayersIcon fontSize="small" />,
    href: "/input-fields",
    open: false,
    disabled: false,
    nestedItems: [
      {
        title: "Autocomplete",
        href: "/input-fields/autocomplete",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.INPUT_FIELDS_AUTOCOMPLETE_VIEW,
      },
      {
        title: "Text Fields",
        href: "/input-fields/textfield",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.INPUT_FIELDS_TEXT_FIELDS_VIEW,
      },
      {
        title: "Date Pickers",
        href: "/input-fields/date-pickers",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.INPUT_FIELDS_DATE_PICKERS_VIEW,
      },
      {
        title: "Other Inputs",
        href: "/input-fields/other-inputs",
        icon: <DashboardIcon fontSize="small" />,
        accessKey: PermissionKeys.INPUT_FIELDS_OTHER_INPUTS_VIEW,
      },
    ],
  },

  {
    headline: "Sample CRUD",
  },
  {
    title: "Chemical MNG",
    href: "/chemical-mng",
    icon: <ScienceIcon fontSize="small" />,
    nestedItems: [
      {
        title: "Dashboard",
        href: "/chemical-mng/dashboard",
        icon: <SubdirectoryArrowRightIcon fontSize="small" />,
        accessKey: PermissionKeys.CHEMICAL_MNG_DASHBOARD_VIEW,
      },
      {
        title: "Chemical Requests",
        href: "/chemical-mng/chemical-requests",
        icon: <SubdirectoryArrowRightIcon fontSize="small" />,
        accessKey: PermissionKeys.CHEMICAL_MNG_REQUEST_REGISTER_VIEW,
      },
      {
        title: "Purchase & Inventory",
        href: "/chemical-mng/purchase-inventory",
        icon: <SubdirectoryArrowRightIcon fontSize="small" />,
        accessKey: PermissionKeys.CHEMICAL_MNG_PURCHASE_INVENTORY_VIEW,
      },
      {
        title: "Transaction",
        href: "/chemical-mng/transaction",
        icon: <SubdirectoryArrowRightIcon fontSize="small" />,
        accessKey: PermissionKeys.CHEMICAL_MNG_TRANSACTION_VIEW,
      },
      {
        title: "Assigned Tasks",
        href: "/chemical-mng/assigned-tasks",
        icon: <SubdirectoryArrowRightIcon fontSize="small" />,
        accessKey: PermissionKeys.CHEMICAL_MNG_ASSIGNED_TASKS_VIEW,
      },
    ],
  },
];
