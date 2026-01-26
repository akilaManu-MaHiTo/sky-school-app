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
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import useIsMobile from "../../customHooks/useIsMobile";
import CustomButton from "../../components/CustomButton";
import queryClient from "../../state/queryClient";
import {
  TeacherDetails,
  saveTeacherDetails,
  updateTeacherDetails,
} from "../../api/teacherDetailsApi";
import DatePickerComponent from "../../components/DatePickerComponent";

interface AddOrEditTeacherDetailsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  teacherId: number;
  defaultValues?: TeacherDetails;
}

const AddOrEditTeacherDetailsDialog = ({
  open,
  setOpen,
  teacherId,
  defaultValues,
}: AddOrEditTeacherDetailsDialogProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { isMobile } = useIsMobile();

  const {
    handleSubmit,
    formState: { errors },
    reset,
    register,
    control,
  } = useForm<TeacherDetails>({
    defaultValues: defaultValues ?? ({} as TeacherDetails),
    values: defaultValues ?? ({} as TeacherDetails),
  });

  const isEdit = Boolean(defaultValues);

  const { mutate: saveMutation, isPending } = useMutation({
    mutationFn: saveTeacherDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teacher-details", teacherId],
      });
      enqueueSnackbar("Teacher details saved successfully!", {
        variant: "success",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to save teacher details.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateTeacherDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teacher-details", teacherId],
      });
      enqueueSnackbar("Teacher details updated successfully!", {
        variant: "success",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to update teacher details.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const onSubmit = (data: TeacherDetails) => {
    const payload: TeacherDetails = {
      ...data,
    };
    if (defaultValues) {
      updateMutation(payload);
    } else {
      saveMutation(payload);
    }
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
          {isEdit ? "Edit Teacher Details" : "Add Teacher Details"}
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
          <Box sx={{ flex: 1, margin: "0.5rem", width: "full" }}>
            <Controller
              name="civilStatus"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
                  options={["Married", "Unmarried", "Divorced"]}
                  size="small"
                  value={field.value || null}
                  onChange={(_, value) => field.onChange(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Civil Status"
                      required
                      error={!!errors.civilStatus}
                      helperText={errors.civilStatus && "Required"}
                    />
                  )}
                />
              )}
            />
          </Box>

          <TextField
            id="teacherGrade"
            label="Teacher Grade"
            size="small"
            sx={{ flex: 1, margin: "0.5rem", width: "full" }}
            error={!!errors.teacherGrade}
            helperText={errors.teacherGrade && "Required"}
            {...register("teacherGrade")}
          />

          <TextField
            id="salaryType"
            label="Salary Type"
            size="small"
            sx={{ flex: 1, margin: "0.5rem", width: "full" }}
            error={!!errors.salaryType}
            helperText={errors.salaryType && "Required"}
            {...register("salaryType")}
          />

          <Box sx={{ flex: 1, margin: "0.5rem", width: "full" }}>
            <Controller
              name="teacherType"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={["Primary", "Secondary"]}
                  size="small"
                  value={field.value || null}
                  onChange={(_, value) => field.onChange(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Teacher Category"
                      required
                      error={!!errors.teacherType}
                      helperText={errors.teacherType && "Required"}
                    />
                  )}
                />
              )}
            />
          </Box>

          <TextField
            id="registerSubject"
            label="Register Subject"
            size="small"
            sx={{ flex: 1, margin: "0.5rem", width: "full" }}
            error={!!errors.registerSubject}
            helperText={errors.registerSubject?.message as string}
            inputProps={{ pattern: "[A-Za-z\\s]*" }}
            {...register("registerSubject", {
              pattern: {
                value: /^[A-Za-z\s]*$/,
                message: "Cant include numbers or special characters",
              },
            })}
          />

          <TextField
            id="registerPostNumber"
            label="Register Post Number"
            size="small"
            sx={{ flex: 1, margin: "0.5rem", width: "full" }}
            error={!!errors.registerPostNumber}
            helperText={errors.registerPostNumber && "Required"}
            {...register("registerPostNumber")}
          />

          <Box sx={{ mx: "0.5rem", mb: "0.5rem", mt: "0.5rem" }}>
            <Controller
              control={control}
              name={"registerPostDate"}
              render={({ field }) => {
                return (
                  <DatePickerComponent
                    onChange={(e) => field.onChange(e)}
                    value={field.value ? new Date(field.value) : undefined}
                    label="Register Post Date"
                    error={errors?.registerPostDate ? "Required" : ""}
                    disableFuture={true}
                  />
                );
              }}
            />
          </Box>

          <Box sx={{ mx: "0.5rem", mb: "0.5rem", mt: "0.5rem" }}>
            <Controller
              control={control}
              name={"dateOfFirstRegistration"}
              render={({ field }) => {
                return (
                  <DatePickerComponent
                    onChange={(e) => field.onChange(e)}
                    value={field.value ? new Date(field.value) : undefined}
                    label="Date Of First Registration"
                    error={errors?.dateOfFirstRegistration ? "Required" : ""}
                    disableFuture={true}
                  />
                );
              }}
            />
          </Box>

          <Box sx={{ mx: "0.5rem", mb: "0.5rem", mt: "0.5rem" }}>
            <Controller
              control={control}
              name={"dateOfRetirement"}
              render={({ field }) => {
                return (
                  <DatePickerComponent
                    onChange={(e) => field.onChange(e)}
                    value={field.value ? new Date(field.value) : undefined}
                    label="Date Of Retirement"
                    error={errors?.dateOfRetirement ? "Required" : ""}
                    disablePast={true}
                    
                  />
                );
              }}
            />
          </Box>

          <Box sx={{ mx: "0.5rem", mb: "0.5rem", mt: "0.5rem" }}>
            <Controller
              control={control}
              name={"dateOfGrade"}
              render={({ field }) => {
                return (
                  <DatePickerComponent
                    onChange={(e) => field.onChange(e)}
                    value={field.value ? new Date(field.value) : undefined}
                    label="Date Of Grade"
                    error={errors?.dateOfGrade ? "Required" : ""}
                    disableFuture={true}
                  />
                );
              }}
            />
          </Box>

          
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
          disabled={isPending || isUpdating}
          endIcon={
            isPending || isUpdating ? <CircularProgress size={20} /> : null
          }
          onClick={handleSubmit(onSubmit)}
        >
          {isEdit ? "Save Changes" : "Add Details"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrEditTeacherDetailsDialog;
