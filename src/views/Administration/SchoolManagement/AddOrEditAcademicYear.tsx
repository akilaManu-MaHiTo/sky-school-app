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
  Switch,
  Alert,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Controller, useForm } from "react-hook-form";
import {
  AcademicGrade,
  AcademicYear,
  createAcademicGrade,
  createAcademicYear,
  updateAcademicYear,
} from "../../../api/OrganizationSettings/academicGradeApi";
import useIsMobile from "../../../customHooks/useIsMobile";
import queryClient from "../../../state/queryClient";
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from "../../../components/CustomButton";
import SwitchButton from "../../../components/SwitchButton";

export const AddOrEditAcademicYear = ({
  open,
  setOpen,
  defaultValues,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: AcademicYear;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<AcademicYear>({
    defaultValues: defaultValues,
  });
  const { isMobile } = useIsMobile();
  console.log("defaultValues", defaultValues);

  const handleCreateNewYear = (data) => {
    if (defaultValues) {
      updateAcademicYearMutation(data);
    } else {
      createAcademicYearMutation(data);
    }
  };
  const {
    mutate: createAcademicYearMutation,
    isPending: isAcademicYearCreating,
  } = useMutation({
    mutationFn: createAcademicYear,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["academic-years"],
      });
      enqueueSnackbar("Academic Year Created Successfully!", {
        variant: "success",
      });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Academic Year Create Failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const {
    mutate: updateAcademicYearMutation,
    isPending: isUpdatingAcademicYearCreating,
  } = useMutation({
    mutationFn: updateAcademicYear,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["academic-years"],
      });
      enqueueSnackbar("Academic Year Update Successfully!", {
        variant: "success",
      });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Academic Year Update Failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const isFinishedYear = defaultValues?.status === "Finished" ? true : false;
  const year = new Date().getFullYear();

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
        style: {
          backgroundColor: grey[50],
        },
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
          {defaultValues
            ? `End ${defaultValues.year} Academic Year`
            : "Add New Academic Year"}
        </Typography>
        <IconButton
          aria-label="open drawer"
          onClick={() => setOpen(false)}
          edge="start"
          sx={{
            color: "#024271",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Alert severity={defaultValues ? "warning" : "info"} sx={{ mb: 2 }}>
          {defaultValues
            ? "Ending an academic year will prevent any further modifications to it."
            : "Creating a new academic year will set it as the current active year for the School."}
        </Alert>
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "column",
          }}
        >
          {defaultValues && (
            <Controller
              name="isFinishedYear"
              control={control}
              defaultValue={isFinishedYear}
              render={({ field }) => (
                <SwitchButton
                  value={field.value}
                  onChange={(val: boolean) => field.onChange(val)}
                  label={`End Academic Year ${defaultValues.year}`}
                  disabled={false}
                />
              )}
            />
          )}

          {!defaultValues && (
            <TextField
              {...register("year", {
                required: {
                  value: true,
                  message: "Year is required",
                },
                min: {
                  value: year,
                  message: `Year cannot be less than ${year}`,
                },
                minLength: {
                  value: 4,
                  message: "Year must be 4 digits",
                },
                maxLength: {
                  value: 4,
                  message: "Year must be 4 digits",
                }
              })}
              id="year"
              name="year"
              type="number"
              label="New Academic Year"
              size="small"
              error={!!errors.year}
              helperText={errors.year ? errors.year.message : ""}
              required
              fullWidth
              sx={{ margin: "0.5rem", flex: 1 }}
            />
          )}
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
          sx={{
            backgroundColor: "var(--pallet-blue)",
          }}
          size="medium"
          disabled={isAcademicYearCreating}
          endIcon={
            isAcademicYearCreating ? <CircularProgress size={20} /> : null
          }
          onClick={handleSubmit(handleCreateNewYear)}
        >
          {defaultValues ? "End This Year" : "Create Academic Year"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};
