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
  updateAcademicDetail,
  updateAcademicDetailsByAdmin,
} from "../../../api/OrganizationSettings/academicDetailsApi";
import {
  getAllSubjectData,
  getGradesData,
  getYearsData,
} from "../../../api/OrganizationSettings/organizationSettingsApi";
import { getClassesData } from "../../../api/OrganizationSettings/academicGradeApi";

const AddOrEditAcademicDetailsByAdminDialog = ({
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

      reset({
        ...defaultValues,
        grades: matchedGrade,
        subjects: matchedSubject,
        classes: matchedClass,
      });
    } else {
      reset({ grades: null, subjects: null, classes: null });
    }
  }, [open, defaultValues, gradeData, subjectData, classData, reset]);

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createAcademicDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
    mutationFn: updateAcademicDetailsByAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
            name="subjects"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Autocomplete
                {...field}
                options={subjectData ?? []}
                getOptionLabel={(option) =>
                  option.subjectName + ` - ` + option.subjectMedium + ` Medium`
                }
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
                    error={!!errors.subjects}
                    helperText={errors.subjects && "Required"}
                    label="Subject"
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

export default AddOrEditAcademicDetailsByAdminDialog;
