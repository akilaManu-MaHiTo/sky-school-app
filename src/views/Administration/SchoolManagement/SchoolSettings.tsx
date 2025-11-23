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
  Organization,
} from "../../../api/OrganizationSettings/organizationSettingsApi";
import PageTitle from "../../../components/PageTitle";
import Breadcrumb from "../../../components/BreadCrumb";
import { useQuery } from "@tanstack/react-query";
import CustomButton from "../../../components/CustomButton";
import AddIcon from "@mui/icons-material/Add";
import { AddOrEditAcademicGrade } from "./AddOrEditAcademicGrade";
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
    queryKey: ["grade-data"],
    queryFn: getGradesData,
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
                  <LocalShippingIcon fontSize="small" />
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
                  <ReceiptLongIcon fontSize="small" />
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
                  <ApartmentIcon fontSize="small" />
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
                  <DeleteIcon fontSize="small" />
                  <Typography variant="body2" sx={{ ml: "0.3rem" }}>
                    Academic Classes
                  </Typography>
                </Box>
              }
              {...a11yProps(4)}
            />
          </Tabs>
        </AppBar>
        <TabPanel value={activeTab} index={0} dir={theme.direction}></TabPanel>
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
                        <TableCell align="center">{row.grade}</TableCell>
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
    </Stack>
  );
}

export default SchoolSettings;
