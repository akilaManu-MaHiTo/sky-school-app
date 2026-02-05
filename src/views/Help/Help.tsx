import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import KeyIcon from "@mui/icons-material/Key";
import SchoolIcon from "@mui/icons-material/School";
import Groups3Icon from "@mui/icons-material/Groups3";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AddTaskIcon from "@mui/icons-material/AddTask";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import PermissionWrapper from "../../components/PermissionWrapper";
import { PermissionKeys } from "../Administration/SectionList";
import useCurrentUser from "../../hooks/useCurrentUser";

interface HelpSection {
  title: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  tips: string[];
  accessKey: PermissionKeys;
}

interface HelpCategory {
  category: string;
  categoryIcon: React.ReactNode;
  accessKeys: PermissionKeys[];
  sections: HelpSection[];
}

const helpData: HelpCategory[] = [
  {
    category: "Home",
    categoryIcon: <HomeIcon />,
    accessKeys: [PermissionKeys.INSIGHT_VIEW],
    sections: [
      {
        title: "Home Page",
        icon: <HomeIcon fontSize="small" />,
        description:
          "The Home Page serves as your central hub and landing page after logging into the Sky School App. It provides a personalized welcome message and displays your school's logo. This page offers quick access to real-time insights about the school's operations and serves as the starting point for navigating to other sections of the application.",
        features: [
          "Personalized welcome message with your name",
          "School logo display",
          "Quick overview of school insights",
          "Easy navigation to all app sections",
        ],
        tips: [
          "Use the sidebar menu to navigate to different sections",
          "Check this page regularly for important updates",
          "The home page is customized based on your role and permissions",
        ],
        accessKey: PermissionKeys.INSIGHT_VIEW,
      },
    ],
  },
  {
    category: "Dashboard",
    categoryIcon: <DashboardIcon />,
    accessKeys: [
      PermissionKeys.STUDENT_PARENT_DASHBOARD_VIEW,
      PermissionKeys.TEACHERS_DASHBOARD_VIEW,
      PermissionKeys.MANAGEMENT_DASHBOARD_VIEW,
    ],
    sections: [
      {
        title: "Student Dashboard",
        icon: <DashboardIcon fontSize="small" />,
        description:
          "The Student Dashboard is designed for students and their parents to view academic progress, attendance records, and important announcements. It provides a comprehensive overview of the student's educational journey including grades, upcoming assignments, and school events.",
        features: [
          "View academic performance and grades",
          "Track attendance records",
          "Access upcoming assignments and deadlines",
          "View school announcements and events",
          "Monitor overall academic progress",
        ],
        tips: [
          "Check the dashboard regularly for new assignments",
          "Review your grades after each assessment period",
          "Contact your class teacher if you notice any discrepancies",
        ],
        accessKey: PermissionKeys.STUDENT_PARENT_DASHBOARD_VIEW,
      },
      {
        title: "Teachers Dashboard",
        icon: <DashboardIcon fontSize="small" />,
        description:
          "The Teachers Dashboard provides educators with tools to manage their classes, track student performance, and access teaching resources. It offers insights into class-wide performance metrics and helps teachers identify students who may need additional support.",
        features: [
          "View assigned classes and students",
          "Track class-wide performance metrics",
          "Access student attendance records",
          "Manage assignments and assessments",
          "View teaching schedule and timetable",
          "Identify students requiring additional support",
        ],
        tips: [
          "Review class performance trends weekly",
          "Use the dashboard to prepare for parent-teacher meetings",
          "Regularly update marks to keep parents informed",
        ],
        accessKey: PermissionKeys.TEACHERS_DASHBOARD_VIEW,
      },
      {
        title: "Management Dashboard",
        icon: <DashboardIcon fontSize="small" />,
        description:
          "The Management Dashboard provides school administrators and management staff with a bird's-eye view of the entire institution. It includes comprehensive analytics, staff performance metrics, student enrollment data, and financial summaries to support strategic decision-making.",
        features: [
          "School-wide performance analytics",
          "Staff and teacher performance metrics",
          "Student enrollment and demographic data",
          "Department-wise performance comparison",
          "Resource allocation insights",
          "Strategic planning support tools",
        ],
        tips: [
          "Use filters to drill down into specific departments or grades",
          "Export reports for board meetings and presentations",
          "Monitor trends over academic terms for better planning",
        ],
        accessKey: PermissionKeys.MANAGEMENT_DASHBOARD_VIEW,
      },
    ],
  },
  {
    category: "Administration",
    categoryIcon: <PeopleAltIcon />,
    accessKeys: [
      PermissionKeys.ADMIN_USERS_VIEW,
      PermissionKeys.ADMIN_ACCESS_MNG_VIEW,
      PermissionKeys.SCHOOL_SETTINGS_VIEW,
      PermissionKeys.ADD_CLASS_TEACHER_VIEW,
      PermissionKeys.STUDENT_PROMOTION_VIEW,
    ],
    sections: [
      {
        title: "User Management - All Users",
        icon: <PeopleAltIcon fontSize="small" />,
        description:
          "The All Users section allows administrators to view, manage, and organize all user accounts in the system. This includes students, parents, teachers, and staff members. You can search, filter, edit user information, and manage account statuses from this centralized location.",
        features: [
          "View complete list of all system users",
          "Search and filter users by role, status, or department",
          "Edit user profiles and contact information",
          "Activate or deactivate user accounts",
          "View user activity and login history",
          "Export user data for reporting",
        ],
        tips: [
          "Regularly audit user accounts to maintain security",
          "Use bulk actions for efficient user management",
          "Deactivate accounts of users who have left the institution",
        ],
        accessKey: PermissionKeys.ADMIN_USERS_VIEW,
      },
      {
        title: "User Management - Access Management",
        icon: <KeyIcon fontSize="small" />,
        description:
          "Access Management allows administrators to define and manage user roles and permissions. Create custom permission sets, assign roles to users, and control what features and data each user type can access. This ensures proper security and data privacy across the application.",
        features: [
          "Create and manage user roles",
          "Define granular permissions for each role",
          "Assign roles to individual users",
          "View and audit permission assignments",
          "Create custom permission templates",
          "Manage role hierarchies",
        ],
        tips: [
          "Follow the principle of least privilege when assigning permissions",
          "Regularly review and update role permissions",
          "Create role templates for common user types",
        ],
        accessKey: PermissionKeys.ADMIN_ACCESS_MNG_VIEW,
      },
      {
        title: "School Management - School Settings",
        icon: <SchoolIcon fontSize="small" />,
        description:
          "School Settings is the central configuration hub for your institution. Configure school information, academic year settings, grading systems, class structures, and other essential parameters. These settings form the foundation for all other features in the application.",
        features: [
          "Configure school profile and branding",
          "Set up academic year and terms",
          "Define grading systems and scales",
          "Configure class and section structures",
          "Manage school timings and schedules",
          "Set up notification preferences",
        ],
        tips: [
          "Configure school settings before the academic year begins",
          "Update the school logo and branding for a professional appearance",
          "Review grading scales with academic coordinators",
        ],
        accessKey: PermissionKeys.SCHOOL_SETTINGS_VIEW,
      },
      {
        title: "Staff Management - Add Class Teacher",
        icon: <BookmarkAddedIcon fontSize="small" />,
        description:
          "The Add Class Teacher feature allows administrators to assign teachers to specific classes and sections. This assignment is crucial for proper class management, attendance tracking, and parent-teacher communication. Teachers can be assigned as primary or co-teachers for each class.",
        features: [
          "Assign teachers to classes and sections",
          "Designate primary and co-teachers",
          "View current class-teacher assignments",
          "Transfer teacher assignments between classes",
          "Manage multiple subject assignments",
          "Track teacher workload distribution",
        ],
        tips: [
          "Balance teacher workloads across classes",
          "Assign experienced teachers to challenging classes",
          "Update assignments promptly when staff changes occur",
        ],
        accessKey: PermissionKeys.ADD_CLASS_TEACHER_VIEW,
      },
      {
        title: "Student Management - Student Promotion",
        icon: <FileUploadIcon fontSize="small" />,
        description:
          "The Student Promotion feature facilitates the end-of-year process of moving students to the next grade level. It supports bulk promotions, handles special cases like retention or acceleration, and maintains complete academic history throughout the student's educational journey.",
        features: [
          "Bulk promote students to next grade",
          "Handle retention and acceleration cases",
          "Transfer students between sections",
          "Manage graduation and alumni records",
          "Preserve academic history during promotion",
          "Generate promotion reports and certificates",
        ],
        tips: [
          "Review student performance before bulk promotions",
          "Coordinate with teachers for retention decisions",
          "Complete promotions before the new academic year begins",
        ],
        accessKey: PermissionKeys.STUDENT_PROMOTION_VIEW,
      },
    ],
  },
  {
    category: "Reports",
    categoryIcon: <AssessmentOutlinedIcon />,
    accessKeys: [
      PermissionKeys.STUDENT_PARENT_PARENT_REPORTS_VIEW,
      PermissionKeys.TEACHER_ClASS_REPORTS_VIEW,
      PermissionKeys.TEACHER_STUDENT_REPORTS_VIEW,
      PermissionKeys.MARKS_ENTRY_MONITORING_REPORTS_VIEW,
      PermissionKeys.MANAGEMENT_STAFF_STUDENT_REPORTS_VIEW,
    ],
    sections: [
      {
        title: "Student/Parent Report - Parent Report",
        icon: <AssessmentOutlinedIcon fontSize="small" />,
        description:
          "The Parent Report provides parents with detailed insights into their child's academic performance. View comprehensive report cards, attendance summaries, behavior notes, and progress tracking across all subjects. Parents can track their child's educational journey throughout the academic year.",
        features: [
          "View detailed report cards for each term",
          "Track subject-wise performance trends",
          "Access attendance and punctuality records",
          "View teacher remarks and feedback",
          "Download and print report cards",
          "Compare performance across terms",
        ],
        tips: [
          "Review reports after each assessment period",
          "Discuss areas of improvement with teachers",
          "Use trend data to identify subjects needing attention",
        ],
        accessKey: PermissionKeys.STUDENT_PARENT_PARENT_REPORTS_VIEW,
      },
      {
        title: "Teacher Report - Class Report",
        icon: <AssessmentOutlinedIcon fontSize="small" />,
        description:
          "The Class Report provides teachers with comprehensive analytics for their assigned classes. View class-wide performance metrics, identify trends, compare student achievements, and generate reports for parent meetings or administrative review. This tool helps teachers make data-driven decisions for their teaching strategies.",
        features: [
          "View class-wide performance statistics",
          "Analyze subject-wise class performance",
          "Identify top performers and students needing support",
          "Compare performance across assessments",
          "Generate class summary reports",
          "Track attendance patterns for the class",
        ],
        tips: [
          "Use class reports to identify common learning gaps",
          "Share insights with other subject teachers for collaboration",
          "Prepare class reports before parent-teacher conferences",
        ],
        accessKey: PermissionKeys.TEACHER_ClASS_REPORTS_VIEW,
      },
      {
        title: "Teacher Report - Student Report",
        icon: <AssessmentOutlinedIcon fontSize="small" />,
        description:
          "The Student Report allows teachers to generate detailed individual student reports. Access complete academic profiles, track progress over time, add personalized remarks, and create comprehensive reports for parent consultations. This feature supports individualized attention to each student's educational needs.",
        features: [
          "Generate individual student progress reports",
          "View complete academic history",
          "Add personalized teacher remarks",
          "Track improvement over time",
          "Compare with class averages",
          "Export reports for parent meetings",
        ],
        tips: [
          "Review individual reports before parent meetings",
          "Add constructive and specific feedback",
          "Track progress of at-risk students regularly",
        ],
        accessKey: PermissionKeys.TEACHER_STUDENT_REPORTS_VIEW,
      },
      {
        title: "Management Staff Report - Grade Report",
        icon: <AssessmentOutlinedIcon fontSize="small" />,
        description:
          "The Grade Report provides management with grade-level analytics across the institution. Compare performance across sections, analyze teacher effectiveness, and identify systemic issues or successes. This report supports curriculum planning and resource allocation decisions.",
        features: [
          "View grade-wise performance summaries",
          "Compare sections within the same grade",
          "Analyze subject-wise trends across grades",
          "Identify high-performing and struggling sections",
          "Track year-over-year improvement",
          "Generate executive summary reports",
        ],
        tips: [
          "Use grade reports for curriculum review meetings",
          "Identify grades needing additional resources",
          "Share insights with department heads for action planning",
        ],
        accessKey: PermissionKeys.MANAGEMENT_STAFF_STUDENT_REPORTS_VIEW,
      },
      {
        title: "Management Staff Report - Marks Entry Monitoring",
        icon: <AssessmentOutlinedIcon fontSize="small" />,
        description:
          "The Marks Entry Monitoring report helps administrators track the status of marks entry across all classes and subjects. Monitor which teachers have completed their marks entry, identify pending entries, and ensure timely completion before report card generation deadlines.",
        features: [
          "Track marks entry completion status",
          "View pending entries by teacher and subject",
          "Monitor deadline compliance",
          "Send reminders to teachers with pending entries",
          "Generate completion statistics",
          "Audit marks entry timeline",
        ],
        tips: [
          "Set clear deadlines for marks entry",
          "Monitor progress regularly as deadlines approach",
          "Follow up promptly with teachers having pending entries",
        ],
        accessKey: PermissionKeys.MARKS_ENTRY_MONITORING_REPORTS_VIEW,
      },
      {
        title: "Management Staff Report - Student Report",
        icon: <AssessmentOutlinedIcon fontSize="small" />,
        description:
          "The Management Student Report provides administrators with comprehensive student analytics across the institution. Access detailed performance data, enrollment statistics, and demographic breakdowns. This report supports strategic planning and institutional improvement initiatives.",
        features: [
          "View institution-wide student statistics",
          "Analyze demographic distributions",
          "Track enrollment and retention rates",
          "Compare performance across departments",
          "Generate board-level summary reports",
          "Export data for external reporting",
        ],
        tips: [
          "Use these reports for annual planning sessions",
          "Track metrics aligned with institutional goals",
          "Share relevant insights with stakeholders",
        ],
        accessKey: PermissionKeys.MANAGEMENT_STAFF_STUDENT_REPORTS_VIEW,
      },
    ],
  },
  {
    category: "Academics",
    categoryIcon: <AddTaskIcon />,
    accessKeys: [PermissionKeys.ADD_MARKS_VIEW],
    sections: [
      {
        title: "Student Marks",
        icon: <AddTaskIcon fontSize="small" />,
        description:
          "The Student Marks section is where teachers enter and manage student assessment scores. Record marks for various assessments including class tests, assignments, mid-terms, and final exams. The system automatically calculates grades based on the configured grading system and supports multiple assessment types.",
        features: [
          "Enter marks for various assessment types",
          "Bulk entry for efficient data input",
          "Automatic grade calculation",
          "Edit and update previously entered marks",
          "View mark entry history",
          "Support for different grading scales",
          "Validate entries against maximum marks",
        ],
        tips: [
          "Double-check entries before saving",
          "Enter marks promptly after assessments",
          "Use bulk entry for efficiency with large classes",
          "Review calculated grades for accuracy",
        ],
        accessKey: PermissionKeys.ADD_MARKS_VIEW,
      },
    ],
  },
];

const Help: React.FC = () => {
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const { user } = useCurrentUser();
  const userPermissionObject = user?.permissionObject;

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  // Check if user has access to any section in a category
  const hasAccessToCategory = (accessKeys: PermissionKeys[]): boolean => {
    if (!userPermissionObject) return false;
    return accessKeys.some((key) => userPermissionObject[key] === true);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "var(--pallet-blue)",
            mb: 1,
          }}
        >
          📚 Sky School App Help Guide
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Welcome to the Sky School App Help Center. Find detailed guidance for
          all features and functionalities available to you based on your role
          and permissions.
        </Typography>
        <Divider />
      </Box>

      {/* Quick Start Section */}
      <Card
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
            🚀 Quick Start Guide
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              • <strong>Navigate:</strong> Use the sidebar menu to access different sections
            </Typography>
            <Typography variant="body2">
              • <strong>Search:</strong> Use search bars within pages to find specific records
            </Typography>
            <Typography variant="body2">
              • <strong>Actions:</strong> Look for action buttons (Add, Edit, Delete) on each page
            </Typography>
            <Typography variant="body2">
              • <strong>Help:</strong> Each section below provides detailed guidance for its features
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Help Sections */}
      {helpData.map((category, categoryIndex) =>
        hasAccessToCategory(category.accessKeys) ? (
          <Box key={categoryIndex} sx={{ mb: 3 }}>
            {/* Category Header - Show if user has access to any section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
                mt: categoryIndex > 0 ? 4 : 0,
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "primary.main",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {category.categoryIcon}
              </Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {category.category}
              </Typography>
            </Box>

            {/* Sections within Category */}
            {category.sections.map((section, sectionIndex) => (
              <PermissionWrapper
                key={`${categoryIndex}-${sectionIndex}`}
                accessKey={section.accessKey}
              >
                <Accordion
                  expanded={
                    expanded === `panel-${categoryIndex}-${sectionIndex}`
                  }
                  onChange={handleChange(
                    `panel-${categoryIndex}-${sectionIndex}`
                  )}
                  sx={{
                    mb: 1,
                    "&:before": { display: "none" },
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    borderRadius: "8px !important",
                    overflow: "hidden",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      bgcolor:
                        expanded === `panel-${categoryIndex}-${sectionIndex}`
                          ? "primary.light"
                          : "grey.50",
                      "&:hover": { bgcolor: "primary.light" },
                      transition: "background-color 0.3s",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 2 }}
                    >
                      <Box
                        sx={{
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {section.icon}
                      </Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        {section.title}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 3 }}>
                    {/* Description */}
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <InfoIcon color="info" fontSize="small" />
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          Overview
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.8 }}
                      >
                        {section.description}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Features */}
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <CheckCircleIcon color="success" fontSize="small" />
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          Key Features
                        </Typography>
                      </Box>
                      <List dense>
                        {section.features.map((feature, featureIndex) => (
                          <ListItem key={featureIndex} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Chip
                                label={featureIndex + 1}
                                size="small"
                                color="primary"
                                sx={{ height: 20, fontSize: 12 }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={feature}
                              primaryTypographyProps={{
                                variant: "body2",
                                color: "text.secondary",
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Tips */}
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <TipsAndUpdatesIcon color="warning" fontSize="small" />
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          Pro Tips
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          bgcolor: "warning.light",
                          p: 2,
                          borderRadius: 2,
                          opacity: 0.9,
                        }}
                      >
                        {section.tips.map((tip, tipIndex) => (
                          <Typography
                            key={tipIndex}
                            variant="body2"
                            sx={{ mb: tipIndex < section.tips.length - 1 ? 1 : 0 }}
                          >
                            💡 {tip}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </PermissionWrapper>
            ))}
          </Box>
        ) : null
      )}

      {/* Footer */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          bgcolor: "grey.100",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Need More Help?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          If you need additional assistance, please contact your school administrator
          or reach out to the Sky Smart Tech support team.
        </Typography>
      </Box>
    </Box>
  );
};

export default Help;
