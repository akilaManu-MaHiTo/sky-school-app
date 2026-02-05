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
  getGradesData,
  getYearsData,
} from "../../../api/OrganizationSettings/organizationSettingsApi";
import { getClassesData } from "../../../api/OrganizationSettings/academicGradeApi";
import {
  addClassTeacher,
  ClassTeacher,
  fetchTeacherData,
  updateClassTeacher,
} from "../../../api/classTeacherApi";

const AddOrEditClassTeacher = ({
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
  } = useForm<ClassTeacher>({
    defaultValues: defaultValues,
  });

  const isEdit = Boolean(defaultValues?.id);

  const { data: gradeData } = useQuery({
    queryKey: ["academic-grades"],
    queryFn: getGradesData,
  });

  const { data: classData } = useQuery({
    queryKey: ["academic-classes"],
    queryFn: getClassesData,
  });
const { data: TeacherData, isFetching: isMyChildrenDataFetching } =
    useQuery({
      queryKey: ["teacher-users"],
      queryFn: fetchTeacherData,
    });

  const { data: yearData, isFetching: isYearDataFetching } = useQuery({
    queryKey: ["academic-years"],
    queryFn: getYearsData,
  });

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: addClassTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-teachers"] });
      enqueueSnackbar("Class Teacher Added successfully!", {
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
    mutationFn: updateClassTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["class-teachers"] });
      enqueueSnackbar("Class Teacher updated successfully!", {
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

  const handleSubmitDetails = (data: ClassTeacher) => {
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
          {isEdit ? "Edit Class Teacher" : "Add New Class Teacher"}
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
            name="year"
            control={control}
            defaultValue={defaultValues?.academicYear ?? ""}
            {...register("year", { required: true })}
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
                    error={!!errors.year}
                    helperText={errors.year && "Required"}
                    label="Select Academic Year"
                    name="year"
                  />
                )}
              />
            )}
          />
          <Controller
            name="grade"
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
                    error={!!errors.grade}
                    helperText={errors.grade && "Required"}
                    label="Select Grade"
                  />
                )}
              />
            )}
          />

          <Controller
            name="class"
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
                    error={!!errors.class}
                    helperText={errors.class && "Required"}
                    label="Select Class"
                  />
                )}
              />
            )}
          />

          <Controller
            name="teacher"
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
                options={TeacherData ?? []}
                getOptionLabel={(option) => option.nameWithInitials}
                sx={{ flex: 1, margin: "0.5rem" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={!!errors.teacher}
                    helperText={errors.teacher && "Required"}
                    label="Select Teacher"
                    name="myChild"
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

export default AddOrEditClassTeacher;
