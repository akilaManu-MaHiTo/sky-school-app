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
import { grey } from "@mui/material/colors";
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import {
  AcademicGrade,
  createAcademicGrade,
} from "../../../api/OrganizationSettings/academicGradeApi";
import useIsMobile from "../../../customHooks/useIsMobile";
import queryClient from "../../../state/queryClient";
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from "../../../components/CustomButton";
import { useEffect } from "react";

export const AddOrEditAcademicGrade = ({
  open,
  setOpen,
  defaultValues,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: AcademicGrade;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
    reset,
  } = useForm<AcademicGrade>({
    defaultValues: defaultValues,
  });
  const { isMobile } = useIsMobile();
  console.log("defaultValues", defaultValues);

  const handleCreateNewGrade = (data) => {
    createAcademicGradeMutation(data);
  };
  const {
    mutate: createAcademicGradeMutation,
    isPending: isAcademicGradeCreating,
  } = useMutation({
    mutationFn: createAcademicGrade,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["academic-grades"],
      });
      enqueueSnackbar("Academic Grade Created Successfully!", {
        variant: "success",
      });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Academic Grade Create Failed";
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
          Add New Academic Grade
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
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <TextField
            {...register("grade", {
              required: {
                value: true,
                message: "Grade is required",
              },
              min: { value: 1, message: "Grade must be at least 1" },
              max: { value: 13, message: "Grade cannot be more than 13" },
            })}
            id="grade"
            name="grade"
            type="number"
            label="New Grade"
            size="small"
            error={!!errors.grade}
            helperText={errors.grade ? errors.grade.message : ""}
            fullWidth
            sx={{ margin: "0.5rem", flex: 1 }}
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
          disabled={isAcademicGradeCreating}
          endIcon={
            isAcademicGradeCreating ? <CircularProgress size={20} /> : null
          }
          onClick={handleSubmit(handleCreateNewGrade)}
        >
          Add New Grade
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};
