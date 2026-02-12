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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { grey } from "@mui/material/colors";
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import CustomButton from "../../../components/CustomButton";
import useIsMobile from "../../../customHooks/useIsMobile";
import queryClient from "../../../state/queryClient";
import {
  type OldStudentOccupation,
  type OldStudentOccupationForm,
  createOldStudentOccupation,
  updateOldStudentOccupation,
} from "../../../api/oldStudentsApi";

interface AddOrEditOldStudentOccupationDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  studentId: number;
  defaultValues?: OldStudentOccupation | null;
}

const AddOrEditOldStudentOccupationDialog = ({
  open,
  setOpen,
  studentId,
  defaultValues,
}: AddOrEditOldStudentOccupationDialogProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { isMobile } = useIsMobile();

  const isEdit = Boolean(defaultValues && defaultValues.id);

  const initialValues: OldStudentOccupationForm = useMemo(() => {
    if (defaultValues) {
      return {
        studentId: defaultValues.studentId,
        companyName: defaultValues.companyName ?? "",
        occupation: defaultValues.occupation ?? "",
        description: defaultValues.description ?? "",
        dateOfRegistration: defaultValues.dateOfRegistration ?? "",
        country: defaultValues.country ?? "",
        city: defaultValues.city ?? "",
      };
    }

    return {
      studentId,
      companyName: "",
      occupation: "",
      description: "",
      dateOfRegistration: "",
      country: "",
      city: "",
    };
  }, [defaultValues, studentId]);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    register,
  } = useForm<OldStudentOccupationForm>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [open, initialValues, reset]);

  const handleSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ["old-student-occupation-data"],
    });

    enqueueSnackbar(
      isEdit
        ? "Occupation details updated successfully!"
        : "Occupation details added successfully!",
      {
        variant: "success",
      },
    );

    setOpen(false);
    reset();
  };

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createOldStudentOccupation,
    onSuccess: () => {
      handleSuccess();
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to add occupation details.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: (variables: {
      id: number | string;
      data: OldStudentOccupationForm;
    }) => updateOldStudentOccupation(variables.id, variables.data),
    onSuccess: () => {
      handleSuccess();
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to update occupation details.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const onSubmit = (data: OldStudentOccupationForm) => {
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
            ? "Edit Old Student Occupation Details"
            : "Add Old Student Occupation Details"}
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
            label="Company Name"
            size="small"
            sx={{ flex: 1, margin: "0.5rem" }}
            error={!!errors.companyName}
            helperText={errors.companyName && "Company name is required"}
            {...register("companyName", { required: true })}
          />

          <TextField
            label="Occupation"
            size="small"
            sx={{ flex: 1, margin: "0.5rem" }}
            error={!!errors.occupation}
            helperText={errors.occupation && "Occupation is required"}
            {...register("occupation", { required: true })}
          />

          <TextField
            label="Description"
            size="small"
            sx={{ flex: 1, margin: "0.5rem" }}
            multiline
            minRows={2}
            {...register("description")}
          />

          <TextField
            label="Date Of Registration"
            size="small"
            sx={{ flex: 1, margin: "0.5rem" }}
            error={!!errors.dateOfRegistration}
            helperText={
              errors.dateOfRegistration && "Date of registration is required"
            }
            {...register("dateOfRegistration", { required: true })}
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

export default AddOrEditOldStudentOccupationDialog;
