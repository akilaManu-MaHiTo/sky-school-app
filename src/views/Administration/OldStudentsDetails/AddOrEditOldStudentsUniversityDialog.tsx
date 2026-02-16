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
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import CustomButton from "../../../components/CustomButton";
import useIsMobile from "../../../customHooks/useIsMobile";
import queryClient from "../../../state/queryClient";
import {
  type OldStudentUniversity,
  type OldStudentUniversityForm,
  createOldStudentUniversity,
  updateOldStudentUniversity,
} from "../../../api/oldStudentsApi";

interface AddOrEditOldStudentsUniversityDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  studentId: number;
  defaultValues?: OldStudentUniversity | null;
}

const AddOrEditOldStudentsUniversityDialog = ({
  open,
  setOpen,
  studentId,
  defaultValues,
}: AddOrEditOldStudentsUniversityDialogProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { isMobile } = useIsMobile();

  const isEdit = Boolean(defaultValues && defaultValues.id);

  const initialValues: OldStudentUniversityForm = useMemo(() => {
    if (defaultValues) {
      return {
        studentId: defaultValues.studentId,
        universityName: defaultValues.universityName ?? "",
        country: defaultValues.country ?? "",
        city: defaultValues.city ?? "",
        degree: defaultValues.degree ?? "",
        faculty: defaultValues.faculty ?? "",
        yearOfAdmission: defaultValues.yearOfAdmission ?? "",
        yearOfGraduation: defaultValues.yearOfGraduation ?? "",
      };
    }

    return {
      studentId,
      universityName: "",
      country: "",
      city: "",
      degree: "",
      faculty: "",
      yearOfAdmission: "",
      yearOfGraduation: "",
    };
  }, [defaultValues, studentId]);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    register,
    control,
  } = useForm<OldStudentUniversityForm>({
    defaultValues: initialValues,
  });

  const currentYear = new Date().getFullYear();

  const yearOptions = useMemo(() => {
    const years: string[] = [];
    for (let year = currentYear; year >= 1950; year -= 1) {
      years.push(year.toString());
    }
    return years;
  }, [currentYear]);

  const yearOptionsWithPresent = useMemo(
    () => ["Present", ...yearOptions],
    [yearOptions],
  );

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [open, initialValues, reset]);

  const handleSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["old-student-university-data"],
    });

    enqueueSnackbar(
      isEdit
        ? "University details updated successfully!"
        : "University details added successfully!",
      {
        variant: "success",
      },
    );

    setOpen(false);
    reset();
  };

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createOldStudentUniversity,
    onSuccess: () => {
      handleSuccess();
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to add university details.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: (variables: {
      id: number | string;
      data: OldStudentUniversityForm;
    }) => updateOldStudentUniversity(variables.id, variables.data),
    onSuccess: () => {
      handleSuccess();
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to update university details.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const onSubmit = (data: OldStudentUniversityForm) => {
    if (isEdit && defaultValues?.id) {
      updateMutation({ id: defaultValues.id, data });
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
          {isEdit
            ? "Edit Old Student University Details"
            : "Add Old Student University Details"}
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
            label="University Name"
            size="small"
            sx={{ flex: 1, margin: "0.5rem" }}
            error={!!errors.universityName}
            helperText={errors.universityName && "University name is required"}
            {...register("universityName", { required: true })}
          />

          <TextField
            label="Country"
            size="small"
            sx={{ flex: 1, margin: "0.5rem" }}
            error={!!errors.country}
            helperText={errors.country && "Country is required"}
            {...register("country", { required: true })}
          />

          <TextField
            label="City"
            size="small"
            sx={{ flex: 1, margin: "0.5rem" }}
            error={!!errors.city}
            helperText={errors.city && "City is required"}
            {...register("city", { required: true })}
          />

          <TextField
            label="Degree"
            size="small"
            sx={{ flex: 1, margin: "0.5rem" }}
            error={!!errors.degree}
            helperText={errors.degree && "Degree is required"}
            {...register("degree", { required: true })}
          />

          <TextField
            label="Faculty"
            size="small"
            sx={{ flex: 1, margin: "0.5rem" }}
            error={!!errors.faculty}
            helperText={errors.faculty && "Faculty is required"}
            {...register("faculty", { required: true })}
          />
          <Box sx={{ flex: 1, margin: "0.5rem" }}>
            <Controller
              name="yearOfAdmission"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
                  options={yearOptions}
                  value={field.value || ""}
                  onChange={(_, value) => field.onChange(value ?? "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Year Of Admission"
                      size="small"
                      error={!!errors.yearOfAdmission}
                      helperText={
                        errors.yearOfAdmission &&
                        "Year of admission is required"
                      }
                    />
                  )}
                />
              )}
            />
          </Box>
          <Box sx={{ flex: 1, margin: "0.5rem" }}>
            <Controller
              name="yearOfGraduation"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
                  options={yearOptionsWithPresent}
                  value={field.value || ""}
                  onChange={(_, value) => field.onChange(value ?? "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Year Of Graduation"
                      size="small"
                      error={!!errors.yearOfGraduation}
                      helperText={
                        errors.yearOfGraduation &&
                        "Year of graduation is required"
                      }
                    />
                  )}
                />
              )}
            />
          </Box>
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
          type="submit"
          variant="contained"
          sx={{ backgroundColor: "var(--pallet-blue)" }}
          size="medium"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isEdit ? "Update" : "Save"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrEditOldStudentsUniversityDialog;
