import {
  Dialog,
  DialogTitle,
  Typography,
  IconButton,
  Divider,
  DialogContent,
  Box,
  TextField,
  DialogActions,
  Button,
  CircularProgress,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { grey } from "@mui/material/colors";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CustomButton from "../../../components/CustomButton";
import useIsMobile from "../../../customHooks/useIsMobile";
import queryClient from "../../../state/queryClient";
import {
  AcademicDetail,
  AcademicMedium,
  createAcademicDetail,
  createAcademicStudentDetail,
  updateAcademicDetail,
  updateAcademicStudentDetail,
  updateAcademicStudentDetailsByAdmin,
} from "../../../api/OrganizationSettings/academicDetailsApi";
import {
  getAllSubjectData,
  getGradesData,
  getYearsData,
} from "../../../api/OrganizationSettings/organizationSettingsApi";
import { getClassesData } from "../../../api/OrganizationSettings/academicGradeApi";
import SearchBox from "../../../components/SearchBox";
import { searchStudentByEmployeeId } from "../../../api/userApi";
import StudentAddConfirmationModal from "../../../components/StudentAddConfirmationModal";
import {
  createParentProfile,
  createParentProfileByAdmin,
} from "../../../api/parentApi";

const AddOrEditChildrenDetailsDialogByAdmin = ({
  open,
  setOpen,
  defaultValues,
  parentId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: any;
  parentId: number;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { isMobile } = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [openAddStudentModal, setOpenAddStudentModal] = useState(false);

  console.log("id", parentId);

  const {
    data: searchedStudents,
    refetch: refetchStudents,
    isFetching: isSearchingStudents,
  } = useQuery({
    queryKey: ["student-search", searchQuery],
    queryFn: ({ queryKey }) => searchStudentByEmployeeId(queryKey[1] as string),
    enabled: false,
  });
  const studentsArray = searchedStudents ? [searchedStudents] : [];

  const { mutate: addParentProfile, isPending: isAddingParent } = useMutation({
    mutationFn: (studentId: number) =>
      createParentProfileByAdmin({ studentId: studentId, parentId: parentId }),
    onSuccess: () => {
      enqueueSnackbar("Student added successfully!", { variant: "success" });
      setOpenAddStudentModal(false);
      setOpen(false);
      setSelectedStudent(null);
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
    },
    onError: (error: any) => {
      const message =
        error?.data?.message || error?.message || "Failed to add student.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const {
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    register,
    control,
  } = useForm<AcademicDetail>({
    defaultValues: defaultValues,
  });

  const isEdit = Boolean(defaultValues?.id);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createAcademicStudentDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      enqueueSnackbar("Child Details Add successfully!", {
        variant: "success",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to Add Child Details.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateAcademicStudentDetailsByAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      enqueueSnackbar("Child Details updated successfully!", {
        variant: "success",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to update Child detail.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleSubmitDetails = (data: AcademicDetail) => {
    if (isEdit && defaultValues?.id) {
      updateMutation(data);
      return;
    }

    // createMutation(data);
  };
  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
        reset();
      }}
      fullScreen={isMobile}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: { backgroundColor: grey[50] },
        component: "form",
      }}
    >
      <DialogTitle
        sx={{
          paddingY: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" component="div">
          {isEdit ? "Edit Academic Detail" : "Add New Child Detail"}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={() => setOpen(false)}
          edge="start"
          sx={{ color: "#024271" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <SearchBox
            placeholder="Search by Student Admission Number"
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={async () => {
              if (!searchQuery) return;
              try {
                await refetchStudents();
              } catch (error) {
                console.error("Student search failed", error);
              }
            }}
            isSearching={isSearchingStudents}
          />
          {studentsArray.length > 0 && (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead
                  sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}
                >
                  <TableRow>
                    <TableCell>Admission No</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {studentsArray.map((student: any) => (
                    <TableRow key={student.id} hover>
                      <TableCell>{student.employeeNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.userName}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setSelectedStudent(student);
                            setOpenAddStudentModal(true);
                          }}
                        >
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>
      <StudentAddConfirmationModal
        open={openAddStudentModal}
        onClose={() => {
          if (isAddingParent) return;
          setOpenAddStudentModal(false);
          setSelectedStudent(null);
        }}
        onConfirm={() => {
          if (!selectedStudent) return;
          addParentProfile(selectedStudent.id);
        }}
        isLoading={isAddingParent}
        studentName={selectedStudent?.name}
        studentAdmissionNumber={selectedStudent?.employeeNumber}
      />
      <DialogActions sx={{ padding: "1rem" }}>
        <Button
          onClick={() => setOpen(false)}
          sx={{ color: "var(--pallet-blue)" }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrEditChildrenDetailsDialogByAdmin;
