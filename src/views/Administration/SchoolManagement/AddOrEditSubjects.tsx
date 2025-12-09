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
  Autocomplete,
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
  createAcademicSubject,
  createAcademicYear,
  updateAcademicSubject,
  updateAcademicYear,
} from "../../../api/OrganizationSettings/academicGradeApi";
import useIsMobile from "../../../customHooks/useIsMobile";
import queryClient from "../../../state/queryClient";
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from "../../../components/CustomButton";
import SwitchButton from "../../../components/SwitchButton";
import { AcademicMedium } from "../../../api/OrganizationSettings/academicDetailsApi";

export const AddOrEditSubjects = ({
  open,
  setOpen,
  defaultValues,
  query,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: AcademicSubject;
  query?: string;
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
      updateAcademicSubjectMutation(data);
    } else {
      createAcademicSubjectMutation(data);
    }
  };
  const {
    mutate: createAcademicSubjectMutation,
    isPending: isAcademicSubjectCreating,
  } = useMutation({
    mutationFn: createAcademicSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subject-data", query],
      });
      enqueueSnackbar("Academic Subject Created Successfully!", {
        variant: "success",
      });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Academic Subject Create Failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const {
    mutate: updateAcademicSubjectMutation,
    isPending: isUpdatingAcademicSubject,
  } = useMutation({
    mutationFn: updateAcademicSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subject-data"],
      });
      enqueueSnackbar("Academic Subject Update Successfully!", {
        variant: "success",
      });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Academic Subject Update Failed";
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
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "column",
          }}
        >
          <Box sx={{ marginRight: "1rem" }}>
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
          </Box>
          <Box sx={{ marginRight: "1rem" }}>
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
          </Box>
          <Controller
            name="subjectMedium"
            control={control}
            defaultValue={defaultValues?.subjectMedium ?? ""}
            {...register("subjectMedium", { required: true })}
            render={({ field }) => (
              <Autocomplete
                {...field}
                onChange={(event, newValue) => field.onChange(newValue)}
                size="small"
                options={
                  AcademicMedium?.length
                    ? AcademicMedium.map((medium) => medium.academicMedium)
                    : []
                }
                sx={{ flex: 1, margin: "0.5rem" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={!!errors.subjectMedium}
                    helperText={errors.subjectMedium && "Required"}
                    label="Subject Medium"
                    name="subjectMedium"
                  />
                )}
              />
            )}
          />
          <Box sx={{ marginLeft: "0.5rem" }}>
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
          disabled={isAcademicSubjectCreating || isUpdatingAcademicSubject}
          endIcon={
            isUpdatingAcademicSubject ||
            (isAcademicSubjectCreating && <CircularProgress size={20} />)
          }
          onClick={handleSubmit(handleCreateNewYear)}
        >
          {defaultValues ? "Update Subject" : "Create Subject"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};
