import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  LinearProgress,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import queryClient from "../../../state/queryClient";
import {
  deleteStudentNotification,
  fetchStudentNotifications,
  StudentNotification,
} from "../../../api/notificationApi";
import AddOrEditNotificationDialog from "./AddOrEditNotificationDialog";
import PageTitle from "../../../components/PageTitle";
import Breadcrumb from "../../../components/BreadCrumb";
import theme from "../../../theme";
import CustomButton from "../../../components/CustomButton";
import { Controller, useForm } from "react-hook-form";
import useIsMobile from "../../../customHooks/useIsMobile";
import {
  getClassesData,
  getGradesData,
  AcademicClass,
  AcademicGrade,
} from "../../../api/OrganizationSettings/academicGradeApi";
import { getYearsData } from "../../../api/OrganizationSettings/organizationSettingsApi";
import useCurrentUserHaveAccess from "../../../hooks/useCurrentUserHaveAccess";
import { PermissionKeys } from "../../Administration/SectionList";

type NotificationFilters = {
  year: { year: string } | null;
  grade: AcademicGrade | null;
  academicClass: AcademicClass | null;
};

const StudentNotificationsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<StudentNotification | null>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);

  const { control, reset, watch, setValue } = useForm<NotificationFilters>({
    defaultValues: {
      year: null,
      grade: null,
      academicClass: null,
    },
  });

  const selectedYear = watch("year");
  const selectedGrade = watch("grade");
  const selectedClass = watch("academicClass");

  const { isMobile, isTablet } = useIsMobile();

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Academics" },
    { title: "Student Notifications" },
  ];

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

  const filteredClasses = useMemo(() => {
    if (!selectedGrade) {
      return classData ?? [];
    }
    return (classData ?? []).filter(
      (item: AcademicClass) => item.gradeId === selectedGrade.id,
    );
  }, [classData, selectedGrade]);

  const gradeMap = useMemo(() => {
    const map = new Map<number, AcademicGrade>();
    (gradeData ?? []).forEach((grade: AcademicGrade) => {
      map.set(grade.id, grade);
    });
    return map;
  }, [gradeData]);

  const classMap = useMemo(() => {
    const map = new Map<number, AcademicClass>();
    (classData ?? []).forEach((cls: AcademicClass) => {
      map.set(cls.id, cls);
    });
    return map;
  }, [classData]);

  const {
    data: notifications,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["student-notifications"],
    queryFn: () => fetchStudentNotifications(),
  });

  const rows = Array.isArray(notifications) ? notifications : [];

  const handleAdd = () => {
    setSelectedNotification(null);
    setDialogOpen(true);
  };

  const handleEdit = (notification: StudentNotification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
  };

  const handleDelete = (id: string | number) => {
    setDeleteId(id);
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
  };

  const { mutateAsync: deleteMutationAsync, isPending: isDeleting } =
    useMutation({
      mutationFn: deleteStudentNotification,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
        enqueueSnackbar("Notification deleted successfully", {
          variant: "success",
        });
      },
      onError: (error: any) => {
        const message =
          error?.data?.message || error?.message || "Failed to delete";
        enqueueSnackbar(message, { variant: "error" });
      },
    });

  const canCreate = useCurrentUserHaveAccess(
    PermissionKeys.ADD_STUDENT_NOTIFICATIONS_CREATE,
  );
  const canEdit = useCurrentUserHaveAccess(
    PermissionKeys.ADD_STUDENT_NOTIFICATIONS_EDIT,
  );
  const canDelete = useCurrentUserHaveAccess(
    PermissionKeys.ADD_STUDENT_NOTIFICATIONS_DELETE,
  );

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
        <PageTitle title="Student Notifications" />
        <Breadcrumb breadcrumbs={breadcrumbItems} />
      </Box>

      <Accordion expanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{
            borderBottom: "1px solid var(--pallet-lighter-grey)",
          }}
        >
          <Typography variant="subtitle2">Notification Filters</Typography>
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
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    value={field.value ?? null}
                    onChange={(e, newVal) => {
                      field.onChange(newVal);
                    }}
                    size="small"
                    options={yearData ?? []}
                    loading={isYearDataFetching}
                    getOptionLabel={(option) => option.year}
                    isOptionEqualToValue={(option, value) =>
                      option.year === value.year
                    }
                    sx={{ flex: 1, margin: "0.5rem" }}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Year" name="year" />
                    )}
                  />
                )}
              />
              <Controller
                name="grade"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    value={field.value ?? null}
                    onChange={(e, newVal) => {
                      field.onChange(newVal);
                      setValue("academicClass", null, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    size="small"
                    options={gradeData ?? []}
                    loading={isGradeDataFetching}
                    getOptionLabel={(option) => `Grade ${option.grade}`}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    sx={{ flex: 1, margin: "0.5rem" }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Grade"
                        name="grade"
                      />
                    )}
                  />
                )}
              />
              <Controller
                name="academicClass"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    value={field.value ?? null}
                    onChange={(e, newVal) => {
                      field.onChange(newVal);
                    }}
                    size="small"
                    options={filteredClasses}
                    loading={isClassDataFetching}
                    getOptionLabel={(option) => option.className}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    sx={{ flex: 1, margin: "0.5rem" }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Class"
                        name="academicClass"
                      />
                    )}
                  />
                )}
              />
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

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: theme.spacing(2),
        }}
      >
        <CustomButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{
            mt: 2,
            backgroundColor: "var(--pallet-blue)",
          }}
          disabled={!canCreate}
        >
          Add Notification
        </CustomButton>
      </Box>

      {isFetching && <LinearProgress sx={{ width: "100%" }} />}

      {rows.length === 0 && !isFetching && (
        <Alert severity="info" sx={{ marginTop: theme.spacing(2) }}>
          No notifications found.
        </Alert>
      )}

      {rows.length > 0 && (
        <TableContainer component={Paper}>
          <Table aria-label="student notifications table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Class</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const grade = gradeMap.get(row.gradeId);
                const academicClass = classMap.get(row.classId);
                return (
                  <TableRow key={String(row.id)} hover>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>{row.year}</TableCell>
                    <TableCell>
                      {grade?.grade ? `Grade ${grade.grade}` : "--"}
                    </TableCell>
                    <TableCell>{academicClass?.className ?? "--"}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleEdit(row)}
                        disabled={!canEdit}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(row.id)}
                        disabled={!canDelete}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {dialogOpen && (
        <AddOrEditNotificationDialog
          open={dialogOpen}
          setOpen={setDialogOpen}
          defaultValues={selectedNotification}
        />
      )}

      {deleteId != null && (
        <DeleteConfirmationModal
          open={deleteId != null}
          title="Delete Notification"
          content="Are you sure you want to delete this notification?"
          handleClose={closeDeleteModal}
          handleReject={closeDeleteModal}
          deleteFunc={() => deleteMutationAsync(deleteId)}
          deleteButtonDisabled={isDeleting}
          onSuccess={() => refetch()}
        />
      )}
    </Stack>
  );
};

export default StudentNotificationsPage;
