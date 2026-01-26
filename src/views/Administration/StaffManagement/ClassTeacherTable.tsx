import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  TableFooter,
  TablePagination,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useSnackbar } from "notistack";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ClassTeacher,
  fetchClassTeacherData,
  deleteClassTeacher,
} from "../../../api/classTeacherApi";
import PageTitle from "../../../components/PageTitle";
import Breadcrumb from "../../../components/BreadCrumb";
import theme from "../../../theme";
import ViewDataDrawer, {
  DrawerHeader,
} from "../../../components/ViewDataDrawer";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import AddOrEditClassTeacher from "./AddOrEditClassTeacher";
import queryClient from "../../../state/queryClient";
import { getYearsData } from "../../../api/OrganizationSettings/organizationSettingsApi";
import { getClassesData, getGradesData } from "../../../api/OrganizationSettings/academicGradeApi";
import { Controller, useForm } from "react-hook-form";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useCurrentOrganization from "../../../hooks/useCurrentOrganization";
import { exportClassTeacherDetailsToExcel } from "../../../reportsUtils/ClassTeacherDetailsExcel";
import { generateClassTeacherDetailsPdf } from "../../../reportsUtils/ClassTeacherDetailsPDF";

type ClassTeacherFilterForm = {
  year: { id: number; year: string } | null;
  grade: { id: number; grade: string } | null;
  class: { id: number; className: string; gradeId?: number } | null;
};


function ClassTeacherTable({
  isAssignedTasks,
}: {
  isAssignedTasks: boolean;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const { organization } = useCurrentOrganization();
  const [openViewDrawer, setOpenViewDrawer] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ClassTeacher | null>(null);
  const [openAddOrEditDialog, setOpenAddOrEditDialog] = useState(false);
  // const [chemicalRequests, setChemicalRequests] = useState<ChemicalRequest[]>(
  //   sampleChemicalRequestData
  // );
  const {
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClassTeacherFilterForm>({
    defaultValues: {
      year: null,
      grade: null,
      class: null,
    },
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: `Staff Management` },
    { title: `Add Class Teacher` },
  ];

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md"),
  );

  const isTablet = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("md"),
  );

  const { data: classTeachers, isFetching: isClassTeacherFetching } = useQuery({
    queryKey: ["class-teachers"],
    queryFn: fetchClassTeacherData,
  });

  const selectedYear = watch("year");
  const selectedGrade = watch("grade");
  const selectedClass = watch("class");

  const exportTitle = useMemo(() => {
    const segments: string[] = [];
    if (selectedYear?.year) {
      segments.push(`Year ${selectedYear.year}`);
    }
    if (selectedGrade?.grade) {
      segments.push(`Grade ${selectedGrade.grade}`);
    }
    if (selectedClass?.className) {
      segments.push(`Class ${selectedClass.className}`);
    }

    if (!segments.length) {
      return "Class Teacher Details";
    }

    return `Class Teacher Details (${segments.join(" / ")})`;
  }, [selectedYear, selectedGrade, selectedClass]);

  useEffect(() => {
    setPage(0);
  }, [selectedYear, selectedGrade, selectedClass]);

  const filteredClassTeachers = useMemo(() => {
    const rows: ClassTeacher[] = Array.isArray(classTeachers) ? classTeachers : [];

    return rows.filter((row) => {
      const matchYear = selectedYear?.year
        ? row?.year === selectedYear.year
        : true;

      const matchGrade = selectedGrade?.id
        ? row?.grade?.id === selectedGrade.id
        : true;

      const matchClass = selectedClass?.id
        ? row?.class?.id === selectedClass.id
        : true;

      return matchYear && matchGrade && matchClass;
    });
  }, [classTeachers, selectedYear, selectedGrade, selectedClass]);

  const paginatedClassTeachers = useMemo(() => {
    if (rowsPerPage === -1) return filteredClassTeachers;
    return filteredClassTeachers.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [filteredClassTeachers, page, rowsPerPage]);

  const hasExportData = filteredClassTeachers.length > 0;

  const { mutateAsync: deleteMutation } = useMutation({
    mutationFn: deleteClassTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-teachers"] });
      enqueueSnackbar("Class Teacher removed successfully", {
        variant: "success",
      });
      setDeleteDialogOpen(false);
      setOpenViewDrawer(false);
      setSelectedRow(null);
    },
    onError: (error: any) => {
      const message =
        error?.data?.message || error?.message || "Failed to remove class teacher.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const { data: yearData, isFetching: isYearDataFetching } = useQuery({
      queryKey: ["academic-years"],
      queryFn: getYearsData,
    });
    const { data: gradeData, isFetching: isGradeDataFetching } = useQuery({
      queryKey: ["academic-grades"],
      queryFn: getGradesData,
    });
    const { data: classData, isFetching: isClassDataFetching } = useQuery({
      queryKey: ["academic-classes"],
      queryFn: getClassesData,
    });

  const filteredClassOptions = useMemo(() => {
    const classes = Array.isArray(classData) ? classData : [];
    if (!selectedGrade?.id) return classes;
    return classes.filter((c) => (c?.gradeId ? c.gradeId === selectedGrade.id : true));
  }, [classData, selectedGrade]);

  useEffect(() => {
    if (!selectedClass?.id) return;
    if (!selectedGrade?.id) return;

    const classGradeId = selectedClass?.gradeId;
    if (classGradeId && classGradeId !== selectedGrade.id) {
      setValue("class", null);
    }
  }, [selectedClass, selectedGrade, setValue]);

  const handleExportExcel = () => {
    if (!hasExportData) {
      enqueueSnackbar("No class teacher data to export", { variant: "warning" });
      return;
    }

    try {
      exportClassTeacherDetailsToExcel(filteredClassTeachers, {
        title: exportTitle,
      });
    } catch (error) {
      console.error("Failed to export class teacher Excel:", error);
      enqueueSnackbar("Failed to export class teacher Excel", { variant: "error" });
    }
  };

  const handleExportPdf = () => {
    if (!hasExportData) {
      enqueueSnackbar("No class teacher data to export", { variant: "warning" });
      return;
    }

    try {
      generateClassTeacherDetailsPdf(filteredClassTeachers, {
        title: exportTitle,
        organizationName: organization?.organizationName,
      });
    } catch (error) {
      console.error("Failed to generate class teacher PDF:", error);
      enqueueSnackbar("Failed to generate class teacher PDF", { variant: "error" });
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
        <PageTitle title="Add Class Teacher" />
        <Breadcrumb breadcrumbs={breadcrumbItems} />
      </Box>
      <Accordion expanded={true}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{
                  borderBottom: "1px solid var(--pallet-lighter-grey)",
                }}
              >
                <Typography variant="subtitle2">Class Teacher Filters</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: "0.5rem",
                    gap: 2,
                  }}
                >
                  <Stack
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      flexWrap: "wrap",
                      flexDirection: isMobile || isTablet ? "column" : "row",
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
                      <Controller
                        name="year"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Autocomplete
                            {...field}
                            value={field.value ?? null}
                            onChange={(e, newVal) => {
                              field.onChange(newVal);
                            }}
                            size="small"
                            options={yearData ?? []}
                            getOptionLabel={(option) => option.year}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            sx={{ flex: 1 }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                required
                                error={!!errors.year}
                                helperText={errors.year && "Required"}
                                label="Select Year"
                                name="year"
                              />
                            )}
                          />
                        )}
                      />
                    </Box>
      
                    <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
                      <Controller
                        name="grade"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Autocomplete
                            {...field}
                            value={field.value ?? null}
                            onChange={(e, newVal) => {
                              field.onChange(newVal);
                            }}
                            size="small"
                            options={gradeData ?? []}
                            getOptionLabel={(option) => `Grade ` + option.grade}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            sx={{ flex: 1 }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                required
                                error={!!errors.grade}
                                helperText={errors.grade && "Required"}
                                label="Select Grade"
                                name="grade"
                              />
                            )}
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
                      <Controller
                        name="class"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Autocomplete
                            {...field}
                            value={field.value ?? null}
                            onChange={(e, newVal) => {
                              field.onChange(newVal);
                            }}
                            size="small"
                            options={filteredClassOptions}
                            getOptionLabel={(option) => option.className}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            sx={{ flex: 1 }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                required
                                error={!!errors.class}
                                helperText={errors.class && "Required"}
                                label="Select Class"
                                name="class"
                              />
                            )}
                          />
                        )}
                      />
                    </Box>
                  </Stack>
                </Stack>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "0.5rem",
                    marginX: "0.5rem",
                  }}
                >
                  
                  <Button
                    onClick={() => {
                      reset();
                    }}
                    sx={{ color: "var(--pallet-blue)", marginRight: "0.5rem" }}
                  >
                    Reset
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
      <Stack sx={{ alignItems: "center" }}>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            overflowX: "auto",
            maxWidth: isMobile ? "88vw" : "100%",
          }}
        >
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={1}
            sx={{
              padding: theme.spacing(2),
              justifyContent: isMobile ? "flex-start" : "space-between",
              alignItems: isMobile ? "stretch" : "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              sx={{ backgroundColor: "var(--pallet-blue)" }}
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedRow(null);
                setOpenAddOrEditDialog(true);
              }}
            >
              Add Class Teacher
            </Button>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                width: isMobile ? "100%" : "auto",
                justifyContent: isMobile ? "flex-start" : "flex-end",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon fontSize="small" />}
                onClick={handleExportExcel}
                disabled={!hasExportData}
              >
                Export Excel
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PictureAsPdfIcon fontSize="small" />}
                onClick={handleExportPdf}
                disabled={!hasExportData}
              >
                Export PDF
              </Button>
            </Stack>
          </Stack>
          {isClassTeacherFetching && <LinearProgress sx={{ width: "100%" }} />}
          <Table aria-label="simple table">
            <TableHead sx={{ backgroundColor: "#f3f3f3ff" }}>
              <TableRow>
                <TableCell align="right">Year</TableCell>
                <TableCell align="right">Grade</TableCell>
                <TableCell align="right">Class</TableCell>
                <TableCell align="right">Class Teacher</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedClassTeachers?.length > 0 ? (
                paginatedClassTeachers.map((row) => (
                  <TableRow
                    key={`${row.id}`}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSelectedRow(row);
                      setOpenViewDrawer(true);
                    }}
                  >
                    <TableCell align="right">
                      {row?.year ?? "--"}
                    </TableCell>
                    <TableCell align="right">
                      {row?.grade ? `Grade ${row.grade.grade}` : "--"}
                    </TableCell>
                    <TableCell align="right">
                      {row?.class?.className ?? "--"}
                    </TableCell>
                    <TableCell align="right">
                      {row?.teacher?.nameWithInitials ?? "--"}
                    </TableCell>
                    <TableCell
                      align="right"
                      onClick={(e) => {
                        // Prevent row click when clicking action buttons
                        e.stopPropagation();
                      }}
                    >
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedRow(row);
                            setOpenAddOrEditDialog(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            setSelectedRow(row);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Typography variant="body2">
                      No Class Teachers Found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={100}
                  count={filteredClassTeachers?.length ?? 0}
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
      <ViewDataDrawer
        open={openViewDrawer}
        fullScreen={true}
        handleClose={() => setOpenViewDrawer(false)}
        drawerContent={
          <Stack spacing={1} sx={{ paddingX: theme.spacing(1) }}>
            <DrawerHeader
              title="Class Teacher Details"
              handleClose={() => setOpenViewDrawer(false)}
              onEdit={() => {
                setSelectedRow(selectedRow);
                setOpenAddOrEditDialog(true);
              }}
              //   disableEdit={
              //     selectedRow?.status !== ChemicalRequestStatus.DRAFT ||
              //     (isAssignedTasks ? isAssignedEditDisabled : isEditDisabled)
              //   }
              onDelete={() => setDeleteDialogOpen(true)}
              //   disableDelete={
              //     isAssignedTasks ? isAssignedDeleteDisabled : isDeleteDisabled
              //   }
            />
          </Stack>
        }
      />
      {openAddOrEditDialog && (
        <AddOrEditClassTeacher
          open={openAddOrEditDialog}
          setOpen={() => {
            setSelectedRow(null);
            setOpenViewDrawer(false);
            setOpenAddOrEditDialog(false);
          }}
          defaultValues={selectedRow}
        />
      )}
      {deleteDialogOpen && (
        <DeleteConfirmationModal
          open={deleteDialogOpen}
          title="Remove Class Teacher Confirmation"
          content={
            <>
              Are you sure you want to remove this class teacher?
              <Alert severity="warning" style={{ marginTop: "1rem" }}>
                This action is not reversible.
              </Alert>
            </>
          }
          handleClose={() => setDeleteDialogOpen(false)}
          deleteFunc={async () => {
            if (selectedRow?.id) {
              await deleteMutation(selectedRow.id);
            }
          }}
          onSuccess={() => {}}
          handleReject={() => {}}
        />
      )}
    </Stack>
  );
}

export default ClassTeacherTable;
