import React, { Suspense, useMemo } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import MainLayout from "./components/Layout/MainLayout";
import PageLoader from "./components/PageLoader";
import useCurrentUser from "./hooks/useCurrentUser";
import { PermissionKeys } from "./views/Administration/SectionList";
import PermissionDenied from "./components/PermissionDenied";
import { useQuery } from "@tanstack/react-query";
import { User, validateUser } from "./api/userApi";

// Login Page
const LoginPage = React.lazy(() => import("./views/LoginPage/LoginPage"));
// Register Page
const RegistrationPage = React.lazy(
  () => import("./views/RegistrationPage/RegistrationPage"),
);
// Insight Page
const InsightsPage = React.lazy(() => import("./views/Insights/Insight"));

// Dashboards
const StudentParentDashboard = React.lazy(
  () => import("./views/Dashboard/StudentDashboard/StudentDashboard"),
);
const TeacherDashboard = React.lazy(
  () => import("./components/UnderDevelopment"),
);
const ManagementDashboard = React.lazy(
  () => import("./components/UnderDevelopment"),
);

// Administration > User Management > All Users
const UserTable = React.lazy(() => import("./views/Administration/UserTable"));
// Administration > User Management > Access Management
const AccessManagementTable = React.lazy(
  () => import("./views/Administration/AccessManagementTable"),
);
// Administration > School Management > School Settings
const SchoolSettings = React.lazy(
  () => import("./views/Administration/SchoolManagement/SchoolSettings"),
);
// Administration > Staff Management > Add Class Teacher
const AddClassTeacher = React.lazy(
  () => import("./views/Administration/StaffManagement/ClassTeacherTable"),
);
// Administration > Student Management > Student Promotion
const StudentPromotion = React.lazy(
  () => import("./views/Administration/StudentManagement/StudentPromotion"),
);
// Administration > Student Management > Student Service Charges
const StudentServiceCharges = React.lazy(
  () => import("./views/Administration/StudentManagement/StudentServiceCharges/StudentServiceChargesTable")
);

// Reports > Student/Parent Reports > Parent Report
const ParentReport = React.lazy(
  () => import("./views/Reports/Student-ParentReport/ParentReport"),
);
// Reports > Teacher Reports > Class Report
const TeacherClassReport = React.lazy(
  () => import("./views/Reports/TeacherReports/ClassReport/ClassReport"),
);
// Reports > Teacher Reports > Student Report
const TeacherStudentReport = React.lazy(
  () => import("./views/Reports/TeacherReports/StudentReport/StudentReport"),
);
// Reports > Management Staff Reports > Grade Report
const ManagementGradeReport = React.lazy(
  () => import("./views/Reports/ManagementStaffReport/GradeReport/GradeReport"),
);
// Reports > Management Staff Reports > Marks Entry Report
const MarksEntryReport = React.lazy(
  () =>
    import("./views/Reports/ManagementStaffReport/MarksEntryMonitoring/MarksEntryMonitoring"),
);
// Reports > Management Staff Reports > Student Report
const ManagementStudentReport = React.lazy(
  () =>
    import("./views/Reports/ManagementStaffReport/StudentReport/StudentReport"),
);

// Academics
const AddMarks = React.lazy(() => import("./views/Academics/StudentMarksPage"));

function withLayout(Layout: any, Component: any, restrictAccess = false) {
  return (
    <Layout>
      <Suspense
        fallback={
          <>
            <PageLoader />
          </>
        }
      >
        {restrictAccess ? <PermissionDenied /> : <Component />}
      </Suspense>
    </Layout>
  );
}

function withoutLayout(Component: React.LazyExoticComponent<any>) {
  return (
    <Suspense
      fallback={
        <>
          <PageLoader />
        </>
      }
    >
      <Component />
    </Suspense>
  );
}

const ProtectedRoute = () => {
  const { user, status } = useCurrentUser();

  if (status === "loading" || status === "idle" || status === "pending") {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

const AppRoutes = () => {
  const { data: user, status } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: validateUser,
  });

  const userPermissionObject = useMemo(() => {
    if (user && user?.permissionObject) {
      return user?.permissionObject;
    }
  }, [user]);
  console.log("user", user);
  return (
    <Routes>
      <Route path="/" element={withoutLayout(LoginPage)} />
      <Route path="/register" element={withoutLayout(RegistrationPage)} />
      <Route element={<ProtectedRoute />}>
        {/* Insight */}
        <Route
          path="/home"
          element={withLayout(
            MainLayout,
            InsightsPage,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW],
          )}
        />

        {/* Dashboard > Student/Parent Dashboard */}
        <Route
          path="/student-parent-dashboard"
          element={withLayout(
            MainLayout,
            StudentParentDashboard,
            !userPermissionObject?.[
              PermissionKeys.STUDENT_PARENT_DASHBOARD_VIEW
            ],
          )}
        />
        {/* Dashboard > Teacher Dashboard */}
        <Route
          path="/teacher-dashboard"
          element={withLayout(
            MainLayout,
            TeacherDashboard,
            !userPermissionObject?.[PermissionKeys.TEACHERS_DASHBOARD_VIEW],
          )}
        />
        {/* Dashboard > Management Dashboard */}
        <Route
          path="/management-dashboard"
          element={withLayout(
            MainLayout,
            ManagementDashboard,
            !userPermissionObject?.[PermissionKeys.MANAGEMENT_DASHBOARD_VIEW],
          )}
        />

        {/* Administration > User Management > All Users */}
        <Route
          path="/admin/users"
          element={withLayout(
            MainLayout,
            UserTable,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW],
          )}
        />
        {/* Administration > User Management > Access Management */}
        <Route
          path="/admin/access-management"
          element={withLayout(
            MainLayout,
            AccessManagementTable,
            !userPermissionObject?.[PermissionKeys.ADMIN_USERS_VIEW],
          )}
        />
        {/* Administration > School Management > School Settings */}
        <Route
          path="/admin/school-settings"
          element={withLayout(
            MainLayout,
            SchoolSettings,
            !userPermissionObject?.[PermissionKeys.SCHOOL_SETTINGS_VIEW],
          )}
        />
        {/* Administration > Staff Management > Add Class Teacher */}
        <Route
          path="/admin/add-class-teacher"
          element={withLayout(
            MainLayout,
            AddClassTeacher,
            !userPermissionObject?.[PermissionKeys.ADD_CLASS_TEACHER_VIEW],
          )}
        />
        {/* Administration > Student Management > Student Promotion */}
        <Route
          path="/admin/student-promotion"
          element={withLayout(
            MainLayout,
            StudentPromotion,
            !userPermissionObject?.[PermissionKeys.STUDENT_PROMOTION_VIEW],
          )}
        />
        <Route
          path="/admin/student-service-charges"
          element={withLayout(
            MainLayout,
            StudentServiceCharges,
            !userPermissionObject?.[PermissionKeys.STUDENT_PROMOTION_VIEW]
          )}
        />

        {/* Reports > Student/Parent Reports > Parent Report */}
        <Route
          path="/reports/parent-report"
          element={withLayout(
            MainLayout,
            ParentReport,
            !userPermissionObject?.[
              PermissionKeys.STUDENT_PARENT_PARENT_REPORTS_VIEW
            ],
          )}
        />
        {/* Reports > Teacher Reports > Class Report */}
        <Route
          path="/reports/teacher-class-report"
          element={withLayout(
            MainLayout,
            TeacherClassReport,
            !userPermissionObject?.[PermissionKeys.TEACHER_ClASS_REPORTS_VIEW],
          )}
        />
        {/* Reports > Teacher Reports > Student Report */}
        <Route
          path="/reports/teacher-student-report"
          element={withLayout(
            MainLayout,
            TeacherStudentReport,
            !userPermissionObject?.[
              PermissionKeys.TEACHER_STUDENT_REPORTS_VIEW
            ],
          )}
        />
        {/* Reports > Management Staff Reports > Marks Entry Report */}
        <Route
          path="/reports/management-grade-report"
          element={withLayout(
            MainLayout,
            ManagementGradeReport,
            !userPermissionObject?.[
              PermissionKeys.MARKS_ENTRY_MONITORING_REPORTS_VIEW
            ],
          )}
        />
        <Route
          path="/reports/marks-entry-monitor"
          element={withLayout(
            MainLayout,
            MarksEntryReport,
            !userPermissionObject?.[
              PermissionKeys.MARKS_ENTRY_MONITORING_REPORTS_VIEW
            ],
          )}
        />
        {/* Reports > Management Staff Reports > Student Report */}
        <Route
          path="/reports/management-student-report"
          element={withLayout(
            MainLayout,
            ManagementStudentReport,
            !userPermissionObject?.[
              PermissionKeys.MANAGEMENT_STAFF_STUDENT_REPORTS_VIEW
            ],
          )}
        />
        {/* Academics > Add Marks */}
        <Route
          path="/academics/add-marks"
          element={withLayout(
            MainLayout,
            AddMarks,
            !userPermissionObject?.[PermissionKeys.ADD_MARKS_VIEW],
          )}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
