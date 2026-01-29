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
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import DeleteConfirmationModal from "../../../../components/DeleteConfirmationModal";
import queryClient from "../../../../state/queryClient";
import {
  deleteStudentServiceCharge,
  fetchStudentServiceCharges,
} from "../../../../api/studentServiceChargesApi";
import AddOrEditStudentServiceChargesDialog from "./AddOrEditStudentServiceChargesDialog";
import PageTitle from "../../../../components/PageTitle";
import Breadcrumb from "../../../../components/BreadCrumb";
import theme from "../../../../theme";
import CustomButton from "../../../../components/CustomButton";
import AddIcon from "@mui/icons-material/Add";
import { format } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import useIsMobile from "../../../../customHooks/useIsMobile";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchStudentData } from "../../../../api/userApi";
import CheckStudentServiceCharges from "./CheckStudentServiceCharges";

const StudentServiceChargesTable = () => {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm();
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Administration" },
    { title: "Student Management" },
    { title: "Student Service Charges" },
  ];
  const { isMobile, isTablet } = useIsMobile();
  const selectStudent = watch("student");
  const studentId = selectStudent?.id;

  const {
    data: charges,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["student-service-charges", studentId],
    queryFn: () => fetchStudentServiceCharges(studentId),
    enabled: !!studentId,
  });
  const { data: students, isFetching: isStudentsFetching } = useQuery({
    queryKey: ["student-users"],
    queryFn: fetchStudentData,
  });

  const handleAdd = () => {
    setSelectedCharge(null);
    setDialogOpen(true);
  };

  const handleEdit = (charge: any) => {
    setSelectedCharge(charge);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
  };

  const rows = Array.isArray(charges) ? charges : [];

  const groupedChargesByYear = useMemo(() => {
    const groups: Record<string, any[]> = {};

    rows.forEach((charge: any) => {
      const yearFromField = charge.yearForCharge;
      const date =
        !yearFromField && charge.dateCharged
          ? new Date(charge.dateCharged)
          : null;
      const year = yearFromField
        ? String(yearFromField)
        : date && !isNaN(date.getTime())
          ? `${date.getFullYear()}`
          : "Unknown";

      if (!groups[year]) {
        groups[year] = [];
      }

      groups[year].push(charge);
    });

    return groups;
  }, [rows]);

  const groupedYears = useMemo(
    () =>
      Object.keys(groupedChargesByYear).sort((a, b) => {
        const numA = Number(a);
        const numB = Number(b);

        const aIsNaN = isNaN(numA);
        const bIsNaN = isNaN(numB);

        if (aIsNaN && bIsNaN) return a.localeCompare(b);
        if (aIsNaN) return 1; // put non-numeric (e.g., "Unknown") at the end
        if (bIsNaN) return -1;
        return numB - numA; // newest year first
      }),
    [groupedChargesByYear],
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
        <PageTitle title="Student Service Charges" />
        <Breadcrumb breadcrumbs={breadcrumbItems} />
      </Box>
      <CheckStudentServiceCharges />
      <Accordion expanded={true}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{
            borderBottom: "1px solid var(--pallet-lighter-grey)",
          }}
        >
          <Typography variant="subtitle2">Student Filters</Typography>
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
                  name="student"
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
                      options={students ?? []}
                      getOptionLabel={(option) => option.nameWithInitials || ""}
                      sx={{ flex: 1 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.student}
                          helperText={errors.student && "Required"}
                          label="Select Student"
                          name="student"
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
        >
          Add Service Charges
        </CustomButton>
      </Box>
      {isFetching && <LinearProgress sx={{ width: "100%" }} />}

      {!studentId && (
        <Alert severity="info" sx={{ marginTop: theme.spacing(4) }}>
          Please select a student to view service charges.
        </Alert>
      )}

      {groupedYears.map((year) => (
        <Accordion key={year} defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`year-${year}-content`}
            id={`year-${year}-header`}
          >
            <Typography variant="subtitle2">{year}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableHead
                  sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}
                >
                  <TableRow>
                    <TableCell>Student Admission Number</TableCell>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Charges Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Date Charged</TableCell>
                    <TableCell>Remarks</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedChargesByYear[year]?.map((row: any) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        {row.student?.employeeNumber ?? "--"}
                      </TableCell>
                      <TableCell>
                        {row.student?.nameWithInitials ?? "--"}
                      </TableCell>
                      <TableCell>{row.chargesCategory}</TableCell>
                      <TableCell align="right">{row.amount}</TableCell>
                      <TableCell>
                        {row.yearForCharge
                          ? row.yearForCharge
                          : row.dateCharged
                            ? format(new Date(row.dateCharged), "yyyy-MM-dd")
                            : "--"}
                      </TableCell>
                      <TableCell>{row.remarks}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          aria-label="edit"
                          size="small"
                          onClick={() => handleEdit(row)}
                        >
                          <EditIcon fontSize="small" color="primary" />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          size="small"
                          onClick={() => handleDelete(String(row.id))}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      <AddOrEditStudentServiceChargesDialog
        open={dialogOpen}
        setOpen={(open) => {
          setDialogOpen(open);
          if (!open) {
            setSelectedCharge(null);
          }
        }}
        defaultValues={selectedCharge}
      />

      <DeleteConfirmationModal
        open={Boolean(deleteId)}
        title="Delete Student Service Charge"
        content="Are you sure you want to delete this student service charge?"
        handleClose={closeDeleteModal}
        handleReject={closeDeleteModal}
        deleteFunc={async () => {
          if (!deleteId) return;
          await deleteStudentServiceCharge(deleteId);
          await queryClient.invalidateQueries({
            queryKey: ["student-service-charges"],
          });
          await queryClient.invalidateQueries({
            queryKey: ["checking-student-service-charges"],
          });
        }}
        onSuccess={() => {
          enqueueSnackbar("Student service charge deleted successfully!", {
            variant: "success",
          });
          refetch();
        }}
      />
    </Stack>
  );
};

export default StudentServiceChargesTable;
