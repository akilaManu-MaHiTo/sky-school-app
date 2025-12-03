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
  AcademicSubject,
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

export const AddOrEditSubjects = ({
  open,
  setOpen,
  defaultValues,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: AcademicSubject;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<AcademicSubject>({
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
    isPending: isUpdatingAcademicYear,
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
          {defaultValues ? `Update Subject` : "Add New Subject"}
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
          <TextField
            {...register("subjectCode")}
            id="subjectCode"
            name="subjectCode"
            label="Subject Code"
            size="small"
            error={!!errors.subjectCode}
            fullWidth
            sx={{ margin: "0.5rem", flex: 1 }}
          />
          <TextField
            {...register("subjectName", {
              required: {
                value: true,
                message: "Subject Name is required",
              },
            })}
            id="subjectName"
            name="subjectName"
            label="Subject Name"
            size="small"
            error={!!errors.subjectName}
            helperText={errors.subjectName ? errors.subjectName.message : ""}
            fullWidth
            sx={{ margin: "0.5rem", flex: 1 }}
          />
          <Controller
            name="isBasketSubject"
            control={control}
            defaultValue={defaultValues?.isBasketSubject || false}
            render={({ field }) => (
              <SwitchButton
                value={field.value}
                onChange={(val: boolean) => field.onChange(val)}
                label={"Is Basket Subject"}
                disabled={false}
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
