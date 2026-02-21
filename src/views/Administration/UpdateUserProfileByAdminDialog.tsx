import {
  Autocomplete,
  Box,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { grey } from "@mui/material/colors";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import CustomButton from "../../components/CustomButton";
import useIsMobile from "../../customHooks/useIsMobile";
import {
  EmployeeType,
  updateUserProfileDetails,
  updateUserProfileDetailsByAdmin,
  User,
} from "../../api/userApi";
import queryClient from "../../state/queryClient";
import { genderOptions } from "../../constants/accidentConstants";
import DatePickerComponent from "../../components/DatePickerComponent";
import RichTextComponent from "../../components/RichTextComponent";

type DialogProps = {
  open: boolean;
  handleClose: () => void;
  defaultValues?: User;
};

export default function UpdateUserProfile({
  open,
  handleClose,
  defaultValues,
}: DialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { isTablet } = useIsMobile();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    register,
    setValue,
  } = useForm<User>({
    defaultValues: {
      ...defaultValues,
    },
  });

  const isAvailability = watch("availability");

  const { mutate: profileUpdateMutation, isPending } = useMutation({
    mutationFn: updateUserProfileDetailsByAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      enqueueSnackbar("Profile updated successfully!", { variant: "success" });
      handleClose();
    },
    onError: (error: any) => {
      const message =
        error?.data?.message || error?.message || "Profile update failed";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    } else {
      reset();
    }
  }, [defaultValues, reset]);

  const resetForm = () => {
    reset();
  };

  const onSubmitForm = (data: User) => {
    profileUpdateMutation({
      id: data.id!,
      employeeNumber: data.employeeNumber!,
      name: data.name!,
      email: data.email!,
      nameWithInitials: data.nameWithInitials!,
      gender: data.gender!,
      mobile: data.mobile,
      birthDate: data.birthDate!,
      address: data.address,
      employeeType: data.employeeType!,
    });
  };
  return (
    <Dialog
      open={open}
      onClose={() => {
        resetForm();
        handleClose();
      }}
      fullWidth
      maxWidth="md"
      fullScreen={isTablet}
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
          Update User Profile
        </Typography>
        <IconButton
          onClick={handleClose}
          edge="start"
          sx={{ color: "#024271" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack direction="column" gap={1}>
          {isAvailability && (
            <>
              <TextField
                id="employeeNumber"
                type="number"
                label="Admission/Staff Number"
                required
                error={!!errors.name}
                helperText={errors.name ? "Only Numbers are allowed" : ""}
                size="small"
                sx={{ flex: 1, margin: "0.5rem", width: "full" }}
                {...register("employeeNumber")}
              />
              <Controller
                control={control}
                name="employeeType"
                render={({ field }) => (
                  <Autocomplete
                    options={EmployeeType ? Object.values(EmployeeType) : []}
                    size="small"
                    sx={{ flex: 1, margin: "0.5rem" }}
                    value={field.value || null}
                    onChange={(_, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        error={!!errors.gender}
                        label="User Role"
                        name="employeeType"
                      />
                    )}
                  />
                )}
              />
              <TextField
                id="name"
                type="text"
                label="Full Name"
                required
                error={!!errors.name}
                helperText={
                  errors.name ? "Only letters and spaces are allowed" : ""
                }
                size="small"
                sx={{ flex: 1, margin: "0.5rem", width: "full" }}
                {...register("name", {
                  pattern: /^[A-Za-z\s]+$/,
                })}
              />

              <Box sx={{ display: "flex" }}>
                <TextField
                  id="nameWithInitials"
                  label="Name With Initials"
                  placeholder="J.H.Doe"
                  required
                  error={!!errors.nameWithInitials}
                  fullWidth
                  size="small"
                  sx={{ margin: "0.5rem" }}
                  {...register("nameWithInitials", {
                    minLength: {
                      value: 5,
                      message:
                        "Name With Initials must be at least 5 characters long",
                    },
                    pattern: {
                      value: /^[A-Za-z.]+$/,
                      message:
                        "Only letters and dots are allowed (no spaces or other characters)",
                    },
                  })}
                  helperText={
                    errors.nameWithInitials
                      ? errors.nameWithInitials.message
                      : ""
                  }
                />
              </Box>
              <TextField
                id="mobile"
                type="tel"
                label="Mobile Number"
                required
                error={!!errors.mobile}
                helperText={
                  typeof errors.mobile?.message === "string"
                    ? errors.mobile.message
                    : ""
                }
                size="small"
                sx={{ flex: 1, margin: "0.5rem", width: "full" }}
                {...register("mobile", {
                  minLength: {
                    value: 10,
                    message: "Mobile number must be at least 10 digits",
                  },
                  maxLength: {
                    value: 10,
                    message: "Mobile number cannot exceed 10 digits",
                  },
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Enter a valid mobile number (digits only)",
                  },
                })}
              />
              <Box sx={{ display: "flex" }}>
                <TextField
                  id="email"
                  label="Email Address"
                  placeholder="sample@company.com"
                  error={!!errors.email}
                  fullWidth
                  type="email"
                  size="small"
                  sx={{ flex: 1, margin: "0.5rem", width: "full" }}
                  {...register("email", {
                    minLength: {
                      value: 5,
                      message: "Email must be at least 5 characters long",
                    },
                    maxLength: {
                      value: 320,
                      message: "Email cannot exceed 320 characters long",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Invalid email format",
                    },
                  })}
                  helperText={errors.email ? errors.email.message : ""}
                />
              </Box>

              <Box>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Autocomplete
                      options={genderOptions}
                      size="small"
                      sx={{ flex: 1, margin: "0.5rem" }}
                      value={field.value || null}
                      onChange={(_, value) => field.onChange(value)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!errors.gender}
                          label="Gender"
                          name="gender"
                        />
                      )}
                    />
                  )}
                />
                <Box sx={{ mx: "0.5rem", mb: "2rem", mt: "1.5rem" }}>
                  <Controller
                    control={control}
                    {...register("birthDate")}
                    name={"birthDate"}
                    render={({ field }) => {
                      return (
                        <DatePickerComponent
                          onChange={(e) => field.onChange(e)}
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          label="Birthday"
                          error={errors?.birthDate ? "Required" : ""}
                          disableFuture={true}
                        />
                      );
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    margin: "0.5rem",
                    mt: "1.5rem",
                  }}
                >
                  <Controller
                    control={control}
                    name="address"
                    rules={{
                      pattern: {
                        value: /[A-Za-z]/,
                        message: "Address must contain at least one letter",
                      },
                    }}
                    render={({ field }) => (
                      <RichTextComponent
                        onChange={(value) => field.onChange(value)}
                        placeholder={"Address"}
                        markdown={field.value}
                      />
                    )}
                  />
                  {errors.address && (
                    <Box
                      sx={{ color: "red", fontSize: "0.75rem", mt: "0.25rem" }}
                    >
                      {errors.address.message}
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ padding: "1rem" }}>
        <Button
          onClick={() => {
            resetForm();
            handleClose();
          }}
          sx={{ color: "var(--pallet-blue)" }}
        >
          Cancel
        </Button>
        <CustomButton
          variant="contained"
          sx={{ backgroundColor: "var(--pallet-blue)" }}
          disabled={isPending}
          size="medium"
          onClick={handleSubmit(onSubmitForm)}
        >
          {defaultValues ? "Update Changes" : "Assign Role"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
