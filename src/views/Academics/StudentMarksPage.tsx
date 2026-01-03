import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
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
import { useQuery } from "@tanstack/react-query";
import {
  examTerms,
  fetchExamStudentMarks,
  fetchStudentMarks,
  fetchTeacherClass,
  fetchTeacherGrade,
  fetchTeacherMedium,
  fetchTeacherSubject,
  fetchTeacherYears,
  months,
  TeacherDashBoardFilter,
} from "../../api/StudentMarks/studentMarksApi";
import { AcademicMedium } from "../../api/OrganizationSettings/academicDetailsApi";
import {
  getAllSubjectData,
  getGradesData,
  getYearsData,
} from "../../api/OrganizationSettings/organizationSettingsApi";
import {
  getClassesData,
  AcademicClass,
  AcademicGrade,
  AcademicSubject,
  AcademicYear,
} from "../../api/OrganizationSettings/academicGradeApi";
import theme from "../../theme";
import PageTitle from "../../components/PageTitle";
import Breadcrumb from "../../components/BreadCrumb";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useIsMobile from "../../customHooks/useIsMobile";
import { Controller, useForm } from "react-hook-form";
import CustomButton from "../../components/CustomButton";
import StudentMarksTable from "./StudentMarksTable";
import { set } from "date-fns";

const TERM_OPTIONS = ["Term 1", "Term 2", "Term 3", "Monthly Exam"];

const StudentMarksPage = () => {
  const { isMobile, isTablet } = useIsMobile();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const selectedYear = watch("teacherYear");
  const selectedGrade = watch("teacherGrade");
  const selectedClass = watch("teacherClassName");
  const selectedMedium = watch("teacherMedium");
  const selectedTerm = watch("examTerm");
  const selectedSubject = watch("teacherSubject");
  const selectedMonth = watch("monthlyExam");
  console.log("selectedYear", selectedYear);
  console.log("selectedGrade", selectedGrade);
  console.log("selectedClass", selectedClass);

  const enableFetchWithMonth =
    selectedTerm === "Monthly Exam" ? !!selectedMonth : true;

  const isMonthlyExam = selectedTerm === "Monthly Exam";

  const { data: teacherYearData, isFetching: isTeacherYearDataFetching } =
    useQuery({
      queryKey: ["academic-years-teacher"],
      queryFn: fetchTeacherYears,
    });

  const { data: teacherMediumData, isFetching: isTeacherMediumDataFetching } =
    useQuery({
      queryKey: ["academic-medium-teacher", selectedYear],
      queryFn: () => fetchTeacherMedium(selectedYear),
      enabled: !!selectedYear,
    });

  const { data: teacherClassData, isFetching: isTeacherClassDataFetching } =
    useQuery({
      queryKey: ["academic-class-teacher", selectedYear, selectedGrade],
      queryFn: () => fetchTeacherClass(selectedYear, selectedGrade),
      enabled: !!selectedYear && !!selectedGrade,
    });

  const { data: teacherSubjectData, isFetching: isTeacherSubjectDataFetching } =
    useQuery({
      queryKey: [
        "academic-subject-teacher",
        selectedYear,
        selectedGrade,
        selectedClass,
        selectedMedium,
      ],
      queryFn: () =>
        fetchTeacherSubject(
          selectedYear,
          selectedGrade,
          selectedClass,
          selectedMedium
        ),
      enabled:
        !!selectedYear &&
        !!selectedGrade &&
        !!selectedClass &&
        !!selectedMedium,
    });
  const { data: teacherGradeData, isFetching: isTeacherGradeDataFetching } =
    useQuery({
      queryKey: ["academic-grade-teacher", selectedYear],
      queryFn: () => fetchTeacherGrade(selectedYear),
      enabled: !!selectedYear,
    });

  const {
    data: studentExamData,
    isFetching: isStudentExamMarksDataFetching,
    refetch: refetchMarksData,
  } = useQuery({
    queryKey: [
      "academic-student-marks",
      selectedYear,
      selectedGrade,
      selectedClass,
      selectedMedium,
      selectedSubject,
      selectedTerm,
      selectedMonth,
    ],
    queryFn: () =>
      fetchExamStudentMarks(
        selectedGrade,
        selectedClass,
        selectedYear,
        selectedMedium,
        selectedSubject,
        selectedTerm,
        selectedMonth
      ),
    enabled:
      !!selectedYear &&
      !!selectedGrade &&
      !!selectedClass &&
      !!selectedMedium &&
      !!selectedSubject &&
      !!selectedTerm &&
      enableFetchWithMonth,
  });
  const breadcrumbItems = [
    { title: "Home", href: "/home" },
    { title: "Add Student Marks" },
  ];
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
        <PageTitle title="Student's Marks Management" />
        <Breadcrumb breadcrumbs={breadcrumbItems} />
      </Box>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
          sx={{
            borderBottom: "1px solid var(--pallet-lighter-grey)",
          }}
        >
          <Typography variant="subtitle2">Exam Marks Filter</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              flex: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flex: 1,
                // minWidth: "250px",
              }}
            >
              <Controller
                name="teacherYear"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    value={field.value ?? null}
                    onChange={(e, newVal) => {
                      field.onChange(newVal);
                      setValue("teacherClassName", null, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("teacherGrade", null, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("teacherMedium", null, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      setValue("teacherSubject", null, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    size="small"
                    options={
                      teacherYearData?.filter((item) => item != null) ?? []
                    }
                    sx={{ flex: 1, margin: "0.5rem" }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        error={!!errors.teacherYear}
                        helperText={errors.teacherYear && "Required"}
                        label="Select Year"
                        name="teacherYear"
                      />
                    )}
                  />
                )}
              />
            </Box>
            {selectedYear && (
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
                  // minWidth: "250px",
                }}
              >
                <Controller
                  name="teacherGrade"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      value={field.value ?? null}
                      onChange={(e, newVal) => {
                        field.onChange(newVal);
                        setValue("teacherClassName", null, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      size="small"
                      options={teacherGradeData ?? []}
                      getOptionLabel={(option) => `Grade ` + option.grade}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.teacherGrade}
                          helperText={errors.teacherGrade && "Required"}
                          label="Select Grade"
                          name="teacherGrade"
                        />
                      )}
                    />
                  )}
                />
              </Box>
            )}
            {selectedYear && selectedGrade && (
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
                  // minWidth: "250px",
                }}
              >
                <Controller
                  name="teacherClassName"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      value={field.value ?? null}
                      onChange={(event, newValue) => field.onChange(newValue)}
                      size="small"
                      options={teacherClassData ?? []}
                      getOptionLabel={(option) => option.className}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.teacherClassName}
                          helperText={errors.teacherClassName && "Required"}
                          label="Select Class"
                          name="teacherClassName"
                        />
                      )}
                    />
                  )}
                />
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                flex: 1,
                // minWidth: "250px",
              }}
            >
              <Controller
                name="examTerm"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    value={field.value ?? null}
                    onChange={(e, newVal) => {
                      field.onChange(newVal);
                      setValue("monthlyExam", null, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                      
                    }}
                    size="small"
                    options={examTerms?.filter((item) => item != null) ?? []}
                    sx={{ flex: 1, margin: "0.5rem" }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        error={!!errors.examTerm}
                        helperText={errors.examTerm && "Required"}
                        label="Select Exam"
                        name="examTerm"
                      />
                    )}
                  />
                )}
              />
            </Box>
            {isMonthlyExam && (
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
                  // minWidth: "250px",
                }}
              >
                <Controller
                  name="monthlyExam"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      value={field.value ?? null}
                      onChange={(event, newValue) => field.onChange(newValue)}
                      size="small"
                      options={months?.filter((item) => item != null) ?? []}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.monthlyExam}
                          helperText={errors.monthlyExam && "Required"}
                          label="Select month"
                          name="monthlyExam"
                        />
                      )}
                    />
                  )}
                />
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              flex: 1,
            }}
          >
            {selectedYear && (
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
                  minWidth: "250px",
                }}
              >
                <Controller
                  name="teacherMedium"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      value={field.value ?? null}
                      onChange={(event, newValue) => field.onChange(newValue)}
                      size="small"
                      options={
                        teacherMediumData?.filter((item) => item != null) ?? []
                      }
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.teacherMedium}
                          helperText={errors.teacherMedium && "Required"}
                          label="Select Medium"
                          name="teacherMedium"
                        />
                      )}
                    />
                  )}
                />
              </Box>
            )}

            {selectedYear && selectedMedium && (
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
                  minWidth: "250px",
                }}
              >
                <Controller
                  name="teacherSubject"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      value={field.value ?? null}
                      onChange={(event, newValue) => field.onChange(newValue)}
                      size="small"
                      options={teacherSubjectData ?? []}
                      getOptionLabel={(option) => option.subjectName}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.teacherSubject}
                          helperText={errors.teacherSubject && "Required"}
                          label="Select Subject"
                          name="teacherSubject"
                        />
                      )}
                    />
                  )}
                />
              </Box>
            )}
          </Box>
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
                console.log("reset");
              }}
              sx={{ color: "var(--pallet-blue)", marginRight: "0.5rem" }}
            >
              Reset
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Box>
        {!studentExamData || studentExamData.length === 0 ? (
          <Alert severity="info">
            No marks data available for the selected filters. Please adjust the
            filters to view student marks.
          </Alert>
        ) : (
          <StudentMarksTable
            rows={studentExamData}
            selectedSubject={selectedSubject}
            selectedTerm={selectedTerm}
            selectedYear={selectedYear}
            isDataLoading={isStudentExamMarksDataFetching}
            selectedMonth={selectedMonth}
            selectedGrade={selectedGrade}
            selectedClass={selectedClass}
            selectedMedium={selectedMedium}
            refetchData={refetchMarksData}
          />
        )}
      </Box>
    </Stack>
  );
};

export default StudentMarksPage;
