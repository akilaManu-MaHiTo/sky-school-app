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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { grey } from "@mui/material/colors";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
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
} from "../../../api/OrganizationSettings/academicDetailsApi";
import {
  getAllSubjectData,
  getGradesData,
  getYearsData,
} from "../../../api/OrganizationSettings/organizationSettingsApi";
import { getClassesData } from "../../../api/OrganizationSettings/academicGradeApi";

const AddOrEditStudentAcademicDetailsDialog = ({
  open,
  setOpen,
  defaultValues,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: any;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { isMobile } = useIsMobile();

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

  const { data: gradeData } = useQuery({
    queryKey: ["academic-grades"],
    queryFn: getGradesData,
  });
  const { data: subjectData } = useQuery({
    queryKey: ["subject-data"],
    queryFn: getAllSubjectData,
  });

  const { data: classData } = useQuery({
    queryKey: ["academic-classes"],
    queryFn: getClassesData,
  });

  const { data: yearData, isFetching: isYearDataFetching } = useQuery({
    queryKey: ["academic-years"],
    queryFn: getYearsData,
  });

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

  useEffect(() => {
    if (!open) {
      return;
    }

    if (defaultValues) {
      const matchedGrade =
        gradeData?.find(
          (grade: any) => grade?.id === defaultValues?.grade?.id
        ) ??
        defaultValues?.grade ??
        null;

      const matchedSubject =
        subjectData?.find(
          (subject: any) => subject?.id === defaultValues?.subject?.id
        ) ??
        defaultValues?.subject ??
        null;

      const matchedClass =
        classData?.find(
          (clazz: any) => clazz?.id === defaultValues?.class?.id
        ) ??
        defaultValues?.class ??
        null;

      const matchBasketSubject = (groupKey: "Group 1" | "Group 2" | "Group 3") => {
        const basketSubject = defaultValues?.basketSubjects?.[groupKey];
        if (!basketSubject) {
          return null;
        }

        return (
          subjectData?.find(
            (subject: any) => subject?.id === basketSubject?.id
          ) ?? basketSubject
        );
      };

      const matchedGroup1 = matchBasketSubject("Group 1");
      const matchedGroup2 = matchBasketSubject("Group 2");
      const matchedGroup3 = matchBasketSubject("Group 3");

      reset({
        ...defaultValues,
        grades: matchedGrade,
        subjects: matchedSubject,
        classes: matchedClass,
        group1: matchedGroup1,
        group2: matchedGroup2,
        group3: matchedGroup3,
      });
    } else {
      reset({
        grades: null,
        subjects: null,
        classes: null,
        group1: null,
        group2: null,
        group3: null,
      });
    }
  }, [open, defaultValues, gradeData, subjectData, classData, reset]);

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createAcademicStudentDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      enqueueSnackbar("Academic detail created successfully!", {
        variant: "success",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to create academic detail.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateAcademicStudentDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      enqueueSnackbar("Academic detail updated successfully!", {
        variant: "success",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to update academic detail.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleSubmitDetails = (data: AcademicDetail) => {
    if (isEdit && defaultValues?.id) {
      updateMutation(data);
      return;
    }

    createMutation(data);
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
          {isEdit ? "Edit Academic Detail" : "Add New Academic Detail"}
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
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Controller
            name="grades"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={gradeData ?? []}
                getOptionLabel={(option) => `Grade ` + option.grade}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                onChange={(event, newValue) => field.onChange(newValue)}
                value={field.value || null}
                size="small"
                sx={{ flex: 1, margin: "0.5rem" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={!!errors.grades}
                    helperText={errors.grades && "Required"}
                    label="Grade"
                  />
                )}
              />
            )}
          />

          <Controller
            name="classes"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={classData ?? []}
                getOptionLabel={(option) => option.className}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                onChange={(event, newValue) => field.onChange(newValue)}
                value={field.value || null}
                size="small"
                sx={{ flex: 1, margin: "0.5rem" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={!!errors.classes}
                    helperText={errors.classes && "Required"}
                    label="Class"
                  />
                )}
              />
            )}
          />

          <Controller
            name="academicYear"
            control={control}
            defaultValue={defaultValues?.academicYear ?? ""}
            {...register("academicYear", { required: true })}
            render={({ field }) => (
              <Autocomplete
                {...field}
                onChange={(event, newValue) => field.onChange(newValue)}
                size="small"
                options={
                  yearData?.length ? yearData.map((year) => year.year) : []
                }
                sx={{ flex: 1, margin: "0.5rem" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={!!errors.academicYear}
                    helperText={errors.academicYear && "Required"}
                    label="Academic Year"
                    name="academicYear"
                  />
                )}
              />
            )}
          />

          <Controller
            name="academicMedium"
            control={control}
            defaultValue={defaultValues?.academicMedium ?? ""}
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
                    label="Academic Medium"
                    name="academicMedium"
                  />
                )}
              />
            )}
          />

          <Controller
            name="group1"
            control={control}
            defaultValue={defaultValues?.group1 ?? ""}
            {...register("group1", { required: true })}
            render={({ field }) => (
              <Autocomplete
                {...field}
                onChange={(event, newValue) => field.onChange(newValue)}
                size="small"
                options={subjectData ?? []}
                getOptionLabel={(option) =>
                  option.subjectName + ` - ` + option.subjectMedium + ` Medium`
                }
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                sx={{ flex: 1, margin: "0.5rem" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={!!errors.group1}
                    helperText={errors.group1 && "Required"}
                    label="Group 1"
                    name="group1"
                  />
                )}
              />
            )}
          />

          <Controller
            name="group2"
            control={control}
            defaultValue={defaultValues?.group2 ?? ""}
            {...register("group2", { required: true })}
            render={({ field }) => (
              <Autocomplete
                {...field}
                onChange={(event, newValue) => field.onChange(newValue)}
                size="small"
                options={subjectData ?? []}
                getOptionLabel={(option) =>
                  option.subjectName + ` - ` + option.subjectMedium + ` Medium`
                }
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                sx={{ flex: 1, margin: "0.5rem" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={!!errors.group2}
                    helperText={errors.group2 && "Required"}
                    label="Group 2"
                    name="group2"
                  />
                )}
              />
            )}
          />

          <Controller
            name="group3"
            control={control}
            defaultValue={defaultValues?.group3 ?? ""}
            {...register("group3", { required: true })}
            render={({ field }) => (
              <Autocomplete
                {...field}
                onChange={(event, newValue) => field.onChange(newValue)}
                size="small"
                options={subjectData ?? []}
                getOptionLabel={(option) =>
                  option.subjectName + ` - ` + option.subjectMedium + ` Medium`
                }
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                sx={{ flex: 1, margin: "0.5rem" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={!!errors.group3}
                    helperText={errors.group3 && "Required"}
                    label="Group 3"
                    name="group3"
                  />
                )}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: "1rem" }}>
        <Button
          onClick={() => setOpen(false)}
          sx={{ color: "var(--pallet-blue)" }}
        >
          Cancel
        </Button>
        <CustomButton
          variant="contained"
          sx={{ backgroundColor: "var(--pallet-blue)" }}
          size="medium"
          disabled={isCreating || isUpdating}
          endIcon={
            isCreating || isUpdating ? <CircularProgress size={20} /> : null
          }
          onClick={handleSubmit(handleSubmitDetails)}
        >
          {isEdit ? "Save Changes" : "Add Details"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrEditStudentAcademicDetailsDialog;
