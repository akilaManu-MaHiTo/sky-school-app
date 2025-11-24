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
import { useState } from "react";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ApartmentIcon from "@mui/icons-material/Apartment";
import DeleteIcon from "@mui/icons-material/Delete";
import useIsMobile from "../../../customHooks/useIsMobile";
import theme from "../../../theme";
import EditIcon from "@mui/icons-material/Edit";
import {
  getGradesData,
  getOrganization,
  Organization,
} from "../../../api/OrganizationSettings/organizationSettingsApi";
import PageTitle from "../../../components/PageTitle";
import Breadcrumb from "../../../components/BreadCrumb";
import { useQuery } from "@tanstack/react-query";
import CustomButton from "../../../components/CustomButton";
import AddIcon from "@mui/icons-material/Add";
import { AddOrEditAcademicGrade } from "./AddOrEditAcademicGrade";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Filter1Icon from "@mui/icons-material/Filter1";
import SubjectIcon from "@mui/icons-material/Subject";
import ClassIcon from "@mui/icons-material/Class";
import { DrawerContentItem } from "../../../components/ViewDataDrawer";
import { hasSignedUrl } from "./schoolUtils";
import EditOrganizationDialog from "./AddOrEditSchoolDialog";
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
  const [openAcademicGradeDialog, setOpenAcademicGradeDialog] = useState(false);
  const [openEditOrganizationDialog, setOpenEditOrganizationDialog] =
    useState(false);
  const [editGradeData, setEditGradeData] = useState(null);
  const { isTablet, isMobile } = useIsMobile();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "School Settings" },
  ];
  const { data: gradeData, isFetching: isGradeDataFetching } = useQuery({
    queryKey: ["academic-grades"],
    queryFn: getGradesData,
  });
  const { data: organizationData } = useQuery({
    queryKey: ["organization"],
    queryFn: getOrganization,
  });
  const logo = Array.isArray(organizationData?.logoUrl)
    ? organizationData?.logoUrl[0]
    : organizationData?.logoUrl;
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
        <TabPanel value={activeTab} index={1} dir={theme.direction}></TabPanel>
        <TabPanel value={activeTab} index={2} dir={theme.direction}>
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
              {isGradeDataFetching && <LinearProgress sx={{ width: "100%" }} />}
              <Table aria-label="simple table">
                <TableHead
                  sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}
                >
                  <TableRow>
                    <TableCell align="center">Id</TableCell>
                    <TableCell align="center">Grade</TableCell>
                    <TableCell align="center"></TableCell>
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
                        <TableCell align="center">{row.id}</TableCell>
                        <TableCell align="center">
                          <Chip variant="filled" label={row.grade} sx={{backgroundColor: "var(--pallet-lighter-blue)"}}/>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => {
                              setEditGradeData(row);
                              setOpenAcademicGradeDialog(true);
                            }}
                          >
                            <EditIcon color="primary" />
                          </IconButton>

                          <IconButton>
                            <DeleteIcon color="error" />
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
              </Table>
            </TableContainer>
          </Stack>
        </TabPanel>
        <TabPanel value={activeTab} index={3} dir={theme.direction}></TabPanel>
        <TabPanel value={activeTab} index={4} dir={theme.direction}></TabPanel>
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
    </Stack>
  );
}

export default SchoolSettings;
