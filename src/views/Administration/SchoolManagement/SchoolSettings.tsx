import {
  Alert,
  AppBar,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import DeleteIcon from "@mui/icons-material/Delete";
import useIsMobile from "../../../customHooks/useIsMobile";
import theme from "../../../theme";
import EditIcon from "@mui/icons-material/Edit";
import {
  getGradesData,
  getOrganization,
  getSubjectData,
  getYearsData,
  Organization,
} from "../../../api/OrganizationSettings/organizationSettingsApi";
import PageTitle from "../../../components/PageTitle";
import Breadcrumb from "../../../components/BreadCrumb";
import { useMutation, useQuery } from "@tanstack/react-query";
import CustomButton from "../../../components/CustomButton";
import useColumnVisibility from "../../../components/useColumnVisibility";
import ColumnVisibilitySelector from "../../../components/ColumnVisibilitySelector";
import AddIcon from "@mui/icons-material/Add";
import { AddOrEditAcademicGrade } from "./AddOrEditAcademicGrade";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Filter1Icon from "@mui/icons-material/Filter1";
import SubjectIcon from "@mui/icons-material/Subject";
import ClassIcon from "@mui/icons-material/Class";
import { AddOrEditAcademicClass } from "./AddOrEditAcademicClass";
import {
  deleteAcademicClass,
  deleteAcademicGrade,
  getClassesData,
} from "../../../api/OrganizationSettings/academicGradeApi";
import { DrawerContentItem } from "../../../components/ViewDataDrawer";
import { hasSignedUrl } from "./schoolUtils";
import EditOrganizationDialog from "./AddOrEditSchoolDialog";
import { AddOrEditAcademicYear } from "./AddOrEditAcademicYear";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import {
  deleteAcademicSubject,
  deleteAcademicYear,
} from "../../../api/OrganizationSettings/academicGradeApi";
import queryClient from "../../../state/queryClient";
import { enqueueSnackbar } from "notistack";
import SearchInput from "../../../components/SearchBar";
import { useDebounce } from "../../../util/useDebounce";
import { AddOrEditSubjects } from "./AddOrEditSubjects";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  generatePdf,
  LetterSubjects,
} from "../../../reportsUtils/SubjectsReportPDF";
import useCurrentOrganization from "../../../hooks/useCurrentOrganization";
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

function SchoolSettings({ schoolSettings }: { schoolSettings: Organization }) {
  const [activeTab, setActiveTab] = useState(0);
  const { organization } = useCurrentOrganization();

  // General Details Dialogs
  const [openEditOrganizationDialog, setOpenEditOrganizationDialog] =
    useState(false);

  // Academic Year Dialogs
  const [openAcademicYearDialog, setOpenAcademicYearDialog] = useState(false);
  const [editAcademicYearData, setEditAcademicYearData] = useState(null);
  const [openDeleteAcademicYearDialog, setOpenDeleteAcademicYearDialog] =
    useState(false);

  // Academic Grade Dialogs
  const [openAcademicGradeDialog, setOpenAcademicGradeDialog] = useState(false);
  const [editGradeData, setEditGradeData] = useState(null);
  const [openDeleteAcademicGradeDialog, setOpenDeleteAcademicGradeDialog] =
    useState(false);

  // Academic Subject Dialogs
  const [openAddOrEditSubjectDialog, setOpenAddOrEditSubjectDialog] =
    useState(false);
  const [editSubjectData, setEditSubjectData] = useState(null);
  const [openDeleteAcademicSubjectDialog, setOpenDeleteAcademicSubjectDialog] =
    useState(false);

  // Academic Class Dialogs
  const [editAcademicClassData, setEditAcademicClassData] = useState(null);
  const [openAcademicClassDialog, setOpenAcademicClassDialog] = useState(false);
  const [openDeleteAcademicClassDialog, setOpenDeleteAcademicClassDialog] =
    useState(false);

  // Column visibility configs
  const gradeColumns = useMemo(
    () => [
      { key: "id", label: "Id" },
      { key: "grade", label: "Grade" },
    ],
    []
  );
  const classColumns = useMemo(
    () => [
      { key: "id", label: "Id" },
      { key: "className", label: "Class Name" },
    ],
    []
  );

  const {
    visibility: gradeColumnVisibility,
    columnSelectorProps: gradeColumnSelectorProps,
  } = useColumnVisibility({
    columns: gradeColumns,
  });

  const {
    visibility: classColumnVisibility,
    columnSelectorProps: classColumnSelectorProps,
  } = useColumnVisibility({
    columns: classColumns,
  });

  // Utils
  const [searchQuery, setSearchQuery] = useState("");
  const { isTablet, isMobile } = useIsMobile();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "School Settings" },
  ];

  // Fetch Organization Data
  const { data: organizationData } = useQuery({
    queryKey: ["organization"],
    queryFn: getOrganization,
  });
  const logo = Array.isArray(organizationData?.logoUrl)
    ? organizationData?.logoUrl[0]
    : organizationData?.logoUrl;
  const pdfOrganizationName =
    organization?.organizationName || organizationData?.organizationName;

  // Fetch Academic Year Data
  const { data: yearData, isFetching: isYearDataFetching } = useQuery({
    queryKey: ["academic-years"],
    queryFn: getYearsData,
  });

  // Fetch Academic Grade Data
  const { data: gradeData, isFetching: isGradeDataFetching } = useQuery({
    queryKey: ["academic-grades"],
    queryFn: getGradesData,
  });

  // Fetch Academic Subject Data
  const debouncedQuery = useDebounce(searchQuery, 1000);
  const {
    data: searchedSubjectData,
    refetch: researchSubjectData,
    isFetching: isSearchingSubjects,
  } = useQuery({
    queryKey: ["subject-data", debouncedQuery],
    queryFn: ({ queryKey }) => getSubjectData({ query: queryKey[1] }),
  });
  const handleSearch = async (query: string) => {
    console.log("Searching for:", query);
    setSearchQuery(query);
    try {
      await researchSubjectData();
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  // Fetch Academic Class Data
  const { data: classData, isFetching: isClassDataFetching } = useQuery({
    queryKey: ["academic-classes"],
    queryFn: getClassesData,
  });

  // Delete Year
  const {
    mutate: deleteAcademicYearMutation,
    isPending: isAcademicYearDeleting,
  } = useMutation({
    mutationFn: deleteAcademicYear,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["academic-years"],
      });
      enqueueSnackbar("Academic Year Delete Successfully!", {
        variant: "success",
      });
      setOpenDeleteAcademicYearDialog(false);
      setEditAcademicYearData(null);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Academic Year Delete Failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
  // Delete Grade
  const {
    mutate: deleteAcademicGradeMutation,
    isPending: isAcademicGradeDeleting,
  } = useMutation({
    mutationFn: deleteAcademicGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["academic-grades"],
      });
      enqueueSnackbar("Academic Grade Delete Successfully!", {
        variant: "success",
      });
      setOpenDeleteAcademicYearDialog(false);
      setEditAcademicYearData(null);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Academic Grade Delete Failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
  // Delete Subject
  const {
    mutate: deleteAcademicSubjectMutation,
    isPending: isAcademicSubjectDeleting,
  } = useMutation({
    mutationFn: deleteAcademicSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subject-data"],
      });
      enqueueSnackbar("Academic Subject Delete Successfully!", {
        variant: "success",
      });
      setOpenDeleteAcademicSubjectDialog(false);
      setEditSubjectData(null);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Academic Subject Delete Failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
  // Delete Class
  const {
    mutate: deleteAcademicClassMutation,
    isPending: isAcademicClassDeleting,
  } = useMutation({
    mutationFn: deleteAcademicClass,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["academic-classes"],
      });
      enqueueSnackbar("Academic Class Delete Successfully!", {
        variant: "success",
      });
      setOpenDeleteAcademicYearDialog(false);
      setEditAcademicYearData(null);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Academic Class Delete Failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });
  return (
    <Stack>
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          backgroundColor: "#fff",
          marginY: 2,
          borderRadius: 1,
          overflowX: "hidden",
        }}
      >
        <PageTitle title="School Management" />
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
        <Box
          sx={{
            marginY: "1rem",
            display: "flex",
            width: "100%",
          }}
        >
          <Alert severity="info" sx={{ width: "100%" }}>
            Manage school settings including academic years, grades, subjects,
            and classes.
          </Alert>
        </Box>
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
                  <TextSnippetIcon fontSize="small" />
                  <Typography variant="body2" sx={{ ml: "0.3rem" }}>
                    General Details
                  </Typography>
                </Box>
              }
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
                  <AccessTimeIcon fontSize="small" />
                  <Typography variant="body2" sx={{ ml: "0.3rem" }}>
                    Academic Years
                  </Typography>
                </Box>
              }
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
                  <Filter1Icon fontSize="small" />
                  <Typography variant="body2" sx={{ ml: "0.3rem" }}>
                    Academic Grades
                  </Typography>
                </Box>
              }
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
                  <SubjectIcon fontSize="small" />
                  <Typography variant="body2" sx={{ ml: "0.3rem" }}>
                    Academic Subjects
                  </Typography>
                </Box>
              }
              {...a11yProps(3)}
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
                  <ClassIcon fontSize="small" />
                  <Typography variant="body2" sx={{ ml: "0.3rem" }}>
                    Academic Classes
                  </Typography>
                </Box>
              }
              {...a11yProps(4)}
            />
          </Tabs>
        </AppBar>
        <TabPanel value={activeTab} index={0} dir={theme.direction}>
          <Stack
            sx={{
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: isMobile ? "center" : "flex-end",
                width: "100%",
              }}
            >
              <CustomButton
                variant="contained"
                sx={{
                  backgroundColor: "var(--pallet-blue)",
                }}
                size="medium"
                startIcon={<EditIcon />}
                onClick={() => setOpenEditOrganizationDialog(true)}
              >
                Edit General Details
              </CustomButton>
            </Box>

            {hasSignedUrl(logo) && (
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <img
                  src={logo.signedUrl}
                  alt="Organization Logo"
                  style={{
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    objectFit: "fill",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    padding: "1rem",
                  }}
                />
              </Box>
            )}

            <DrawerContentItem
              label="School Name"
              value={organizationData?.organizationName}
            />
          </Stack>
        </TabPanel>
        <TabPanel value={activeTab} index={1} dir={theme.direction}>
          <Stack>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: theme.spacing(2),
              }}
            >
              <CustomButton
                variant="contained"
                sx={{
                  backgroundColor: "var(--pallet-blue)",
                }}
                size="medium"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditAcademicYearData(null);
                  setOpenAcademicYearDialog(true);
                }}
              >
                Add New Academic Year
              </CustomButton>
            </Box>
            <TableContainer
              component={Paper}
              elevation={2}
              sx={{
                overflowX: "auto",
                maxWidth: isMobile ? "65vw" : "100%",
              }}
            >
              {(isYearDataFetching || isAcademicYearDeleting) && (
                <LinearProgress sx={{ width: "100%" }} />
              )}
              <Table aria-label="simple table">
                <TableHead
                  sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}
                >
                  <TableRow>
                    <TableCell align="center">Id</TableCell>
                    <TableCell align="center">Year</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {yearData?.length > 0 ? (
                    yearData?.map((row) => (
                      <TableRow
                        key={`${row.id}`}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          cursor: "pointer",
                        }}
                      >
                        <TableCell align="center">{row.id}</TableCell>
                        <TableCell align="center">
                          <Chip
                            variant="filled"
                            label={row.year}
                            sx={{
                              backgroundColor: "var(--pallet-lighter-blue)",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            variant="filled"
                            label={row.status}
                            sx={{
                              backgroundColor:
                                row.status === "Ongoing"
                                  ? "var(--pallet-green)"
                                  : "var(--pallet-red-lighter)",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => {
                              setEditAcademicYearData(row);
                              setOpenAcademicYearDialog(true);
                            }}
                            disabled={isAcademicYearDeleting}
                          >
                            <EditIcon color="primary" />
                          </IconButton>

                          <IconButton
                            onClick={() => {
                              setEditAcademicYearData(row);
                              setOpenDeleteAcademicYearDialog(true);
                            }}
                            disabled={isAcademicYearDeleting}
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        <Typography variant="body2">
                          No Academic Years found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </TabPanel>
        <TabPanel value={activeTab} index={2} dir={theme.direction}>
          <Stack>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                flexDirection: isMobile ? "column" : "row",
                gap: 2,
                marginBottom: theme.spacing(2),
              }}
            >
              <CustomButton
                variant="contained"
                sx={{
                  backgroundColor: "var(--pallet-blue)",
                }}
                size="medium"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditGradeData(null);
                  setOpenAcademicGradeDialog(true);
                }}
              >
                Add New Academic Grade
              </CustomButton>
            </Box>
            <TableContainer
              component={Paper}
              elevation={2}
              sx={{
                overflowX: "auto",
                maxWidth: isMobile ? "88vw" : "100%",
              }}
            >
              {(isGradeDataFetching || isAcademicGradeDeleting) && (
                <LinearProgress sx={{ width: "100%" }} />
              )}

              <Table aria-label="simple table">
                <TableHead
                  sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}
                >
                  <TableRow>
                    {gradeColumnVisibility.id && (
                      <TableCell align="center">Id</TableCell>
                    )}
                    {gradeColumnVisibility.grade && (
                      <TableCell align="center">Grade</TableCell>
                    )}
                    {gradeColumnVisibility.grade &&
                      gradeColumnVisibility.id && (
                        <TableCell align="center"></TableCell>
                      )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gradeData?.length > 0 ? (
                    gradeData?.map((row) => (
                      <TableRow
                        key={`${row.id}`}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          cursor: "pointer",
                        }}
                      >
                        {gradeColumnVisibility.id && (
                          <TableCell align="center">{row.id}</TableCell>
                        )}
                        {gradeColumnVisibility.grade && (
                          <TableCell align="center">
                            <Chip
                              variant="filled"
                              label={`Grade ` + row.grade}
                              sx={{
                                backgroundColor: "var(--pallet-lighter-blue)",
                              }}
                            />
                          </TableCell>
                        )}
                        {gradeColumnVisibility.grade &&
                          gradeColumnVisibility.id && (
                            <TableCell align="center">
                              <IconButton
                                onClick={() => {
                                  setEditGradeData(row);
                                  setOpenAcademicGradeDialog(true);
                                }}
                                disabled={isAcademicGradeDeleting}
                              >
                                <EditIcon color="primary" />
                              </IconButton>

                              <IconButton
                                onClick={() => {
                                  setEditGradeData(row);
                                  setOpenDeleteAcademicGradeDialog(true);
                                }}
                                disabled={isAcademicGradeDeleting}
                              >
                                <DeleteIcon color="error" />
                              </IconButton>
                            </TableCell>
                          )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        <Typography variant="body2">
                          No Academic Grades found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </TabPanel>
        <TabPanel value={activeTab} index={3} dir={theme.direction}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              flexDirection: isTablet ? "column" : "row",
              marginBottom: theme.spacing(2),
              gap: 2,
            }}
          >
            <CustomButton
              variant="contained"
              sx={{
                backgroundColor: "var(--pallet-blue)",
              }}
              size="medium"
              startIcon={<ArrowDownwardIcon />}
              onClick={() => {
                try {
                  const reportData = (searchedSubjectData ||
                    []) as LetterSubjects[];
                  generatePdf(reportData, {
                    organizationName: pdfOrganizationName,
                  });
                } catch (error) {
                  console.error("Unable to generate subject PDF:", error);
                }
              }}
            >
              Download PDF
            </CustomButton>
            <CustomButton
              variant="contained"
              sx={{
                backgroundColor: "var(--pallet-blue)",
              }}
              size="medium"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditSubjectData(null);
                setOpenAddOrEditSubjectDialog(true);
              }}
            >
              Add New Subject
            </CustomButton>
          </Box>

          <Box mb={4} display="flex" justifyContent="flex-start">
            <SearchInput
              placeholder="Search Subjects..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              isSearching={isSearchingSubjects}
            />
          </Box>

          <Stack spacing={3}>
            {(isSearchingSubjects || isAcademicSubjectDeleting) && (
              <Box sx={{ py: 4 }}>
                <LinearProgress sx={{ width: "100%", borderRadius: 1 }} />
              </Box>
            )}

            {searchedSubjectData && searchedSubjectData.length > 0 ? (
              searchedSubjectData
                .filter(
                  (item: any) =>
                    Array.isArray(item.subjects) && item.subjects.length > 0
                )
                .map((item: any) => (
                  <Box key={item.letter} sx={{ mb: 2 }}>
                    <Chip
                      label={item.letter}
                      sx={{
                        mb: 2,
                        fontSize: "18px",
                        fontWeight: "700",
                        borderRadius: "8px",
                        padding: "8px 16px",
                        height: "40px",
                        backgroundColor: "var(--pallet-blue)",
                        color: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    />

                    <Stack spacing={1.5}>
                      {item.subjects.map((subject: any) => (
                        <Paper
                          key={subject.id}
                          elevation={2}
                          sx={{
                            padding: 2.5,
                            borderRadius: 2,
                            transition: "all 0.2s ease-in-out",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{ xs: 1, sm: 3 }}
                            alignItems={{ xs: "flex-start", sm: "center" }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="inherit"
                                sx={{
                                  mb: 0.5,
                                }}
                              >
                                {subject.subjectName}{" "}
                                {subject.subjectMedium &&
                                  ` - ${subject.subjectMedium} Medium`}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <SubjectIcon fontSize="small" />
                                {subject.subjectCode}
                              </Typography>
                            </Box>

                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{
                                justifyContent: isMobile
                                  ? "space-between"
                                  : "flex-end",
                              }}
                            >
                              <Box>
                                <IconButton
                                  onClick={() => {
                                    setEditSubjectData(subject);
                                    setOpenAddOrEditSubjectDialog(true);
                                  }}
                                  disabled={isAcademicSubjectDeleting}
                                >
                                  <EditIcon color="primary" />
                                </IconButton>
                              </Box>
                              <Box>
                                <IconButton
                                  onClick={() => {
                                    setEditSubjectData(subject);
                                    setOpenDeleteAcademicSubjectDialog(true);
                                  }}
                                  disabled={isAcademicSubjectDeleting}
                                >
                                  <DeleteIcon color="error" />
                                </IconButton>
                              </Box>
                            </Stack>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                ))
            ) : (
              <Paper
                elevation={0}
                sx={{
                  py: 8,
                  textAlign: "center",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "text.secondary", mb: 1 }}
                >
                  {isSearchingSubjects ? "" : "No Subjects Found"}
                </Typography>
              </Paper>
            )}
          </Stack>
        </TabPanel>
        <TabPanel value={activeTab} index={4} dir={theme.direction}>
          <Stack>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                flexDirection: isMobile ? "column" : "row",
                gap: 2,
                marginBottom: theme.spacing(2),
              }}
            >
              <CustomButton
                variant="contained"
                sx={{ backgroundColor: "var(--pallet-blue)" }}
                size="medium"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditAcademicClassData(null);
                  setOpenAcademicClassDialog(true);
                }}
              >
                Add New Academic Class
              </CustomButton>
            </Box>
            <TableContainer
              component={Paper}
              elevation={2}
              sx={{ overflowX: "auto", maxWidth: isMobile ? "88vw" : "100%" }}
            >
              {(isClassDataFetching || isAcademicClassDeleting) && (
                <LinearProgress sx={{ width: "100%" }} />
              )}
              <Table aria-label="classes table">
                <TableHead
                  sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}
                >
                  <TableRow>
                    {classColumnVisibility.id && (
                      <TableCell align="left">Id</TableCell>
                    )}
                    {classColumnVisibility.className && (
                      <TableCell align="left">Class Name</TableCell>
                    )}
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classData?.length > 0 ? (
                    classData?.map((row: any) => (
                      <TableRow
                        key={`${row.id}`}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          cursor: "pointer",
                        }}
                      >
                        {classColumnVisibility.id && (
                          <TableCell align="left">{row.id}</TableCell>
                        )}
                        {classColumnVisibility.className && (
                          <TableCell align="left">
                            <Chip
                              variant="filled"
                              label={row.className}
                              sx={{
                                backgroundColor: "var(--pallet-lighter-blue)",
                              }}
                            />
                          </TableCell>
                        )}
                        <TableCell align="center">
                          <IconButton
                            onClick={() => {
                              setEditAcademicClassData(row);
                              setOpenAcademicClassDialog(true);
                            }}
                            disabled={isAcademicClassDeleting}
                          >
                            <EditIcon color="primary" />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              setEditAcademicClassData(row);
                              setOpenDeleteAcademicClassDialog(true);
                            }}
                            disabled={isAcademicClassDeleting}
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        <Typography variant="body2">
                          No Classes found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </TabPanel>
      </Box>
      {openAcademicGradeDialog && (
        <AddOrEditAcademicGrade
          open={openAcademicGradeDialog}
          setOpen={setOpenAcademicGradeDialog}
          defaultValues={editGradeData}
        />
      )}
      {openEditOrganizationDialog && (
        <EditOrganizationDialog
          open={openEditOrganizationDialog}
          handleClose={() => setOpenEditOrganizationDialog(false)}
          defaultValues={organizationData}
        />
      )}
      {openAcademicYearDialog && (
        <AddOrEditAcademicYear
          open={openAcademicYearDialog}
          setOpen={setOpenAcademicYearDialog}
          defaultValues={editAcademicYearData}
        />
      )}
      {openAddOrEditSubjectDialog && (
        <AddOrEditSubjects
          open={openAddOrEditSubjectDialog}
          setOpen={setOpenAddOrEditSubjectDialog}
          defaultValues={editSubjectData}
          query={debouncedQuery}
        />
      )}
      {openAcademicClassDialog && (
        <AddOrEditAcademicClass
          open={openAcademicClassDialog}
          setOpen={setOpenAcademicClassDialog}
          defaultValues={editAcademicClassData}
        />
      )}
      {openDeleteAcademicYearDialog && (
        <DeleteConfirmationModal
          open={openDeleteAcademicYearDialog}
          title="Remove Academic Year Confirmation"
          content={
            <>
              Are you sure you want to remove this Academic Year?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                This action is not reversible.
              </Alert>
            </>
          }
          handleClose={() => setOpenDeleteAcademicYearDialog(false)}
          deleteFunc={async () => {
            deleteAcademicYearMutation(editAcademicYearData.id);
          }}
          onSuccess={() => {
            setOpenDeleteAcademicYearDialog(false);
            setEditAcademicYearData(null);
          }}
          handleReject={() => {
            setOpenDeleteAcademicYearDialog(false);
            setEditAcademicYearData(null);
          }}
        />
      )}
      {openDeleteAcademicGradeDialog && (
        <DeleteConfirmationModal
          open={openDeleteAcademicGradeDialog}
          title="Remove Academic Grade Confirmation"
          content={
            <>
              Are you sure you want to remove this Academic Grade?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                This action is not reversible.
              </Alert>
            </>
          }
          handleClose={() => setOpenDeleteAcademicGradeDialog(false)}
          deleteFunc={async () => {
            deleteAcademicGradeMutation(editGradeData.id);
          }}
          onSuccess={() => {
            setOpenDeleteAcademicGradeDialog(false);
            setEditGradeData(null);
          }}
          handleReject={() => {
            setOpenDeleteAcademicGradeDialog(false);
            setEditGradeData(null);
          }}
        />
      )}
      {openDeleteAcademicClassDialog && (
        <DeleteConfirmationModal
          open={openDeleteAcademicClassDialog}
          title="Remove Academic Class Confirmation"
          content={
            <>
              Are you sure you want to remove this Academic Class?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                This action is not reversible.
              </Alert>
            </>
          }
          handleClose={() => setOpenDeleteAcademicClassDialog(false)}
          deleteFunc={async () => {
            deleteAcademicClassMutation(editAcademicClassData.id);
          }}
          onSuccess={() => {
            setOpenDeleteAcademicClassDialog(false);
            setEditAcademicClassData(null);
          }}
          handleReject={() => {
            setOpenDeleteAcademicClassDialog(false);
            setEditAcademicClassData(null);
          }}
        />
      )}
      {openDeleteAcademicSubjectDialog && (
        <DeleteConfirmationModal
          open={openDeleteAcademicSubjectDialog}
          title="Remove Academic Year Confirmation"
          content={
            <>
              Are you sure you want to remove this Academic Subject?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                This action is not reversible.
              </Alert>
            </>
          }
          handleClose={() => setOpenDeleteAcademicSubjectDialog(false)}
          deleteFunc={async () => {
            deleteAcademicSubjectMutation(editSubjectData.id);
          }}
          onSuccess={() => {
            setOpenDeleteAcademicSubjectDialog(false);
            setEditSubjectData(null);
          }}
          handleReject={() => {
            setOpenDeleteAcademicSubjectDialog(false);
            setEditSubjectData(null);
          }}
        />
      )}
    </Stack>
  );
}

export default SchoolSettings;
