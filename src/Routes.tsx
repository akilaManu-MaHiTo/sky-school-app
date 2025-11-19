import React, { Suspense, useMemo } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import MainLayout from "./components/Layout/MainLayout";
import PageLoader from "./components/PageLoader";
import useCurrentUser from "./hooks/useCurrentUser";
import { PermissionKeys } from "./views/Administration/SectionList";
import PermissionDenied from "./components/PermissionDenied";
import { useQuery } from "@tanstack/react-query";
import { User, validateUser } from "./api/userApi";

//Login Page
const LoginPage = React.lazy(() => import("./views/LoginPage/LoginPage"));

//Register Page
const RegistrationPage = React.lazy(
  () => import("./views/RegistrationPage/RegistrationPage")
);

//Insight Page
const InsightsPage = React.lazy(() => import("./views/Insights/Insight"));

//Administration
const UserTable = React.lazy(() => import("./views/Administration/UserTable"));
const AccessManagementTable = React.lazy(
  () => import("./views/Administration/AccessManagementTable")
);

//Design - Components
const AccordionAndDividers = React.lazy(
  () => import("./views/Components/AccordionAndDividers")
);
const ImageDesigns = React.lazy(
  () => import("./views/Components/ImageDesigns")
);
const TabPanel = React.lazy(() => import("./views/Components/TabPanel"));
const UnderDevelopment = React.lazy(
  () => import("./components/UnderDevelopment")
);

//Design - Input Fields
const TextField = React.lazy(() => import("./views/Components/TextField"));
const DatePickers = React.lazy(() => import("./views/Components/DatePickers"));
const OtherInputs = React.lazy(() => import("./views/Components/OtherInputs"));

//Sample CRUD - Chemical management
const ChemicalRequestTable = React.lazy(
  () => import("./views/ChemicalMng/ChemicalRequestTable")
);
const ChemicalPurchaseInventoryTable = React.lazy(
  () => import("./views/ChemicalMng/ChemicalPurchaseInventoryTable")
);
const ChemicalTransactionTable = React.lazy(
  () => import("./views/ChemicalMng/TransactionTable")
);
const ChemicalDashboard = React.lazy(
  () => import("./views/ChemicalMng/Dashboard")
);

const Autocomplete = React.lazy(
  () => import("./views/Components/Autocomplete")
);

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
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />

        {/* Admin Controller */}
        <Route
          path="/admin/users"
          element={withLayout(
            MainLayout,
            UserTable,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />
        <Route
          path="/admin/access-management"
          element={withLayout(
            MainLayout,
            AccessManagementTable,
            !userPermissionObject?.[PermissionKeys.ADMIN_USERS_VIEW]
          )}
        />

        {/* Design - Components */}
        <Route
          path="/components/accordion-divider"
          element={withLayout(
            MainLayout,
            AccordionAndDividers,
            !userPermissionObject?.[
              PermissionKeys.COMPONENTS_ACCORDION_DIVIDER_VIEW
            ]
          )}
        />
        <Route
          path="/components/image-designs"
          element={withLayout(
            MainLayout,
            ImageDesigns,
            !userPermissionObject?.[
              PermissionKeys.COMPONENTS_IMAGE_DESIGNS_VIEW
            ]
          )}
        />
        <Route
          path="/components/tab-panels"
          element={withLayout(
            MainLayout,
            TabPanel,
            !userPermissionObject?.[PermissionKeys.COMPONENTS_TAB_PANEL_VIEW]
          )}
        />
        <Route
          path="/components/under-development"
          element={withLayout(
            MainLayout,
            UnderDevelopment,
            !userPermissionObject?.[
              PermissionKeys.COMPONENTS_UNDER_DEVELOPMENT_VIEW
            ]
          )}
        />

        {/* Design - Input Fields */}
        <Route
          path="/input-fields/autocomplete"
          element={withLayout(
            MainLayout,
            Autocomplete,
            !userPermissionObject?.[
              PermissionKeys.INPUT_FIELDS_AUTOCOMPLETE_VIEW
            ]
          )}
        />
        <Route
          path="/input-fields/textfield"
          element={withLayout(
            MainLayout,
            TextField,
            !userPermissionObject?.[
              PermissionKeys.INPUT_FIELDS_TEXT_FIELDS_VIEW
            ]
          )}
        />
        <Route
          path="/input-fields/date-pickers"
          element={withLayout(
            MainLayout,
            DatePickers,
            !userPermissionObject?.[
              PermissionKeys.INPUT_FIELDS_DATE_PICKERS_VIEW
            ]
          )}
        />
        <Route
          path="/input-fields/other-inputs"
          element={withLayout(
            MainLayout,
            OtherInputs,
            !userPermissionObject?.[
              PermissionKeys.INPUT_FIELDS_OTHER_INPUTS_VIEW
            ]
          )}
        />

        {/* chemical management */}
        <Route
          path="/chemical-mng/dashboard"
          element={withLayout(
            MainLayout,
            ChemicalDashboard,
            !userPermissionObject?.[PermissionKeys.CHEMICAL_MNG_DASHBOARD_VIEW]
          )}
        />
        <Route
          path="/chemical-mng/chemical-requests"
          element={withLayout(
            MainLayout,
            ChemicalRequestTable,
            !userPermissionObject?.[
              PermissionKeys.CHEMICAL_MNG_REQUEST_REGISTER_VIEW
            ]
          )}
        />
        <Route
          path="/chemical-mng/purchase-inventory"
          element={withLayout(
            MainLayout,
            ChemicalPurchaseInventoryTable,
            !userPermissionObject?.[
              PermissionKeys.CHEMICAL_MNG_PURCHASE_INVENTORY_VIEW
            ]
          )}
        />
        <Route
          path="/chemical-mng/transaction"
          element={withLayout(
            MainLayout,
            ChemicalTransactionTable,
            !userPermissionObject?.[
              PermissionKeys.CHEMICAL_MNG_TRANSACTION_VIEW
            ]
          )}
        />
        <Route
          path="/chemical-mng/assigned-tasks"
          element={withLayout(
            MainLayout,
            () => {
              return <ChemicalRequestTable isAssignedTasks={true} />;
            },
            !userPermissionObject?.[
              PermissionKeys.CHEMICAL_MNG_ASSIGNED_TASKS_VIEW
            ]
          )}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
