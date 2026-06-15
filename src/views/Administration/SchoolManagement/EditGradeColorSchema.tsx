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
  GradeColor,
  updateAcademicSubject,
  updateAcademicYear,
} from "../../../api/OrganizationSettings/academicGradeApi";
import useIsMobile from "../../../customHooks/useIsMobile";
import queryClient from "../../../state/queryClient";
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from "../../../components/CustomButton";
import SwitchButton from "../../../components/SwitchButton";
import {
  AcademicMedium,
  BasketGroup,
} from "../../../api/OrganizationSettings/academicDetailsApi";
import {
  Slider,
  Sketch,
  Material,
  Colorful,
  Compact,
  Circle,
  Wheel,
  Block,
  Github,
  Chrome,
} from "@uiw/react-color";
export const EditGradeColorDialog = ({
  open,
  setOpen,
  defaultValues,
  query,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: GradeColor;
  query?: string;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<GradeColor>({
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
          {defaultValues ? `Update Marking Grade Color` : "Add New Subject"}
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
          <Box m={"0.82rem"}>
            <Typography variant="inherit" color="#00000098">
              Grade Name
            </Typography>
            <Typography variant="h6" color="#000000de">
              {defaultValues?.gradeName}
            </Typography>
          </Box>
          <Box m={"0.82rem"}>
            <Typography variant="inherit" color="#00000098">
              Marking Range
            </Typography>
            <Typography variant="h6" color="#000000de">
              {defaultValues?.marksRange}
            </Typography>
          </Box>

          <Box
            border={`1px solid ${grey[400]}`}
            borderRadius={"4px"}
            margin={"0.5rem"}
          >
            <Box m={"0.82rem"}>
              <Typography variant="inherit" color="#00000098">
                Marking Grade Color
              </Typography>
            </Box>
            <Controller
              name="color"
              control={control}
              defaultValue={defaultValues?.color ?? "#fff"}
              render={({ field }) => (
                <Sketch
                  style={{ marginLeft: "0.82rem", marginBottom: "1.5rem" }}
                  color={field.value || "#fff"}
                  onChange={(newShade) => field.onChange(newShade.hex)}
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
