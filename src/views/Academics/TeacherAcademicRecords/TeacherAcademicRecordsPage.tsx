import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  IconButton,
  Stack,
  LinearProgress,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Controller, useForm } from "react-hook-form";
import { addDays, addMonths, format, subDays, subMonths } from "date-fns";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import queryClient from "../../../state/queryClient";
import {
  deleteTeacherAcademicWork,
  fetchTeacherAcademicWorksByDate,
  TeacherAcademicWork,
} from "../../../api/teacherAcademicWorksApi";
import AddOrEditTeacherAcademicRecordsDialog from "./AddOrEditTeacherAcademicRecordsDialog";
import PageTitle from "../../../components/PageTitle";
import Breadcrumb from "../../../components/BreadCrumb";
import theme from "../../../theme";
import CustomButton from "../../../components/CustomButton";
import useIsMobile from "../../../customHooks/useIsMobile";
import useCurrentUserHaveAccess from "../../../hooks/useCurrentUserHaveAccess";
import { PermissionKeys } from "../../Administration/SectionList";
import DatePickerComponent from "../../../components/DatePickerComponent";
import { fetchTeacherData } from "../../../api/classTeacherApi";
import { getAllSubjectData } from "../../../api/OrganizationSettings/organizationSettingsApi";
import { AcademicSubject } from "../../../api/OrganizationSettings/academicGradeApi";
import { User } from "../../../api/userApi";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";

type AcademicWorkFilters = {
  date: Date | null;
};

const TeacherAcademicRecordsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<TeacherAcademicWork | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | number | null>(null);

  const { control, reset, watch, setValue } = useForm<AcademicWorkFilters>({
    defaultValues: {
      date: new Date(),
    },
  });

  const selectedDate = watch("date");
  const formattedDate = useMemo(() => {
    if (!selectedDate) {
      return null;
    }
    return format(selectedDate, "yyyy-MM-dd");
  }, [selectedDate]);

  const { isMobile } = useIsMobile();

  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Academics" },
    { title: "Teacher Academic Records" },
  ];

  const { data: teacherData } = useQuery({
    queryKey: ["teacher-users"],
    queryFn: fetchTeacherData,
  });

  const { data: subjectData } = useQuery({
    queryKey: ["subject-data"],
    queryFn: getAllSubjectData,
  });

  const {
    data: academicWorks,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["teacher-academic-works-by-date", formattedDate],
    queryFn: () => fetchTeacherAcademicWorksByDate(formattedDate ?? ""),
    enabled: !!formattedDate,
  });

  const teacherMap = useMemo(() => {
    const map = new Map<number, User>();
    (teacherData ?? []).forEach((teacher: User) => {
      map.set(teacher.id, teacher);
    });
    return map;
  }, [teacherData]);

  const subjectMap = useMemo(() => {
    const map = new Map<number, AcademicSubject>();
    (subjectData ?? []).forEach((subject: AcademicSubject) => {
      map.set(subject.id, subject);
    });
    return map;
  }, [subjectData]);

  const rows = Array.isArray(academicWorks) ? academicWorks : [];
  const showTable = !!formattedDate;

  const handleMoveDate = (direction: "prev" | "next") => {
    if (!selectedDate) return;
    const nextDate =
      direction === "next"
        ? addDays(selectedDate, 1)
        : subDays(selectedDate, 1);
    setValue("date", nextDate, { shouldDirty: true });
  };

  const handleMoveMonth = (direction: "prev" | "next") => {
    if (!selectedDate) return;
    const nextDate =
      direction === "next"
        ? addMonths(selectedDate, 1)
        : subMonths(selectedDate, 1);
    setValue("date", nextDate, { shouldDirty: true });
  };

  const handleAdd = () => {
    setSelectedWork(null);
    setDialogOpen(true);
  };

  const handleEdit = (work: TeacherAcademicWork) => {
    setSelectedWork(work);
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
      mutationFn: deleteTeacherAcademicWork,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["teacher-academic-works-by-date"],
        });
        enqueueSnackbar("Academic work deleted successfully", {
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
    PermissionKeys.TEACHER_ACADEMIC_RECORDS_CREATE,
  );
  const canEdit = useCurrentUserHaveAccess(
    PermissionKeys.TEACHER_ACADEMIC_RECORDS_EDIT,
  );
  const canDelete = useCurrentUserHaveAccess(
    PermissionKeys.TEACHER_ACADEMIC_RECORDS_DELETE,
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
        <PageTitle title="Teacher Academic Records" />
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
          <Typography variant="subtitle2">Record Filters</Typography>
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
            <Box sx={{ margin: "0.5rem" }}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DatePickerComponent
                    onChange={(value) => field.onChange(value)}
                    value={field.value ?? null}
                    label="Select Date"
                  />
                )}
              />
            </Box>
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
                reset({ date: new Date() });
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
          justifyContent: isMobile ? "center" : "flex-end",
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
          Add Academic Work
        </CustomButton>
      </Box>

      {isFetching && <LinearProgress sx={{ width: "100%" }} />}

      {showTable && (
        <TableContainer
          component={Paper}
          sx={{
            overflowX: "auto",
            maxWidth: isMobile ? "65vw" : "100%",
          }}
        >
          <Table aria-label="teacher academic records table">
            <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
              <TableRow>
                <TableCell>Teacher</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Academic Work</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell align="center">Actions</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => {
                  const teacher =
                    row.teacher ?? teacherMap.get(row.teacherId) ?? null;
                  const subject =
                    row.subject ?? subjectMap.get(row.subjectId) ?? null;

                  return (
                    <TableRow key={String(row.id)} hover>
                      <TableCell>
                        {teacher?.nameWithInitials ??
                          teacher?.name ??
                          teacher?.userName ??
                          "--"}
                      </TableCell>
                      <TableCell>
                        {subject
                          ? `${subject.subjectName} - ${subject.subjectMedium} Medium`
                          : "--"}
                      </TableCell>
                      <TableCell>{row.title}</TableCell>
                      <TableCell>{row.academicWork}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        {row.time
                          ? format(
                              typeof row.time === "string"
                                ? new Date(row.time)
                                : row.time,
                              "hh:mm a",
                            )
                          : "--"}
                      </TableCell>
                      <TableCell align="center">
                        {!row.approved && (
                          <IconButton
                            onClick={() => handleEdit(row)}
                            disabled={!canEdit}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {!row.approved && (
                          <IconButton
                            onClick={() => handleDelete(row.id)}
                            disabled={!canDelete}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          variant="outlined"
                          color={
                            row?.isApproved || row?.approved
                              ? "success"
                              : "warning"
                          }
                          label={
                            row?.isApproved || row?.approved
                              ? "Approved"
                              : "Pending"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2">
                      {isFetching
                        ? ""
                        : "No academic works found for the selected date."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Box
            sx={{
              p: 0.2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ alignContent: "center", ml: 1 }}>
              <Typography variant="subtitle2" color="var(--pallet-blue)">
                {`${format(selectedDate ?? new Date(), "MMMM dd, yyyy")}`}
              </Typography>
            </Box>
            <Box>
              <IconButton
                onClick={() => handleMoveMonth("prev")}
                disabled={!selectedDate}
              >
                <KeyboardDoubleArrowRightIcon
                  fontSize="small"
                  sx={{
                    transform: "rotate(180deg)",
                    color: "var(--pallet-blue)",
                  }}
                />
              </IconButton>
              <IconButton
                onClick={() => handleMoveDate("prev")}
                disabled={!selectedDate}
              >
                <NavigateNextIcon
                  fontSize="small"
                  sx={{
                    transform: "rotate(180deg)",
                    color: "var(--pallet-blue)",
                  }}
                />
              </IconButton>
              <IconButton
                onClick={() => handleMoveDate("next")}
                disabled={!selectedDate}
              >
                <NavigateNextIcon
                  fontSize="small"
                  sx={{ color: "var(--pallet-blue)" }}
                />
              </IconButton>
              <IconButton
                onClick={() => handleMoveMonth("next")}
                disabled={!selectedDate}
              >
                <KeyboardDoubleArrowRightIcon
                  fontSize="small"
                  sx={{ color: "var(--pallet-blue)" }}
                />
              </IconButton>
            </Box>
          </Box>
        </TableContainer>
      )}

      {dialogOpen && (
        <AddOrEditTeacherAcademicRecordsDialog
          open={dialogOpen}
          setOpen={setDialogOpen}
          defaultValues={selectedWork}
        />
      )}

      {deleteId != null && (
        <DeleteConfirmationModal
          open={deleteId != null}
          title="Delete Academic Work"
          content="Are you sure you want to delete this academic work?"
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

export default TeacherAcademicRecordsPage;
