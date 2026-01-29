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
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { grey } from "@mui/material/colors";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import CustomButton from "../../../../components/CustomButton";
import useIsMobile from "../../../../customHooks/useIsMobile";
import queryClient from "../../../../state/queryClient";
import DatePickerComponent from "../../../../components/DatePickerComponent";
import ApproveConfirmationModal from "../../../../components/ApproveConfirmationModal";
import {
  StudentServiceChargeForm,
  createStudentServiceCharge,
  updateStudentServiceCharge,
  chargeCategories,
} from "../../../../api/studentServiceChargesApi";
import { fetchStudentData } from "../../../../api/userApi";
import { getYearsData } from "../../../../api/OrganizationSettings/organizationSettingsApi";

interface AddOrEditStudentServiceChargesDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultValues?: any;
}

const AddOrEditStudentServiceChargesDialog = ({
  open,
  setOpen,
  defaultValues,
}: AddOrEditStudentServiceChargesDialogProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { isMobile } = useIsMobile();

  const [confirmationData, setConfirmationData] = useState<{
    apiResponse: any;
    formData: StudentServiceChargeForm;
  } | null>(null);

  const isEdit = Boolean(defaultValues && defaultValues.id);

  const initialValues: StudentServiceChargeForm = useMemo(() => {
    if (!defaultValues) {
      return {
        student: undefined as any,
        chargesCategory: "",
        amount: 0,
        dateCharged: new Date(),
        remarks: "",
      };
    }

    return {
      student: defaultValues.student ?? undefined,
      chargesCategory: defaultValues.chargesCategory ?? "",
      amount: Number(defaultValues.amount ?? 0),
      dateCharged: defaultValues.dateCharged
        ? new Date(defaultValues.dateCharged)
        : new Date(),
      remarks: defaultValues.remarks ?? "",
    };
  }, [defaultValues]);

  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
    register,
  } = useForm<StudentServiceChargeForm>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [open, initialValues, reset]);

  const { data: students, isFetching: isStudentsFetching } = useQuery({
    queryKey: ["student-users"],
    queryFn: fetchStudentData,
  });
  const { data: yearData, isFetching: isYearDataFetching } = useQuery({
    queryKey: ["academic-years"],
    queryFn: getYearsData,
  });

  const handleFinalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["student-service-charges"] });
    queryClient.invalidateQueries({
      queryKey: ["checking-student-service-charges"],
    });

    enqueueSnackbar(
      isEdit
        ? "Student service charge updated successfully!"
        : "Student service charge created successfully!",
      {
        variant: "success",
      },
    );
    setOpen(false);
    reset();
  };

  const { mutate: createMutation, isPending: isCreating } = useMutation({
    mutationFn: createStudentServiceCharge,
    onSuccess: (response: any, variables) => {
      if (response?.requiresConfirmation) {
        setConfirmationData({
          apiResponse: response,
          formData: variables as StudentServiceChargeForm,
        });
        return;
      }

      handleFinalSuccess();
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to create student service charge.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const { mutate: updateMutation, isPending: isUpdating } = useMutation({
    mutationFn: (variables: { id: string; data: StudentServiceChargeForm }) =>
      updateStudentServiceCharge(variables.id, variables.data),
    onSuccess: () => {
      handleFinalSuccess();
    },
    onError: (error: any) => {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to update student service charge.";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const onSubmit = (data: StudentServiceChargeForm) => {
    if (isEdit && defaultValues?.id) {
      updateMutation({ id: String(defaultValues.id), data });
    } else {
      createMutation(data);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  // User confirmed "Yes" - add charges for all listed children and the primary student
  const handleConfirmAdditionalCharges = async () => {
    if (!confirmationData) return;

    try {
      const { apiResponse, formData } = confirmationData;

      const pendingIds: number[] = Array.isArray(apiResponse.pendingStudentIds)
        ? apiResponse.pendingStudentIds
        : [];

      const primaryId = (formData.student as any)?.id;
      const studentIds = Array.from(
        new Set([...pendingIds, primaryId].filter((id) => id != null)),
      );

      await createStudentServiceCharge(formData, {
        confirmForChildren: true,
        studentIds,
      });

      setConfirmationData(null);
      handleFinalSuccess();
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to add charges for other students.";
      enqueueSnackbar(message, { variant: "error" });
      throw error;
    }
  };

  // User selected "No" - add charge only for the originally selected student
  const handleConfirmOnlyPrimaryStudent = async () => {
    if (!confirmationData) return;

    try {
      const { formData } = confirmationData;
      const primaryId = (formData.student as any)?.id;

      await createStudentServiceCharge(formData, {
        confirmForChildren: true,
        studentIds: primaryId ? [primaryId] : [],
      });

      setConfirmationData(null);
      handleFinalSuccess();
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        "Failed to create student service charge.";
      enqueueSnackbar(message, { variant: "error" });
      throw error;
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
        onSubmit: handleSubmit(onSubmit),
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
          {isEdit
            ? "Edit Student Service Charge"
            : "Add Student Service Charge"}
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
          <Controller
            name="student"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Autocomplete
                options={students || []}
                loading={isStudentsFetching}
                size="small"
                value={field.value || null}
                onChange={(_, value) => field.onChange(value)}
                getOptionLabel={(option: any) =>
                  option?.nameWithInitials || option?.name || ""
                }
                sx={{ flex: 1, margin: "0.5rem" }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Student"
                    required
                    error={!!errors.student}
                    helperText={errors.student && "Student is required"}
                  />
                )}
              />
            )}
          />

          <Controller
            name="yearForCharge"
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
                options={yearData ?? []}
                getOptionLabel={(option) => option.year}
                sx={{ flex: 1, margin: "0.5rem" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    error={!!errors.yearForCharge}
                    helperText={errors.yearForCharge && "Required"}
                    label="Select Year"
                    name="year"
                  />
                )}
              />
            )}
          />

          <Controller
            name="chargesCategory"
            control={control}
            {...register("chargesCategory", { required: true })}
            render={({ field }) => (
              <Autocomplete
                options={chargeCategories}
                size="small"
                value={field.value ?? null}
                onChange={(_, value) => field.onChange(value ?? "")}
                sx={{ flex: 1, margin: "0.5rem" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Charges Category"
                    required
                    error={!!errors.chargesCategory}
                    helperText={
                      errors.chargesCategory && "Charges category is required"
                    }
                  />
                )}
              />
            )}
          />

          <TextField
            label="Amount"
            type="number"
            size="small"
            sx={{ flex: 1, margin: "0.5rem" }}
            error={!!errors.amount}
            helperText={errors.amount && "Amount is required"}
            {...register("amount", { required: true, valueAsNumber: true })}
          />

          <Box sx={{ flex: 1, margin: "0.5rem" }}>
            <Controller
              name="dateCharged"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <DatePickerComponent
                  value={field.value as Date | null}
                  onChange={(date) => field.onChange(date)}
                  label="Date Charged"
                  error={errors.dateCharged ? "Date charged is required" : ""}
                />
              )}
            />
          </Box>

          <TextField
            label="Remarks"
            size="small"
            multiline
            minRows={3}
            sx={{ flex: 1, margin: "0.5rem" }}
            {...register("remarks")}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: "1rem" }}>
        <Button
          onClick={() => {
            setOpen(false);
            reset();
          }}
          sx={{ color: "var(--pallet-blue)" }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <CustomButton
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isEdit ? "Update" : "Save"}
        </CustomButton>
      </DialogActions>
      {confirmationData && (
        <ApproveConfirmationModal
          open={!!confirmationData}
          title="Confirm additional charges"
          content={
            <Box>
              <Typography gutterBottom>
                {confirmationData.apiResponse?.message}
              </Typography>
              {confirmationData.apiResponse?.children?.length ? (
                <Box
                  mt={2}
                  p={2}
                  borderRadius={1}
                  bgcolor="background.paper"
                  boxShadow={1}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Students
                  </Typography>
                  <List dense disablePadding>
                    {confirmationData.apiResponse.children.map((child: any) => (
                      <ListItem
                        key={child.id}
                        disableGutters
                        sx={{ py: 0.25 }}
                      >
                        <ListItemText
                          primary={child.nameWithInitials || child.userName}
                          secondary={`Admission No: ${child.employeeNumber}`}
                          primaryTypographyProps={{ variant: "body2" }}
                          secondaryTypographyProps={{
                            variant: "caption",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : null}
            </Box>
          }
          handleClose={() => setConfirmationData(null)}
          handleReject={handleConfirmOnlyPrimaryStudent}
          approveFunc={handleConfirmAdditionalCharges}
          customApproveButtonText="Yes, add for all"
        />
      )}
    </Dialog>
  );
};

export default AddOrEditStudentServiceChargesDialog;
