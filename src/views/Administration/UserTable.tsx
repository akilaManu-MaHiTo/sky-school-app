import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Stack,
  Tab,
  TableFooter,
  TablePagination,
  Tabs,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import theme from "../../theme";
import PageTitle from "../../components/PageTitle";
import Breadcrumb from "../../components/BreadCrumb";
import { useMemo, useState } from "react";
import ViewDataDrawer, { DrawerHeader } from "../../components/ViewDataDrawer";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { useSnackbar } from "notistack";
import { updateUserType, User } from "../../api/userApi";
import ViewUserContent from "./ViewUserContent";
import EditUserRoleDialog from "./EditUserRoleDialog";
import { PermissionKeys } from "./SectionList";
import useCurrentUserHaveAccess from "../../hooks/useCurrentUserHaveAccess";
import { useMutation, useQuery } from "@tanstack/react-query";
import { green, grey } from "@mui/material/colors";
import queryClient from "../../state/queryClient";
import SearchInput from "../../components/SearchBar";
import { useDebounce } from "../../util/useDebounce";
import { getUserData } from "../../api/OrganizationSettings/organizationSettingsApi";
import { format } from "date-fns";
import { getPlainAddress } from "../../util/plainText.util";
import EditIcon from "@mui/icons-material/Edit";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import useCurrentOrganization from "../../hooks/useCurrentOrganization";
import { exportTeacherDetailsToExcel } from "../../reportsUtils/TeacherDetailsExcel";
import { exportStudentDetailsToExcel } from "../../reportsUtils/StudentDetailsExcel";
import { exportParentDetailsToExcel } from "../../reportsUtils/ParentDetailsExcel";
import { generateTeacherDetailsPdf } from "../../reportsUtils/TeacherDetailsPDF";
import { generateStudentDetailsPdf } from "../../reportsUtils/StudentDetailsPDF";
import { generateParentDetailsPdf } from "../../reportsUtils/ParentDetailsPDF";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

function UserTable() {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [userRole, setUserRole] = useState("All");
  console.log("userRole", userRole);
  const handleSearch = async (query: string) => {
    console.log("Searching for:", query);
    setSearchQuery(query);
    try {
      await researchUserData();
    } catch (error) {
      console.error("Search failed:", error);
    }
  };
  const [openViewDrawer, setOpenViewDrawer] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | string | null>(
    null
  );
  const [openEditUserRoleDialog, setOpenEditUserRoleDialog] = useState(false);
  const [selectedSortBy, setSelectedSortBy] = useState("user_id_desc");
  // const [userData, setUserData] = useState<User[]>(sampleUsers);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const isActionMenuOpen = Boolean(menuAnchorEl);

  const handleOpenActionMenu = (event: any, userId: number | string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleCloseActionMenu = () => {
    setMenuAnchorEl(null);
  };

  const debouncedQuery = useDebounce(searchQuery, 1000);

  const { organization } = useCurrentOrganization();
  const organizationName = organization?.organizationName;

  const {
    data: searchedUserData,
    refetch: researchUserData,
    isFetching: isSearchingUsers,
  } = useQuery({
    queryKey: ["user-data", debouncedQuery, userRole, selectedSortBy],
    queryFn: ({ queryKey }) =>
      getUserData({
        query: queryKey[1],
        role: userRole,
        sortBy: selectedSortBy,
      }),
  });

  // handle pagination
  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Administration" },
    { title: "User Management" },
    { title: "All Users" },
  ];

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md")
  );

  const paginatedUsersData = useMemo(() => {
    const sourceData =
      userRole === "All" && !searchQuery ? searchedUserData : searchedUserData;

    if (!sourceData) return [];

    if (rowsPerPage === -1) {
      return sourceData;
    }
    return sourceData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [
    searchedUserData,
    searchedUserData,
    page,
    rowsPerPage,
    userRole,
    searchQuery,
  ]);
  console.log("paginatedUsersData", paginatedUsersData);

  const currentUserList = useMemo(() => {
    if (userRole === "All" && !searchQuery) return searchedUserData ?? [];
    return searchedUserData ?? [];
  }, [searchedUserData, userRole, searchQuery]);

  const teacherList = useMemo(
    () =>
      (currentUserList ?? []).filter((u: any) => u.employeeType === "Teacher"),
    [currentUserList]
  );

  const studentList = useMemo(
    () =>
      (currentUserList ?? []).filter((u: any) => u.employeeType === "Student"),
    [currentUserList]
  );

  const parentList = useMemo(
    () =>
      (currentUserList ?? []).filter((u: any) => u.employeeType === "Parent"),
    [currentUserList]
  );

  const selectedRow = useMemo(() => {
    if (!selectedUserId) return null;
    return currentUserList.find((u: User) => u.id === selectedUserId) ?? null;
  }, [currentUserList, selectedUserId]);

  const { mutate: updateUserRoleMutation, isPending } = useMutation({
    mutationFn: updateUserType,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-data", debouncedQuery, userRole, selectedSortBy],
      });
      setOpenEditUserRoleDialog(false);
      enqueueSnackbar("User Role Updated Successfully!", {
        variant: "success",
      });
    },
    onError: () => {
      enqueueSnackbar(`User Role Update Failed`, {
        variant: "error",
      });
    },
  });

  const handleExportTeachersExcel = () => {
    if (!teacherList.length) {
      enqueueSnackbar("No teacher data to export", { variant: "warning" });
      return;
    }
    exportTeacherDetailsToExcel(teacherList, {
      organizationName,
      title: "Teacher Details",
      fileName: "teacher-details.xlsx",
    });
  };

  const handleExportTeachersPdf = () => {
    if (!teacherList.length) {
      enqueueSnackbar("No teacher data to export", { variant: "warning" });
      return;
    }
    try {
      generateTeacherDetailsPdf(teacherList, {
        organizationName,
        title: "Teacher Details Report",
      });
    } catch (error) {
      console.error("Unable to generate teacher PDF:", error);
      enqueueSnackbar("Unable to generate teacher PDF", { variant: "error" });
    }
  };

  const handleExportStudentsExcel = () => {
    if (!studentList.length) {
      enqueueSnackbar("No student data to export", { variant: "warning" });
      return;
    }
    exportStudentDetailsToExcel(studentList, {
      organizationName,
      title: "Student Details",
      fileName: "student-details.xlsx",
    });
  };

  const handleExportStudentsPdf = () => {
    if (!studentList.length) {
      enqueueSnackbar("No student data to export", { variant: "warning" });
      return;
    }
    try {
      generateStudentDetailsPdf(studentList, {
        organizationName,
        title: "Student Details Report",
      });
    } catch (error) {
      console.error("Unable to generate student PDF:", error);
      enqueueSnackbar("Unable to generate student PDF", { variant: "error" });
    }
  };

  const handleExportParentsExcel = () => {
    if (!parentList.length) {
      enqueueSnackbar("No parent data to export", { variant: "warning" });
      return;
    }
    exportParentDetailsToExcel(parentList, {
      organizationName,
      title: "Parent Details",
      fileName: "parent-details.xlsx",
    });
  };

  const handleExportParentsPdf = () => {
    if (!parentList.length) {
      enqueueSnackbar("No parent data to export", { variant: "warning" });
      return;
    }
    try {
      generateParentDetailsPdf(parentList, {
        organizationName,
        title: "Parent Details Report",
      });
    } catch (error) {
      console.error("Unable to generate parent PDF:", error);
      enqueueSnackbar("Unable to generate parent PDF", { variant: "error" });
    }
  };

  return (
    <Stack>
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          marginY: 2,
          borderRadius: 1,
          overflowX: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <PageTitle title="All Users" />
        <Breadcrumb breadcrumbs={breadcrumbItems} />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          flex: { lg: 3, md: 1 },
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          padding: "2rem",
          borderRadius: "0.3rem",
        }}
      >
        <AppBar position="static" sx={{ maxWidth: isMobile ? "75vw" : "100%" }}>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            indicatorColor="secondary"
            TabIndicatorProps={{
              style: { backgroundColor: "var(--pallet-blue)", height: "3px" },
            }}
            sx={{
              backgroundColor: "var(--pallet-lighter-grey)",
              color: "var(--pallet-blue)",
              width: "100%",
            }}
            textColor="inherit"
            variant="scrollable"
            scrollButtons={true}
          >
            <Tab
              label={
                <Box
                  sx={{
                    color: "var(--pallet-blue)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* <TextSnippetIcon fontSize="small" /> */}
                  <Typography variant="body2" sx={{ ml: "0.3rem" }}>
                    All Users
                  </Typography>
                </Box>
              }
              onClick={() => setUserRole("All")}
              {...a11yProps(0)}
            />
            <Tab
              label={
                <Box
                  sx={{
                    color: "var(--pallet-blue)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* <AccessTimeIcon fontSize="small" /> */}
                  <Typography variant="body2" sx={{ ml: "0.3rem" }}>
                    Teachers
                  </Typography>
                </Box>
              }
              onClick={() => setUserRole("Teacher")}
              {...a11yProps(1)}
            />
            <Tab
              label={
                <Box
                  sx={{
                    color: "var(--pallet-blue)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* <Filter1Icon fontSize="small" /> */}
                  <Typography variant="body2" sx={{ ml: "0.3rem" }}>
                    Students
                  </Typography>
                </Box>
              }
              onClick={() => setUserRole("Student")}
              {...a11yProps(2)}
            />
            <Tab
              label={
                <Box
                  sx={{
                    color: "var(--pallet-blue)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* <Filter1Icon fontSize="small" /> */}
                  <Typography variant="body2" sx={{ ml: "0.3rem" }}>
                    Parents
                  </Typography>
                </Box>
              }
              onClick={() => setUserRole("Parent")}
              {...a11yProps(3)}
            />
          </Tabs>
        </AppBar>
        <TabPanel value={activeTab} index={0} dir={theme.direction}>
          <Box
            mb={4}
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
          >
            <SearchInput
              placeholder="Search Users..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              isSearching={isSearchingUsers}
            />
          </Box>
          <Stack sx={{ alignItems: "center" }}>
            <TableContainer
              component={Paper}
              elevation={2}
              sx={{
                overflowX: "auto",
                maxWidth: isMobile ? "65vw" : "100%",
              }}
            >
              {isSearchingUsers && <LinearProgress sx={{ width: "100%" }} />}
              <Table aria-label="simple table">
                <TableHead
                  sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}
                >
                  <TableRow>
                    <TableCell>
                      Id
                      <IconButton
                        sx={{ alignContent: "center" }}
                        onClick={() => {
                          if (selectedSortBy === "user_id_asc") {
                            setSelectedSortBy("user_id_desc");
                            return;
                          } else {
                            setSelectedSortBy("user_id_asc");
                          }
                        }}
                      >
                        {selectedSortBy === "user_id_asc" ? (
                          <ArrowDropDownIcon fontSize="small" />
                        ) : (
                          <ArrowDropUpIcon fontSize="small" />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell align="left">Name With Initials</TableCell>
                    <TableCell align="left">Email</TableCell>
                    <TableCell align="left">Mobile Number</TableCell>
                    <TableCell align="left">Address</TableCell>
                    <TableCell align="left">Birthday</TableCell>
                    <TableCell align="left">Gender</TableCell>
                    <TableCell align="center">User Role</TableCell>
                    <TableCell align="center">Access Role</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsersData?.length > 0 ? (
                    paginatedUsersData?.map((row) => (
                      <TableRow
                        key={`${row.id}`}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          cursor: "pointer",
                        }}
                        // onClick={() => {
                        //   setSelectedUserId(row.id);
                        //   setOpenViewDrawer(true);
                        // }}
                      >
                        <TableCell align="left">{row.id}</TableCell>
                        <TableCell align="left">
                          {row.nameWithInitials}
                        </TableCell>
                        <TableCell align="left">{row.email}</TableCell>
                        <TableCell align="left">{row.mobile}</TableCell>
                        <TableCell align="left">
                          {getPlainAddress(row.address)}
                        </TableCell>
                        <TableCell align="left">
                          {row?.birthDate
                            ? format(new Date(row.birthDate), "yyyy-MM-dd")
                            : "--"}
                        </TableCell>
                        <TableCell align="right">
                          {row.gender ?? "--"}
                        </TableCell>

                        <TableCell align="center">
                          {row.employeeType ?? "--"}
                        </TableCell>
                        <TableCell align="center">
                          {row.userType.userType ?? "--"}
                        </TableCell>
                        <TableCell align="center">
                          {row.availability ? (
                            <Chip
                              label="Active"
                              sx={{
                                backgroundColor: green[100],
                                color: green[800],
                              }}
                            />
                          ) : (
                            <Chip
                              label="Inactive"
                              sx={{
                                backgroundColor: grey[100],
                                color: grey[800],
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={(event) =>
                              handleOpenActionMenu(event, row.id)
                            }
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        <Typography variant="body2">No Users found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[
                        5,
                        10,
                        25,
                        { label: "All", value: -1 },
                      ]}
                      colSpan={100}
                      count={searchedUserData?.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      showFirstButton={true}
                      showLastButton={true}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Stack>
        </TabPanel>
        <TabPanel value={activeTab} index={1} dir={theme.direction}>
          <Box
            mb={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <SearchInput
              placeholder="Search Users..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              isSearching={isSearchingUsers}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon fontSize="small" />}
              onClick={handleExportTeachersExcel}
              disabled={!teacherList.length}
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PictureAsPdfIcon fontSize="small" />}
              onClick={handleExportTeachersPdf}
              disabled={!teacherList.length}
            >
              PDF
            </Button>
          </Box>
          <Stack sx={{ alignItems: "center" }}>
            <TableContainer
              component={Paper}
              elevation={2}
              sx={{
                overflowX: "auto",
                maxWidth: isMobile ? "65vw" : "100%",
              }}
            >
              {isSearchingUsers && <LinearProgress sx={{ width: "100%" }} />}
              <Table aria-label="simple table">
                <TableHead
                  sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}
                >
                  <TableRow>
                    <TableCell>
                      Id
                      <IconButton
                        sx={{ alignContent: "center" }}
                        onClick={() => {
                          if (selectedSortBy === "user_id_asc") {
                            setSelectedSortBy("user_id_desc");
                            return;
                          } else {
                            setSelectedSortBy("user_id_asc");
                          }
                        }}
                      >
                        {selectedSortBy === "user_id_asc" ? (
                          <ArrowDropDownIcon fontSize="small" />
                        ) : (
                          <ArrowDropUpIcon fontSize="small" />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell align="left">Name With Initials</TableCell>
                    <TableCell align="left">Email</TableCell>
                    <TableCell align="left">Mobile Number</TableCell>
                    <TableCell align="left">Address</TableCell>
                    <TableCell align="left">Birthday</TableCell>
                    <TableCell align="left">Gender</TableCell>
                    <TableCell align="center">User Role</TableCell>
                    <TableCell align="center">Access Role</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsersData?.length > 0 ? (
                    paginatedUsersData?.map((row) => (
                      <TableRow
                        key={`${row.id}`}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          cursor: "pointer",
                        }}
                        // onClick={() => {
                        //   setSelectedUserId(row.id);
                        //   setOpenViewDrawer(true);
                        // }}
                      >
                        <TableCell align="left">{row.id}</TableCell>
                        <TableCell align="left">
                          {row.nameWithInitials}
                        </TableCell>
                        <TableCell align="left">{row.email}</TableCell>
                        <TableCell align="left">{row.mobile}</TableCell>
                        <TableCell align="left">
                          {getPlainAddress(row.address)}
                        </TableCell>
                        <TableCell align="left">
                          {row?.birthDate
                            ? format(new Date(row.birthDate), "yyyy-MM-dd")
                            : "--"}
                        </TableCell>
                        <TableCell align="right">
                          {row.gender ?? "--"}
                        </TableCell>

                        <TableCell align="center">
                          {row.employeeType ?? "--"}
                        </TableCell>
                        <TableCell align="center">
                          {row.userType.userType ?? "--"}
                        </TableCell>
                        <TableCell align="center">
                          {row.availability ? (
                            <Chip
                              label="Active"
                              sx={{
                                backgroundColor: green[100],
                                color: green[800],
                              }}
                            />
                          ) : (
                            <Chip
                              label="Inactive"
                              sx={{
                                backgroundColor: grey[100],
                                color: grey[800],
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={(event) =>
                              handleOpenActionMenu(event, row.id)
                            }
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        <Typography variant="body2">No Users found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[
                        5,
                        10,
                        25,
                        { label: "All", value: -1 },
                      ]}
                      colSpan={100}
                      count={searchedUserData?.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      showFirstButton={true}
                      showLastButton={true}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Stack>
        </TabPanel>
        <TabPanel value={activeTab} index={2} dir={theme.direction}>
          <Box
            mb={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <SearchInput
              placeholder="Search Users..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              isSearching={isSearchingUsers}
            />
            
          </Box>
          <Box sx={{ display: "flex", gap: 1,mb:2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon fontSize="small" />}
                onClick={handleExportStudentsExcel}
                disabled={!studentList.length}
              >
                Excel
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PictureAsPdfIcon fontSize="small" />}
                onClick={handleExportStudentsPdf}
                disabled={!studentList.length}
              >
                PDF
              </Button>
            </Box>
          <Stack sx={{ alignItems: "center" }}>
            <TableContainer
              component={Paper}
              elevation={2}
              sx={{
                overflowX: "auto",
                maxWidth: isMobile ? "65vw" : "100%",
              }}
            >
              {isSearchingUsers && <LinearProgress sx={{ width: "100%" }} />}
              <Table aria-label="simple table">
                <TableHead
                  sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}
                >
                  <TableRow>
                    <TableCell>
                      Id
                      <IconButton
                        sx={{ alignContent: "center" }}
                        onClick={() => {
                          if (selectedSortBy === "user_id_asc") {
                            setSelectedSortBy("user_id_desc");
                            return;
                          } else {
                            setSelectedSortBy("user_id_asc");
                          }
                        }}
                      >
                        {selectedSortBy === "user_id_asc" ? (
                          <ArrowDropDownIcon fontSize="small" />
                        ) : (
                          <ArrowDropUpIcon fontSize="small" />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell align="left">Name With Initials</TableCell>
                    <TableCell align="left">Email</TableCell>
                    <TableCell align="left">Mobile Number</TableCell>
                    <TableCell align="left">Address</TableCell>
                    <TableCell align="left">Birthday</TableCell>
                    <TableCell align="left">Gender</TableCell>
                    <TableCell align="center">User Role</TableCell>
                    <TableCell align="center">Access Role</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsersData?.length > 0 ? (
                    paginatedUsersData?.map((row) => (
                      <TableRow
                        key={`${row.id}`}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          cursor: "pointer",
                        }}
                        // onClick={() => {
                        //   setSelectedUserId(row.id);
                        //   setOpenViewDrawer(true);
                        // }}
                      >
                        <TableCell align="left">{row.id}</TableCell>
                        <TableCell align="left">
                          {row.nameWithInitials}
                        </TableCell>
                        <TableCell align="left">{row.email}</TableCell>
                        <TableCell align="left">{row.mobile}</TableCell>
                        <TableCell align="left">
                          {getPlainAddress(row.address)}
                        </TableCell>
                        <TableCell align="left">
                          {row?.birthDate
                            ? format(new Date(row.birthDate), "yyyy-MM-dd")
                            : "--"}
                        </TableCell>
                        <TableCell align="right">
                          {row.gender ?? "--"}
                        </TableCell>

                        <TableCell align="center">
                          {row.employeeType ?? "--"}
                        </TableCell>
                        <TableCell align="center">
                          {row.userType.userType ?? "--"}
                        </TableCell>
                        <TableCell align="center">
                          {row.availability ? (
                            <Chip
                              label="Active"
                              sx={{
                                backgroundColor: green[100],
                                color: green[800],
                              }}
                            />
                          ) : (
                            <Chip
                              label="Inactive"
                              sx={{
                                backgroundColor: grey[100],
                                color: grey[800],
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={(event) =>
                              handleOpenActionMenu(event, row.id)
                            }
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        <Typography variant="body2">No Users found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[
                        5,
                        10,
                        25,
                        { label: "All", value: -1 },
                      ]}
                      colSpan={100}
                      count={searchedUserData?.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      showFirstButton={true}
                      showLastButton={true}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Stack>
        </TabPanel>
        <TabPanel value={activeTab} index={3} dir={theme.direction}>
          <Box
            mb={2}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <SearchInput
              placeholder="Search Users..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              isSearching={isSearchingUsers}
            />
            
          </Box>
          <Box sx={{ display: "flex", gap: 1,mb:2 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon fontSize="small" />}
                onClick={handleExportParentsExcel}
                disabled={!parentList.length}
              >
                Excel
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PictureAsPdfIcon fontSize="small" />}
                onClick={handleExportParentsPdf}
                disabled={!parentList.length}
              >
                PDF
              </Button>
            </Box>
          <Stack sx={{ alignItems: "center" }}>
            <TableContainer
              component={Paper}
              elevation={2}
              sx={{
                overflowX: "auto",
                maxWidth: isMobile ? "65vw" : "100%",
              }}
            >
              {isSearchingUsers && <LinearProgress sx={{ width: "100%" }} />}
              <Table aria-label="simple table">
                <TableHead
                  sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}
                >
                  <TableRow>
                    <TableCell>
                      Id
                      <IconButton
                        sx={{ alignContent: "center" }}
                        onClick={() => {
                          if (selectedSortBy === "user_id_asc") {
                            setSelectedSortBy("user_id_desc");
                            return;
                          } else {
                            setSelectedSortBy("user_id_asc");
                          }
                        }}
                      >
                        {selectedSortBy === "user_id_asc" ? (
                          <ArrowDropDownIcon fontSize="small" />
                        ) : (
                          <ArrowDropUpIcon fontSize="small" />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell align="left">Name With Initials</TableCell>
                    <TableCell align="left">Email</TableCell>
                    <TableCell align="left">Mobile Number</TableCell>
                    <TableCell align="left">Address</TableCell>
                    <TableCell align="left">Birthday</TableCell>
                    <TableCell align="left">Gender</TableCell>
                    <TableCell align="center">User Role</TableCell>
                    <TableCell align="center">Access Role</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsersData?.length > 0 ? (
                    paginatedUsersData?.map((row) => (
                      <TableRow
                        key={`${row.id}`}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          cursor: "pointer",
                        }}
                        // onClick={() => {
                        //   setSelectedUserId(row.id);
                        //   setOpenViewDrawer(true);
                        // }}
                      >
                        <TableCell align="left">{row.id}</TableCell>
                        <TableCell align="left">
                          {row.nameWithInitials}
                        </TableCell>
                        <TableCell align="left">{row.email}</TableCell>
                        <TableCell align="left">{row.mobile}</TableCell>
                        <TableCell align="left">
                          {getPlainAddress(row.address)}
                        </TableCell>
                        <TableCell align="left">
                          {row?.birthDate
                            ? format(new Date(row.birthDate), "yyyy-MM-dd")
                            : "--"}
                        </TableCell>
                        <TableCell align="right">
                          {row.gender ?? "--"}
                        </TableCell>

                        <TableCell align="center">
                          {row.employeeType ?? "--"}
                        </TableCell>
                        <TableCell align="center">
                          {row.userType.userType ?? "--"}
                        </TableCell>
                        <TableCell align="center">
                          {row.availability ? (
                            <Chip
                              label="Active"
                              sx={{
                                backgroundColor: green[100],
                                color: green[800],
                              }}
                            />
                          ) : (
                            <Chip
                              label="Inactive"
                              sx={{
                                backgroundColor: grey[100],
                                color: grey[800],
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={(event) =>
                              handleOpenActionMenu(event, row.id)
                            }
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        <Typography variant="body2">No Users found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[
                        5,
                        10,
                        25,
                        { label: "All", value: -1 },
                      ]}
                      colSpan={100}
                      count={searchedUserData?.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      showFirstButton={true}
                      showLastButton={true}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Stack>
        </TabPanel>
      </Box>

      <Menu
        anchorEl={menuAnchorEl}
        open={isActionMenuOpen}
        onClose={handleCloseActionMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            setOpenViewDrawer(true);
            handleCloseActionMenu();
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} color="primary" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOpenEditUserRoleDialog(true);
            handleCloseActionMenu();
          }}
        >
          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} color="success" />
          Active
        </MenuItem>
      </Menu>

      <ViewDataDrawer
        open={openViewDrawer}
        handleClose={() => {
          setOpenViewDrawer(false);
          setSelectedUserId(null);
        }}
        fullScreen={true}
        drawerContent={
          <Stack spacing={1} sx={{ paddingX: theme.spacing(1) }}>
            <DrawerHeader
              title="User Details"
              handleClose={() => {
                setOpenViewDrawer(false);
                setSelectedUserId(null);
              }}
            />

            {selectedRow && (
              <Stack>
                <ViewUserContent selectedUser={selectedRow} />
              </Stack>
            )}
          </Stack>
        }
      />
      {openEditUserRoleDialog && (
        <EditUserRoleDialog
          open={openEditUserRoleDialog}
          handleClose={() => {
            setSelectedUserId(null);
            setOpenViewDrawer(false);
            setOpenEditUserRoleDialog(false);
          }}
          onSubmit={(data) => {
            console.log("data", data);
            updateUserRoleMutation(data);
          }}
          defaultValues={selectedRow}
        />
      )}
      {deleteDialogOpen && (
        <DeleteConfirmationModal
          open={deleteDialogOpen}
          title="Remove User Confirmation"
          content={
            <>
              Are you sure you want to remove this user?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                This action is not reversible.
              </Alert>
            </>
          }
          handleClose={() => setDeleteDialogOpen(false)}
          deleteFunc={async () => {}}
          onSuccess={() => {
            setOpenViewDrawer(false);
            setSelectedUserId(null);
            setDeleteDialogOpen(false);
            enqueueSnackbar("User Deleted Successfully!", {
              variant: "success",
            });
          }}
          handleReject={() => {
            setOpenViewDrawer(false);
            setSelectedUserId(null);
            setDeleteDialogOpen(false);
          }}
        />
      )}
    </Stack>
  );
}

export default UserTable;
