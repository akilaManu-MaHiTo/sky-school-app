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
import { grey } from "@mui/material/colors";
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Controller, useForm } from "react-hook-form";
import {
  AcademicClass,
  createAcademicClass,
  updateAcademicClass,
} from "../../../api/OrganizationSettings/academicGradeApi";
import useIsMobile from "../../../customHooks/useIsMobile";
import queryClient from "../../../state/queryClient";
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from "../../../components/CustomButton";
import { ClassCategories } from "../../../api/OrganizationSettings/academicDetailsApi";

export const AddOrEditAcademicClass = ({
  open,
  setOpen,
  defaultValues,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: AcademicClass | null;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<AcademicClass>({
    defaultValues: defaultValues ?? ({} as AcademicClass),
  });
  const { isMobile } = useIsMobile();

  const isEdit = !!defaultValues?.id;

  const handleSubmitClass = (data: AcademicClass) => {
    if (isEdit) {
      updateMutation(data);
    } else {
      createMutation(data);
    }
  };

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createAcademicClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-classes"] });
      enqueueSnackbar("Academic Class Created Successfully!", {
        variant: "success",
      });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Academic Class Create Failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateAcademicClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-classes"] });
      enqueueSnackbar("Academic Class Updated Successfully!", {
        variant: "success",
      });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Academic Class Update Failed";
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
          {isEdit ? "Edit Academic Class" : "Add New Academic Class"}
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
          <Box sx={{ margin: "0.5rem", flex: 1 }}>
            <TextField
              {...register("className", {
                required: { value: true, message: "Class Name is required" },
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: "Only letters are allowed",
                },
              })}
              id="className"
              name="className"
              type="text"
              label="Class Name"
              size="small"
              error={!!errors.className}
              helperText={errors.className ? errors.className.message : ""}
              fullWidth
            />
          </Box>

          <Controller
            name="academicMedium"
            control={control}
            defaultValue={defaultValues?.classCategory ?? ""}
            {...register("classCategory", { required: true })}
            render={({ field }) => (
              <Autocomplete
                {...field}
                onChange={(event, newValue) => field.onChange(newValue)}
                size="small"
                options={ClassCategories.map((medium) => medium.academicMedium)}
                sx={{ flex: 1, margin: "0.5rem" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={!!errors.classCategory}
                    helperText={errors.classCategory && "Required"}
                    label="Class Category"
                    name="classCategory"
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
          onClick={handleSubmit(handleSubmitClass)}
        >
          {isEdit ? "Save Changes" : "Add New Class"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrEditAcademicClass;
