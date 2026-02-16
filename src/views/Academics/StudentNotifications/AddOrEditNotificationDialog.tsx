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
  CircularProgress,
  Autocomplete,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { grey } from "@mui/material/colors";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import CustomButton from "../../../components/CustomButton";
import useIsMobile from "../../../customHooks/useIsMobile";
import queryClient from "../../../state/queryClient";
import {
  createStudentNotification,
  StudentNotification,
  updateStudentNotification,
} from "../../../api/notificationApi";
import {
  getClassesData,
  getGradesData,
  AcademicClass,
  AcademicGrade,
  AcademicYear,
} from "../../../api/OrganizationSettings/academicGradeApi";
import { getYearsData } from "../../../api/OrganizationSettings/organizationSettingsApi";

interface AddOrEditNotificationDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: StudentNotification;
}

const AddOrEditNotificationDialog = ({
  open,
  setOpen,
  defaultValues,
}: AddOrEditNotificationDialogProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { isMobile } = useIsMobile();

  const isEdit = Boolean(defaultValues && defaultValues.id);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    register,
  } = useForm<StudentNotification>();

  console.log("Default Values: ", defaultValues);
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

  const resolvedDefaults = useMemo(() => {
    if (!defaultValues) {
      return {
        title: "",
        description: "",
        year: null,
        gradeId: null,
        classId: null,
      } as Partial<StudentNotification>;
    }

    const rawYear = (defaultValues as any).year;
    const rawGrade = (defaultValues as any).gradeId ?? (defaultValues as any).grade;
    const rawClass = (defaultValues as any).classId ?? (defaultValues as any).class;

    const yearValue =
      typeof rawYear === "string"
        ? (yearData ?? []).find((item: AcademicYear) => item.year === rawYear) ??
          null
        : rawYear && typeof rawYear === "object"
          ? (yearData ?? []).find(
              (item: AcademicYear) => item.id === rawYear.id,
            ) ?? rawYear
          : null;

    const gradeValue =
      typeof rawGrade === "number"
        ? (gradeData ?? []).find(
            (item: AcademicGrade) => item.id === rawGrade,
          ) ?? null
        : rawGrade && typeof rawGrade === "object"
          ? (gradeData ?? []).find(
              (item: AcademicGrade) => item.id === rawGrade.id,
            ) ?? rawGrade
          : null;

    const classValue =
      typeof rawClass === "number"
        ? (classData ?? []).find(
            (item: AcademicClass) => item.id === rawClass,
          ) ?? null
        : rawClass && typeof rawClass === "object"
          ? (classData ?? []).find(
              (item: AcademicClass) => item.id === rawClass.id,
            ) ?? rawClass
          : null;

    return {
      ...defaultValues,
      year: yearValue,
      gradeId: gradeValue,
      classId: classValue,
    } as Partial<StudentNotification>;
  }, [defaultValues, yearData, gradeData, classData]);

  useEffect(() => {
    if (open) {
      reset(resolvedDefaults as StudentNotification);
    }
  }, [open, resolvedDefaults, reset]);

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createStudentNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to create student notification.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateStudentNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-notifications"] });
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to update student notification.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const onSubmit = (data: StudentNotification) => {
    if (isEdit) {
      updateMutation(data);
    } else {
      createMutation(data);
    }
  };

  const isSubmitting = isCreating || isUpdating;

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
        onSubmit: handleSubmit(onSubmit),
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
          {isEdit ? "Edit Student Notification" : "Add Student Notification"}
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
          <TextField
            label="Title"
            size="small"
            sx={{ flex: 1, margin: "0.5rem" }}
            error={!!errors.title}
            helperText={errors.title && "Title is required"}
            {...register("title", { required: true })}
          />

          <TextField
            label="Description"
            size="small"
            multiline
            minRows={3}
            sx={{ flex: 1, margin: "0.5rem" }}
            error={!!errors.description}
            helperText={errors.description && "Description is required"}
            {...register("description", { required: true })}
          />

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
                loading={isYearDataFetching}
                getOptionLabel={(option) => option.year}
                isOptionEqualToValue={(option, value) =>
                  option.year === value.year
                }
                sx={{ flex: 1, margin: "0.5rem" }}
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

          <Controller
            name="gradeId"
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
                sx={{ flex: 1, margin: "0.5rem" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={!!errors.gradeId}
                    helperText={errors.gradeId && "Required"}
                    label="Select Grade"
                    name="grade"
                  />
                )}
              />
            )}
          />

          <Controller
            name="classId"
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
                isOptionEqualToValue={(option, value) => option.id === value.id}
                sx={{ flex: 1, margin: "0.5rem" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={!!errors.classId}
                    helperText={errors.classId && "Required"}
                    label="Select Class"
                    name="class"
                  />
                )}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: "1rem" }}>
        <Button
          onClick={() => {
            setOpen(false);
            reset();
          }}
          sx={{ color: "var(--pallet-blue)" }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <CustomButton
          variant="contained"
          sx={{ backgroundColor: "var(--pallet-blue)" }}
          type="submit"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isEdit ? "Update" : "Create"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrEditNotificationDialog;
