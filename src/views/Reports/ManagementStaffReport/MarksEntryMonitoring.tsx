import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import theme from "../../../theme";
import PageTitle from "../../../components/PageTitle";
import Breadcrumb from "../../../components/BreadCrumb";
import {
  examReportTerms,
  marksEntryMonitoring,
} from "../../../api/StudentMarks/studentMarksApi";
import { Controller, useForm } from "react-hook-form";
import { getYearsData } from "../../../api/OrganizationSettings/organizationSettingsApi";
import { getGradesData } from "../../../api/OrganizationSettings/academicGradeApi";
import useIsMobile from "../../../customHooks/useIsMobile";
import SearchInput from "../../../components/SearchBar";
import { useDebounce } from "../../../util/useDebounce";

type MarkCheckingItem = {
  academicYear: string;
  academicMedium: string;
  gradeId: number;
  gradeName: string;
  classId: number;
  className: string;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  totalStudentsForSubject: number;
  markedStudentsCount: number;
  pendingStudentsCount: number;
};

type TeacherMark = {
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
  // markChecking can be either a flat list (single term)
  // or an object keyed by term when "All" is selected
  markChecking:
    | MarkCheckingItem[]
    | {
        [term: string]: MarkCheckingItem[];
      };
};

type TransformedTeacherMark = TeacherMark & {
  isAllTermsSelected: boolean;
  isTermWiseData: boolean;
  rowsForSelectedTerm: MarkCheckingItem[];
};

const breadcrumbItems = [
  { title: "Home", href: "/home" },
  { title: "Reports" },
  { title: "Management Staff Reports" },
  { title: "Marks Entry Monitoring" },
];

export default function MarksEntryMonitoring() {
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
  const selectedTerm = watch("examTerm");
  const selectedGrade = watch("grade");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 1000);
  const handleSearch = async (query: string) => {
    console.log("Searching for:", query);
    setSearchQuery(query);
    try {
      await refetchMarkChecking();
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const {
    data,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch: refetchMarkChecking,
  } = useQuery<TeacherMark[]>({
    queryKey: [
      "marksEntryMonitoring",
      year,
      selectedGrade,
      selectedTerm,
      debouncedQuery,
    ],
    queryFn: () =>
      marksEntryMonitoring(year, selectedGrade, selectedTerm, debouncedQuery),
    enabled: !!selectedTerm && !!year && !!selectedGrade,
  });
  const { data: yearData, isFetching: isYearDataFetching } = useQuery({
    queryKey: ["academic-years"],
    queryFn: getYearsData,
  });
  const { data: gradeData, isFetching: isGradeDataFetching } = useQuery({
    queryKey: ["academic-grades"],
    queryFn: getGradesData,
  });
  const { isMobile, isTablet } = useIsMobile();

  const transformedData = useMemo<TransformedTeacherMark[]>(() => {
    if (!data) return [];

    return data.map((teacher) => {
      const isAllTermsSelected = selectedTerm === "All";

      const isTermWiseData =
        !!teacher.markChecking &&
        !Array.isArray(teacher.markChecking) &&
        typeof teacher.markChecking === "object";

      const getRowsForSelectedTerm = (): MarkCheckingItem[] => {
        if (Array.isArray(teacher.markChecking)) {
          return teacher.markChecking;
        }

        const termWise = teacher.markChecking as Record<
          string,
          MarkCheckingItem[]
        >;

        if (selectedTerm && selectedTerm !== "All") {
          if (termWise[selectedTerm]) {
            return termWise[selectedTerm];
          }
        }

        return Object.values(termWise).flat();
      };

      return {
        ...teacher,
        isAllTermsSelected,
        isTermWiseData,
        rowsForSelectedTerm: getRowsForSelectedTerm(),
      };
    });
  }, [data, selectedTerm]);

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
        <PageTitle title="Marks Entry Monitoring" />
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
          <Typography variant="subtitle2">Marks Entry Filters</Typography>
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
                      options={
                        examReportTerms?.filter((item) => item != null) ?? []
                      }
                      sx={{ flex: 1 }}
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
            </Stack>

            {year && selectedGrade && selectedTerm && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginX: "0.5rem",
                }}
              >
                <SearchInput
                  placeholder="Search Teachers"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={handleSearch}
                  isSearching={isLoading}
                  maxWidth={!isMobile && "50%"}
                />
              </Box>
            )}
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
          boxShadow: 1,
          borderRadius: 1,
          backgroundColor: "#fff",
          padding: 2,
        }}
      >
        {data ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Teachers Marks Entry Monitoring Details
          </Alert>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            Select filters to view Teachers Marks Entry Monitoring
          </Alert>
        )}
        {(isLoading || isRefetching) && <LinearProgress sx={{ mb: 2 }} />}
        {transformedData.map((teacher) => {
          const { isAllTermsSelected, isTermWiseData, rowsForSelectedTerm } =
            teacher;

          return (
            <Accordion key={teacher.teacherId} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>
                    {teacher.teacherName}
                  </Typography>
                  <Typography variant="caption">
                    {teacher.teacherEmail}
                  </Typography>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                {isAllTermsSelected && isTermWiseData ? (
                  Object.entries(
                    teacher.markChecking as Record<string, MarkCheckingItem[]>
                  ).map(([termName, items]) => {
                    if (!items || items.length === 0) {
                      return null;
                    }

                    const displayYear =
                      items[0]?.academicYear ?? year?.year ?? "";
                    const headerLabel = `${displayYear}-${termName}`;

                    return (
                      <Accordion key={termName} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>{headerLabel}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TableContainer
                            component={Paper}
                            elevation={2}
                            sx={{
                              overflowX: "auto",
                              maxWidth: isMobile
                                ? "60vw"
                                : isTablet
                                ? "88vW"
                                : "100%",
                            }}
                          >
                            <Table aria-label="simple table">
                              <TableHead
                                sx={{
                                  backgroundColor: "var(--pallet-lighter-blue)",
                                }}
                              >
                                <TableRow>
                                  <TableCell>Medium</TableCell>
                                  <TableCell>Grade</TableCell>
                                  <TableCell>Class</TableCell>
                                  <TableCell>Subject Code</TableCell>
                                  <TableCell>Subject</TableCell>
                                  <TableCell align="right">Total</TableCell>
                                  <TableCell align="right">Marked</TableCell>
                                  <TableCell align="right">Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {items.map((row) => (
                                  <TableRow
                                    key={`${row.subjectId}-${row.classId}-${row.academicMedium}`}
                                  >
                                    <TableCell>{row.academicMedium}</TableCell>
                                    <TableCell>{row.gradeName}</TableCell>
                                    <TableCell>{row.className}</TableCell>
                                    <TableCell>{row.subjectCode}</TableCell>
                                    <TableCell>{row.subjectName}</TableCell>
                                    <TableCell align="right">
                                      {row.totalStudentsForSubject}
                                    </TableCell>
                                    <TableCell align="right">
                                      {row.markedStudentsCount}
                                    </TableCell>
                                    <TableCell align="right">
                                      {row.pendingStudentsCount > 0 ? (
                                        <Chip
                                          label="Pending"
                                          color="error"
                                          size="small"
                                        />
                                      ) : (
                                        <Chip
                                          label="Done"
                                          color="success"
                                          size="small"
                                        />
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })
                ) : (
                  <TableContainer
                    component={Paper}
                    elevation={2}
                    sx={{
                      overflowX: "auto",
                      maxWidth: isMobile ? "70vw" : isTablet ? "88vW" : "100%",
                    }}
                  >
                    <Table aria-label="simple table">
                      <TableHead
                        sx={{ backgroundColor: "var(--pallet-lighter-blue)" }}
                      >
                        <TableRow>
                          <TableCell>Medium</TableCell>
                          <TableCell>Grade</TableCell>
                          <TableCell>Class</TableCell>
                          <TableCell>Subject Code</TableCell>
                          <TableCell>Subject</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="right">Marked</TableCell>
                          <TableCell align="right">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rowsForSelectedTerm.map((row) => (
                          <TableRow
                            key={`${row.subjectId}-${row.classId}-${row.academicMedium}`}
                          >
                            <TableCell>{row.academicMedium}</TableCell>
                            <TableCell>{row.gradeName}</TableCell>
                            <TableCell>{row.className}</TableCell>
                            <TableCell>{row.subjectCode}</TableCell>
                            <TableCell>{row.subjectName}</TableCell>
                            <TableCell align="right">
                              {row.totalStudentsForSubject}
                            </TableCell>
                            <TableCell align="right">
                              {row.markedStudentsCount}
                            </TableCell>
                            <TableCell align="right">
                              {row.pendingStudentsCount > 0 ? (
                                <Chip
                                  label="Pending"
                                  color="error"
                                  size="small"
                                />
                              ) : (
                                <Chip
                                  label="Done"
                                  color="success"
                                  size="small"
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </>
  );
}
