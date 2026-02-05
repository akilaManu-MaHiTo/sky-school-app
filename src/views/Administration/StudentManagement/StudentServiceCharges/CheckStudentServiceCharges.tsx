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
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import DeleteConfirmationModal from "../../../../components/DeleteConfirmationModal";
import queryClient from "../../../../state/queryClient";
import {
  chargeCategories,
  chargeFilterCategories,
  deleteStudentServiceCharge,
  fetchCheckingStudentServiceCharges,
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
import {
  getClassesData,
  getGradesData,
} from "../../../../api/OrganizationSettings/academicGradeApi";
import { getYearsData } from "../../../../api/OrganizationSettings/organizationSettingsApi";

const CheckStudentServiceCharges = () => {
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
  const selectedYear = watch("year");
  const selectedGrade = watch("grade");
  const selectedClass = watch("class");
  const selectedCategory = watch("category");

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
  const { data: checkChargesData, isFetching: isChargesDataFetching } =
    useQuery({
      queryKey: [
        "checking-student-service-charges",
        selectedYear,
        selectedGrade,
        selectedClass,
        selectedCategory,
      ],
      queryFn: () =>
        fetchCheckingStudentServiceCharges(
          selectedYear,
          selectedGrade,
          selectedClass,
          selectedCategory,
        ),
      enabled:
        !!selectedYear &&
        !!selectedGrade &&
        !!selectedClass &&
        !!selectedCategory,
    });

  console.log("checkChargesData", checkChargesData);

  const flattenedChargesRows = useMemo(() => {
    const dataArray = Array.isArray(checkChargesData) ? checkChargesData : [];

    const rows: any[] = [];

    dataArray.forEach((item: any) => {
      const studentRecord = item.student;
      const studentUser = studentRecord?.student;
      const grade = studentRecord?.grade?.grade;
      const className = studentRecord?.class?.className;
      const academicYear = studentRecord?.academicYear;

      const baseInfo = {
        studentName:
          studentUser?.nameWithInitials ||
          studentUser?.name ||
          studentUser?.userName ||
          "-",
        admissionNo: studentUser?.employeeNumber || "-",
        grade: grade || "-",
        className: className || "-",
        academicYear: academicYear || "-",
      };

      if (!item.charges || item.charges.length === 0) {
        rows.push({
          id: `${studentRecord?.id}-no-charge`,
          ...baseInfo,
          chargesCategory: "-",
          amount: "-",
          dateCharged: "-",
          remarks: "No charges available",
        });
        return;
      }

      item.charges.forEach((charge: any) => {
        rows.push({
          id: charge.id,
          ...baseInfo,
          chargesCategory: charge.chargesCategory,
          amount: charge.amount,
          dateCharged: charge.dateCharged
            ? format(new Date(charge.dateCharged), "yyyy-MM-dd")
            : "-",
          remarks: charge.remarks || "-",
        });
      });
    });

    return rows;
  }, [checkChargesData]);

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
                    sx={{ flex: 1, margin: "0.5rem" }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        error={!!errors.teacherYear}
                        helperText={errors.teacherYear && "Required"}
                        label="Select Year"
                        name="year"
                      />
                    )}
                  />
                )}
              />
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
                    sx={{ flex: 1, margin: "0.5rem" }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        error={!!errors.teacherYear}
                        helperText={errors.teacherYear && "Required"}
                        label="Select Grade"
                        name="grade"
                      />
                    )}
                  />
                )}
              />
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
                    options={classData ?? []}
                    getOptionLabel={(option) => option.className}
                    sx={{ flex: 1, margin: "0.5rem" }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        error={!!errors.teacherYear}
                        helperText={errors.teacherYear && "Required"}
                        label="Select Class"
                        name="class"
                      />
                    )}
                  />
                )}
              />
              <Controller
                name="category"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    value={field.value ?? null}
                    onChange={(e, newVal) => {
                      field.onChange(newVal);
                    }}
                    defaultValue={"All"}
                    size="small"
                    options={chargeFilterCategories}
                    sx={{ flex: 1, margin: "0.5rem" }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        error={!!errors.category}
                        defaultValue={"All"}
                        helperText={errors.category && "Required"}
                        label="Select Category"
                        name="category"
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
      <Box sx={{ marginTop: 2 }}>
        {isChargesDataFetching && <LinearProgress />}
        {!isChargesDataFetching &&
          !!selectedYear &&
          !!selectedGrade &&
          !!selectedClass &&
          !!selectedCategory &&
          flattenedChargesRows.length === 0 && (
            <Alert severity="info">No student service charges found.</Alert>
          )}
        {flattenedChargesRows.length > 0 && (
          <TableContainer component={Paper} sx={{ marginTop: 1 }}>
            <Table aria-label="simple table">
              <TableHead sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}>
                <TableRow>
                  <TableCell>Admission No</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Grade</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Academic Year</TableCell>
                  <TableCell>Charge Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Date Charged</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flattenedChargesRows.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.admissionNo}</TableCell>
                    <TableCell>{row.studentName}</TableCell>
                    <TableCell>{row.grade}</TableCell>
                    <TableCell>{row.className}</TableCell>
                    <TableCell>{row.academicYear}</TableCell>
                    <TableCell>{row.chargesCategory}</TableCell>
                    <TableCell align="right">{row.amount}</TableCell>
                    <TableCell>{row.dateCharged}</TableCell>
                    <TableCell>{row.remarks}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.amount === "-" ? "No Charges" : "Charged"}
                        color={row.amount === "-" ? "default" : "success"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Stack>
  );
};

export default CheckStudentServiceCharges;
