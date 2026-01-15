import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import theme from "../../../theme";
import PageTitle from "../../../components/PageTitle";
import Breadcrumb from "../../../components/BreadCrumb";
import {
  examReportStatus,
  examReportTerms,
} from "../../../api/StudentMarks/studentMarksApi";
import { Controller, useForm } from "react-hook-form";
import { getYearsData } from "../../../api/OrganizationSettings/organizationSettingsApi";
import {
  getClassesData,
  getGradesData,
  getStudentToPromoteData,
  promoteStudents,
} from "../../../api/OrganizationSettings/academicGradeApi";
import useIsMobile from "../../../customHooks/useIsMobile";
import { AcademicMedium } from "../../../api/OrganizationSettings/academicDetailsApi";
import { useSnackbar } from "notistack";

const breadcrumbItems = [
  { title: "Home", href: "/home" },
  { title: "Administration" },
  { title: "Student Management" },
  { title: "Student Promotion" },
];

export default function StudentPromotion() {
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm();
  const year = watch("year");
  const selectedGrade = watch("grade");
  const selectedClass = watch("class");
  const promoteYear = watch("academicYear");
  const promoteGrade = watch("academicGrade");
  const promoteClass = watch("academicClass");
  const promoteMedium = watch("academicMedium");

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

  const {
    data: studentPromotionData,
    isFetching: isStudentPromotionDataFetching,
    refetch: refetchStudentPromotionData,
  } = useQuery({
    queryKey: [
      "student-promotion-data",
      year?.id,
      selectedGrade?.id,
      selectedClass?.id,
    ],
    queryFn: () =>
      getStudentToPromoteData(year?.year, selectedGrade, selectedClass),
    enabled: !!(year && selectedGrade && selectedClass),
  });
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { mutate: promoteStudentsMutation, isPending: isPromoting } =
    useMutation({
      mutationFn: promoteStudents,
      onSuccess: () => {
        enqueueSnackbar("Students promoted successfully", {
          variant: "success",
        });
        setSelectedStudentIds([]);
        refetchStudentPromotionData();
      },
      onError: (error: any) => {
        const message =
          error?.data?.message || "Failed to promote selected students";
        enqueueSnackbar(message, { variant: "error" });
      },
    });

  const { isMobile, isTablet } = useIsMobile();

  useEffect(() => {
    setSelectedStudentIds([]);
    setSearchTerm("");
  }, [studentPromotionData]);

  const filteredStudents = useMemo(() => {
    if (!studentPromotionData) return [];
    if (!searchTerm) return studentPromotionData;

    const term = searchTerm.toLowerCase();

    return studentPromotionData.filter((student: any) => {
      const admissionNumber =
        student?.student?.admissionNumber?.toString().toLowerCase() ?? "";
      const nameWithInitials =
        student?.student?.nameWithInitials?.toLowerCase() ?? "";

      return (
        admissionNumber.includes(term) || nameWithInitials.includes(term)
      );
    });
  }, [studentPromotionData, searchTerm]);

  const allSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((student: any) =>
      selectedStudentIds.includes(student.id)
    );

  const isIndeterminate =
    selectedStudentIds.length > 0 &&
    !allSelected &&
    filteredStudents.some((student: any) =>
      selectedStudentIds.includes(student.id)
    );

  const handleSelectAllChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked && filteredStudents.length > 0) {
      const filteredIds = filteredStudents.map((student: any) => student.id);
      setSelectedStudentIds((prev) =>
        Array.from(new Set([...prev, ...filteredIds]))
      );
    } else {
      const filteredIdSet = new Set(
        filteredStudents.map((student: any) => student.id)
      );
      setSelectedStudentIds((prev) =>
        prev.filter((id) => !filteredIdSet.has(id))
      );
    }
  };

  const handleRowToggle = (id: number) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handlePromoteSelected = () => {
    if (!promoteYear || !promoteGrade || !promoteClass || !promoteMedium) {
      enqueueSnackbar("Please select promote year, grade, class and medium", {
        variant: "warning",
      });
      return;
    }

    if (!studentPromotionData || selectedStudentIds.length === 0) {
      enqueueSnackbar("Please select at least one student to promote", {
        variant: "warning",
      });
      return;
    }

    const payload = studentPromotionData
      .filter((student: any) => selectedStudentIds.includes(student.id))
      .map((student: any) => ({
        studentId: student?.student?.studentId,
        academicGradeId: promoteGrade.id,
        academicClassId: promoteClass.id,
        academicYear: promoteYear.year,
        academicMedium: promoteMedium,
      }));

    promoteStudentsMutation(payload);
  };

  return (
    <>
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
        <PageTitle title="Student Promotion" />
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
                      sx={{ flex: 1 }}
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
                      sx={{ flex: 1 }}
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
                      options={classData ?? []}
                      getOptionLabel={(option) => option.className}
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
            <IconButton
              onClick={() => {
                refetchStudentPromotionData();
              }}
            >
              <RefreshIcon sx={{ color: "var(--pallet-blue)" }} />
            </IconButton>
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

      <Stack
        sx={{
          display: "flex",
          flexDirection: "column",
          marginTop: "0.5rem",
          gap: 2,
        }}
      >
        Select Promote Details
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
              name="academicYear"
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
                  sx={{ flex: 1 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={!!errors.academicYear}
                      helperText={errors.academicYear && "Required"}
                      label="Select Promote Year"
                      name="academicYear"
                    />
                  )}
                />
              )}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
            <Controller
              name="academicGrade"
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
                  sx={{ flex: 1 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={!!errors.academicGradeId}
                      helperText={errors.academicGradeId && "Required"}
                      label="Select Promote Grade"
                      name="academicGrade"
                    />
                  )}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
            <Controller
              name="academicClass"
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
                  sx={{ flex: 1 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={!!errors.class}
                      helperText={errors.class && "Required"}
                      label="Select Promote Class"
                      name="academicClassId"
                    />
                  )}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
            <Controller
            name="academicMedium"
            control={control}
            {...register("academicMedium", { required: true })}
            render={({ field }) => (
              <Autocomplete
                {...field}
                onChange={(event, newValue) => field.onChange(newValue)}
                size="small"
                options={AcademicMedium.map((medium) => medium.academicMedium)}
                sx={{ flex: 1, margin: "0.5rem" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={!!errors.academicMedium}
                    helperText={errors.academicMedium && "Required"}
                    label="Select Promote Medium"
                    name="academicMedium"
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
          justifyContent: "space-between",
          marginTop: "0.5rem",
          marginX: "0.5rem",
        }}
      >
        <TextField
          size="small"
          label="Search by admission or name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: 320, marginRight: 2 }}
        />
        <Button
          variant="contained"
          onClick={handlePromoteSelected}
          disabled={
            isPromoting ||
            !studentPromotionData ||
            studentPromotionData.length === 0 ||
            selectedStudentIds.length === 0
          }
        >
          {isPromoting ? "Promoting..." : "Promote Selected Students"}
        </Button>
      </Box>
      <Stack>
        {isStudentPromotionDataFetching && <LinearProgress />}
        {!isStudentPromotionDataFetching &&
          filteredStudents &&
          filteredStudents.length > 0 && (
            <TableContainer
              component={Paper}
              sx={{ marginTop: theme.spacing(2) }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={isIndeterminate}
                        checked={allSelected}
                        onChange={handleSelectAllChange}
                      />
                    </TableCell>
                    <TableCell>Admission number</TableCell>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Current Grade</TableCell>
                    <TableCell>Current Class</TableCell>
                    <TableCell>Current Year</TableCell>
                    <TableCell>Medium</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => handleRowToggle(student.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {student.student.admissionNumber ?? "--"}
                      </TableCell>
                      <TableCell>
                        {student.student.nameWithInitials ?? "--"}
                      </TableCell>
                      <TableCell>{student.grade.grade ?? "--"}</TableCell>
                      <TableCell>{student.class.className ?? "--"}</TableCell>
                      <TableCell>{student.academicYear ?? "--"}</TableCell>
                      <TableCell>{student.academicMedium ?? "--"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        {!isStudentPromotionDataFetching &&
          studentPromotionData &&
          studentPromotionData.length === 0 && (
            <Alert severity="info" sx={{ marginTop: theme.spacing(2) }}>
              No students found for the selected criteria.
            </Alert>
          )}
      </Stack>
    </>
  );
}
