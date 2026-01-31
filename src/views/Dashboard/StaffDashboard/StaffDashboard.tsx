import {
  Box,
  Stack,
  Typography,
  Chip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Autocomplete,
  TextField,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import theme from "../../../theme";
import PageTitle from "../../../components/PageTitle";
import Breadcrumb from "../../../components/BreadCrumb";
import useIsMobile from "../../../customHooks/useIsMobile";
import { useQuery } from "@tanstack/react-query";
import { fetchAllStudents, fetchAllTeachers, fetchClassStudentCounts } from "../../../api/documentType";
import { getYearsData } from "../../../api/OrganizationSettings/organizationSettingsApi";
import { Controller, useForm } from "react-hook-form";

const breadcrumbItems = [
  { title: "Home", href: "/home" },
  { title: "Staff Dashboard" },
];

interface BasketSubject {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  colorCode: string;
  studentCount: number;
}

interface ClassInfo {
  classId: number;
  className: string;
  studentCount: number;
  basketSubjects: BasketSubject[];
}

interface GradeInfo {
  gradeId: number;
  grade: string;
  totalStudents: number;
  classes: ClassInfo[];
}

export default function StaffDashboard() {
  const { isMobile, isTablet } = useIsMobile();
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm();
  const selectedYear = watch("year");

  const { data: classData, isFetching } = useQuery({
    queryKey: ["class-student-counts", selectedYear],
    queryFn: () => fetchClassStudentCounts(selectedYear),
  });
  const { data: studentDataCount, isFetching: isStudentDataFetching } = useQuery({
    queryKey: ["school-student-counts", selectedYear],
    queryFn: () => fetchAllStudents(selectedYear),
  });
  const { data: TeacherDataCount, isFetching: isTeacherDataFetching } = useQuery({
    queryKey: ["school-teacher-counts", selectedYear],
    queryFn: () => fetchAllTeachers(selectedYear),
  });
  const { data: yearData, isFetching: isYearDataFetching } = useQuery({
    queryKey: ["academic-years"],
    queryFn: getYearsData,
  });

  return (
    <>
      <Box
        sx={{
          padding: theme.spacing(2),
          boxShadow: 2,
          marginY: 2,
          borderRadius: 1,
          backgroundColor: "#fff",
          overflowX: "hidden",
        }}
      >
        <PageTitle title="Staff Dashboard" />
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
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Data Filters
          </Typography>
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

      <Stack>
        {isFetching && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 4,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {!isFetching && (!classData || classData.length === 0) && (
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: 1,
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              padding: 2,
              textAlign: isMobile ? "center" : "left",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No data available for the selected year.
            </Typography>
          </Box>
        )}

        {!isFetching && classData && classData.length > 0 && (
          <Stack spacing={2}>
            {classData.map((grade) => (
              <Accordion
                key={grade.gradeId}
                defaultExpanded
                sx={{
                  backgroundColor: "#fff",
                  borderRadius: "6px",
                  boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)",
                  border: "1px solid var(--pallet-lighter-grey)",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    borderRadius: "12px 12px 0 0",
                    px: 2.5,
                    py: 1.5,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ width: "100%" }}
                  >
                    <Stack spacing={0.3}>
                      <Typography variant="overline" color="text.secondary">
                        Grade
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, letterSpacing: 0.2 }}
                      >
                        {grade.grade}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Chip
                        label={`${grade.totalStudents} Students`}
                        size="small"
                        sx={{
                          backgroundColor: "#f3f4ff",
                          color: "var(--pallet-blue)",
                          fontWeight: 500,
                        }}
                      />
                    </Stack>
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ padding: 2.5, pt: 1.5 }}>
                  <Stack spacing={1.5}>
                    {grade.classes.map((classItem) => (
                      <Paper
                        key={classItem.classId}
                        elevation={0}
                        sx={{
                          borderRadius: 2,
                          border: "1px solid #e5e7eb",
                          padding: 1.75,
                          transition: "box-shadow 0.2s, transform 0.1s",
                          background:
                            "linear-gradient(135deg, #ffffff, #f9fafb)",
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={1.5}
                        >
                          <Stack spacing={0.25}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600, letterSpacing: 0.1 }}
                            >
                              {classItem.className}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Class overview
                            </Typography>
                          </Stack>

                          <Chip
                            label={`${classItem.studentCount} Students`}
                            size="small"
                            sx={{
                              backgroundColor: "#eff6ff",
                              color: "var(--pallet-blue)",
                              fontWeight: 600,
                              minWidth: 90,
                            }}
                          />
                        </Stack>

                        <Box
                          sx={{
                            mt: 1.5,
                            pt: 1.25,
                            borderTop: "1px dashed #e5e7eb",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mb: 1, display: "block" }}
                          >
                            Basket subjects & allocations
                          </Typography>

                          <Stack spacing={0.75}>
                            {classItem.basketSubjects.map((subject) => (
                              <Stack
                                key={subject.subjectId}
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{
                                  backgroundColor: `${subject.colorCode}12`,
                                  borderRadius: 1,
                                  padding: "6px 10px",
                                  borderLeft: `3px solid ${subject.colorCode}`,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ flex: 1, fontWeight: 500 }}
                                >
                                  {subject.subjectName}
                                </Typography>
                                <Chip
                                  label={subject.subjectCode}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    backgroundColor: subject.colorCode,
                                    color: "#fff",
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 600,
                                    color: subject.colorCode,
                                  }}
                                >
                                  {subject.studentCount}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Stack>
    </>
  );
}
