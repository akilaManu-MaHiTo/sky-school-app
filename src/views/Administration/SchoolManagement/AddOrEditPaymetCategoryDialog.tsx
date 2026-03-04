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
  createPaymentCategoryName,
  PaymentCategory,
  updateAcademicClass,
  updatePaymentCategoryName,
} from "../../../api/OrganizationSettings/academicGradeApi";
import useIsMobile from "../../../customHooks/useIsMobile";
import queryClient from "../../../state/queryClient";
import CloseIcon from "@mui/icons-material/Close";
import CustomButton from "../../../components/CustomButton";
import { ClassCategories } from "../../../api/OrganizationSettings/academicDetailsApi";

export const AddOrEditPaymentCategoryDialog = ({
  open,
  setOpen,
  defaultValues,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: PaymentCategory;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<PaymentCategory>({
    defaultValues: defaultValues ?? ({} as PaymentCategory),
  });
  const { isMobile } = useIsMobile();

  const isEdit = !!defaultValues?.id;

  const handleSubmitClass = (data: PaymentCategory) => {
    if (isEdit) {
      updateMutation(data);
    } else {
      createMutation(data);
    }
  };

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createPaymentCategoryName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-category"] });
      enqueueSnackbar("Payment Category Created Successfully!", {
        variant: "success",
      });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Payment Category Create Failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: updatePaymentCategoryName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-category"] });
      enqueueSnackbar("Payment Category Update Successfully!", {
        variant: "success",
      });
      reset();
      setOpen(false);
    },
    onError: (error: any) => {
      const message = error?.data?.message || "Payment Category Update Failed";
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
              {...register("categoryName", {
                required: { value: true, message: "Category Name is required" },
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: "Only letters are allowed",
                },
              })}
              id="categoryName"
              name="categoryName"
              type="text"
              label="Category Name"
              size="small"
              error={!!errors.categoryName}
              helperText={errors.categoryName ? errors.categoryName.message : ""}
              fullWidth
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
          disabled={isCreating || isUpdating}
          endIcon={
            isCreating || isUpdating ? <CircularProgress size={20} /> : null
          }
          onClick={handleSubmit(handleSubmitClass)}
        >
          {isEdit ? "Save Changes" : "Add New Category"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddOrEditPaymentCategoryDialog;
