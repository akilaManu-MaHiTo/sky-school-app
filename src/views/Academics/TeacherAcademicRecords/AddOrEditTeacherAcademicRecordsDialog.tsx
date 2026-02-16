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
import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { TimePicker } from "@mui/x-date-pickers";
import CustomButton from "../../../components/CustomButton";
import useIsMobile from "../../../customHooks/useIsMobile";
import queryClient from "../../../state/queryClient";
import {
  createTeacherAcademicWork,
  TeacherAcademicWork,
  updateTeacherAcademicWork,
} from "../../../api/teacherAcademicWorksApi";
import { getAllSubjectData } from "../../../api/OrganizationSettings/organizationSettingsApi";
import { fetchTeacherData } from "../../../api/classTeacherApi";
import DatePickerComponent from "../../../components/DatePickerComponent";

interface AddOrEditTeacherAcademicRecordsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: TeacherAcademicWork | null;
}

const AddOrEditTeacherAcademicRecordsDialog = ({
  open,
  setOpen,
  defaultValues,
}: AddOrEditTeacherAcademicRecordsDialogProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { isMobile } = useIsMobile();

  const isEdit = Boolean(defaultValues && defaultValues.id);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    register,
  } = useForm<TeacherAcademicWork>();

  useEffect(() => {
    if (!open) {
      return;
    }

    if (defaultValues) {
      const normalizedValues: TeacherAcademicWork = {
        ...defaultValues,
        date: defaultValues.date
          ? new Date(defaultValues.date as unknown as string)
          : null,
        time: defaultValues.time
          ? new Date(defaultValues.time as unknown as string)
          : null,
      };

      reset(normalizedValues);
      return;
    }

    reset({} as TeacherAcademicWork);
  }, [defaultValues, open, reset]);

  const { data: subjectData } = useQuery({
    queryKey: ["subject-data"],
    queryFn: getAllSubjectData,
  });

  const { data: teacherData } = useQuery({
    queryKey: ["teacher-users"],
    queryFn: fetchTeacherData,
  });


  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createTeacherAcademicWork,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teacher-academic-works-by-date"],
      });
      enqueueSnackbar("Academic work created successfully", {
        variant: "success",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.data?.message || error?.message || "Failed to create";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateTeacherAcademicWork,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teacher-academic-works-by-date"],
      });
      enqueueSnackbar("Academic work updated successfully", {
        variant: "success",
      });
      setOpen(false);
    },
    onError: (error: any) => {
      const message =
        error?.data?.message || error?.message || "Failed to update";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const onSubmit = (data: TeacherAcademicWork) => {
    if (isEdit) {
      updateMutation(data);
      return;
    }

    createMutation(data);
  };

  const isSubmitting = isCreating || isUpdating;

  const disableWeekends = (date: Date) => {
    const day = (date as unknown as { getDay?: () => number; day?: () => number })
      .getDay?.() ??
      (date as unknown as { day?: () => number }).day?.();

    return day === 0 || day === 6;
  };

  const minTime = new Date();
  minTime.setHours(7, 30, 0, 0);

  const maxTime = new Date();
  maxTime.setHours(14, 30, 0, 0);

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
          {isEdit ? "Edit Teacher Academic Work" : "Add Teacher Academic Work"}
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "column",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
              <Controller
                name="teacher"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    value={field.value ?? null}
                    onChange={(_event, newValue) => field.onChange(newValue)}
                    size="small"
                    options={teacherData ?? []}
                    getOptionLabel={(option) =>
                      option.nameWithInitials ?? option.name ?? option.userName
                    }
                    isOptionEqualToValue={(option, value) =>
                      option?.id === value?.id
                    }
                    sx={{ flex: 1 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        error={!!errors.teacher}
                        helperText={errors.teacher && "Required"}
                        label="Teacher"
                        fullWidth
                      />
                    )}
                  />
                )}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
              <Controller
                name="subject"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    value={field.value ?? null}
                    onChange={(_event, newValue) => field.onChange(newValue)}
                    size="small"
                    options={subjectData ?? []}
                    getOptionLabel={(option) =>
                      `${option.subjectName} - ${option.subjectMedium} Medium`
                    }
                    isOptionEqualToValue={(option, value) =>
                      option?.id === value?.id
                    }
                    sx={{ flex: 1 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        error={!!errors.subject}
                        helperText={errors.subject && "Required"}
                        label="Subject"
                        fullWidth
                      />
                    )}
                  />
                )}
              />
            </Box>
          </Box>

          <Box sx={{ margin: "0.5rem" }}>
            <TextField
              label="Title"
              size="small"
              fullWidth
              error={!!errors.title}
              helperText={errors.title && "Title is required"}
              {...register("title", { required: true })}
            />
          </Box>

          <Box sx={{ margin: "0.5rem" }}>
            <TextField
              label="Academic Work"
              size="small"
              fullWidth
              multiline
              minRows={3}
              error={!!errors.academicWork}
              helperText={errors.academicWork && "Academic work is required"}
              {...register("academicWork", { required: true })}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "column",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
              <Controller
                control={control}
                name="date"
                rules={{ required: true }}
                render={({ field }) => (
                  <DatePickerComponent
                    onChange={(value) => field.onChange(value)}
                    value={field.value ?? null}
                    label="Date"
                    error={errors.date ? "Required" : ""}
                    shouldDisableDate={disableWeekends}
                  />
                )}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 220, margin: "0.5rem" }}>
              <Controller
                name="time"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TimePicker
                    label="Time"
                    value={field.value ?? null}
                    onChange={(value) => field.onChange(value)}
                    minTime={minTime}
                    maxTime={maxTime}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        error: !!errors.time,
                        helperText: errors.time && "Time is required",
                      },
                    }}
                  />
                )}
              />
            </Box>
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
          disabled={isSubmitting}
          endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          onClick={handleSubmit(onSubmit)}
          type="submit"
        >
          {isEdit ? "Save Changes" : "Add Academic Work"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrEditTeacherAcademicRecordsDialog;
