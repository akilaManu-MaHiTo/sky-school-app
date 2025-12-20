import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton,
  styled,
} from "@mui/material";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import CustomButton from "../../components/CustomButton";
import LoginIcon from "@mui/icons-material/Login";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmployeeType, registerUser } from "../../api/userApi";
import companyLogo from "../../assets/company-logo1.jpg";
import { getOrganization } from "../../api/OrganizationSettings/organizationSettingsApi";
import { hasSignedUrl } from "../Administration/SchoolManagement/schoolUtils";
import RoleButton from "../../components/RoleButton";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SchoolIcon from "@mui/icons-material/School";
import GroupIcon from "@mui/icons-material/Group";

function RegistrationForm() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up(990));
  const [selectedRole, setSelectedRole] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    clearErrors,
    control,
  } = useForm({
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
      mobileNumber: null,
      name: "",
      userName: "",
      confirmPassword: "",
      employeeType: "",
      employeeNumber: "",
      nameWithInitials: "",
    },
  });
  const { data: organizationData } = useQuery({
    queryKey: ["organization"],
    queryFn: getOrganization,
  });
  const logo = Array.isArray(organizationData?.logoUrl)
    ? organizationData?.logoUrl[0]
    : organizationData?.logoUrl;

  const userPassword = watch("password");

  const { mutate: registrationMutation, isPending } = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      enqueueSnackbar("Account Created Successfully!", { variant: "success" });
      navigate("/home");
    },
    onError: (error: any) => {
      console.log(error);
      enqueueSnackbar(error?.data?.message ?? `Registration Failed`, {
        variant: "error",
      });
    },
  });

  const onRegistrationSubmit = (data) => {
    data.employeeType = selectedRole;
    registrationMutation(data);
  };

  return (
    <Stack
      spacing={2}
      sx={{
        justifyContent: "center",
        margin: "2.5rem",
        marginBottom: isMdUp ? "2.5rem" : "22vh",
      }}
    >
      <Box>
        {hasSignedUrl(logo) && (
          <Box
            sx={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <img
              src={logo.signedUrl}
              alt="Organization Logo"
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                objectFit: "fill",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              }}
            />
          </Box>
        )}
      </Box>
      <Box>
        <Typography variant={"body2"}>
          Create an account to access the School System
        </Typography>
      </Box>
      <form onSubmit={handleSubmit(onRegistrationSubmit)}>
        <Controller
          control={control}
          name={"employeeType"}
          render={({ field }) => {
            return (
              <Box display="flex" gap={2}>
                {" "}
                <RoleButton
                  value={EmployeeType.TEACHER}
                  selected={selectedRole === EmployeeType.TEACHER}
                  onClick={setSelectedRole}
                  key={EmployeeType.TEACHER}
                >
                  <AdminPanelSettingsIcon />
                  <Typography variant="caption" component="div">
                    {EmployeeType.TEACHER}
                  </Typography>
                </RoleButton>
                <RoleButton
                  value={EmployeeType.STUDENT}
                  selected={selectedRole === EmployeeType.STUDENT}
                  onClick={setSelectedRole}
                  key={EmployeeType.STUDENT}
                >
                  <SchoolIcon />
                  <Typography variant="caption" component="div">
                    {EmployeeType.STUDENT}
                  </Typography>
                </RoleButton>
                <RoleButton
                  value={EmployeeType.PARENT}
                  selected={selectedRole === EmployeeType.PARENT}
                  onClick={setSelectedRole}
                  key={EmployeeType.PARENT}
                >
                  <GroupIcon />
                  <Typography variant="caption" component="div">
                    {EmployeeType.PARENT}
                  </Typography>
                </RoleButton>
              </Box>
            );
          }}
        />

        {selectedRole === EmployeeType.TEACHER && (
          <TextField
            required
            id="employeeNumber"
            label="Staff Number"
            error={!!errors.employeeNumber}
            fullWidth
            size="small"
            sx={{ marginTop: "1rem" }}
            helperText={errors.employeeNumber?.message || ""}
            {...register("employeeNumber", {
              required: "Register Number is required",
            })}
            onChange={(e) => {
              clearErrors("employeeNumber");
              register("employeeNumber").onChange(e);
            }}
          />
        )}
        {selectedRole === EmployeeType.STUDENT && (
          <TextField
            required
            id="employeeNumber"
            label="Student Admission Number"
            error={!!errors.employeeNumber}
            fullWidth
            size="small"
            sx={{ marginTop: "1rem" }}
            helperText={errors.employeeNumber?.message || ""}
            {...register("employeeNumber", {
              required: "Student Register Number is required",
              minLength: {
                value: 5,
                message: "Register Number cannot be less than 5",
              },
            })}
            onChange={(e) => {
              clearErrors("employeeNumber");
              register("employeeNumber").onChange(e);
            }}
          />
        )}

        <TextField
          required
          id="userName"
          label="User Name"
          error={!!errors.userName}
          fullWidth
          size="small"
          sx={{ marginTop: "1rem" }}
          helperText={errors.userName ? errors.userName.message : ""}
          {...register("userName", {
            required: {
              value: true,
              message: "Required",
            },
          })}
        />

        <TextField
          id="nameWithInitials"
          label="Name With Initials"
          placeholder="J.H.Doe"
          required
          error={!!errors.nameWithInitials}
          fullWidth
          size="small"
          sx={{ marginTop: "1rem" }}
          {...register("nameWithInitials", {
            minLength: {
              value: 5,
              message: "Name With Initials must be at least 5 characters long",
            },
            pattern: {
              value: /^[A-Za-z.]+$/,
              message:
                "Only letters and dots are allowed (no spaces or other characters)",
            },
          })}
          helperText={
            errors.nameWithInitials ? errors.nameWithInitials.message : ""
          }
        />

        <TextField
          id="email"
          label="Email Address"
          placeholder="sample@company.com"
          error={!!errors.email}
          fullWidth
          type="email"
          size="small"
          sx={{ marginTop: "1rem" }}
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

        <TextField
          required
          id="mobileNumber"
          label="Mobile Number"
          type="tel"
          error={!!errors.mobileNumber}
          fullWidth
          size="small"
          sx={{ marginTop: "1rem" }}
          helperText={
            typeof errors.mobileNumber?.message === "string"
              ? errors.mobileNumber.message
              : ""
          }
          {...register("mobileNumber", {
            required: {
              value: true,
              message: "Mobile number is required",
            },
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

        <TextField
          required
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          size="small"
          fullWidth
          sx={{ marginTop: "1rem" }}
          error={!!errors.password}
          {...register("password", {
            required: {
              value: true,
              message: "Password is required",
            },
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters long",
            },
            maxLength: {
              value: 128,
              message: "Password cannot exceed 128 characters long",
            },
          })}
          helperText={errors.password ? errors.password.message : ""}
        />

        <TextField
          required
          id="confirmPassword"
          label="Confirm Password"
          type={"password"}
          size="small"
          fullWidth
          helperText={
            errors.confirmPassword ? errors.confirmPassword.message : ""
          }
          sx={{ marginTop: "1rem" }}
          error={!!errors.confirmPassword}
          {...register("confirmPassword", {
            required: {
              value: true,
              message: "Confirm Password is required",
            },
            validate: {
              matchesPreviousPassword: (value) =>
                value === userPassword || "Passwords do not match",
            },
          })}
        />

        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                size="small"
              />
            }
            label="Show Password"
            sx={{
              "& .MuiTypography-body1": {
                fontSize: "0.85rem",
              },
              marginTop: "1rem",
              marginBottom: "1rem",
            }}
          />
        </Box>

        <Box
          sx={{
            marginTop: "1.6rem",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <CustomButton
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "var(--pallet-blue)",
            }}
            size="medium"
            disabled={isPending}
            startIcon={
              isPending ? (
                <CircularProgress color="inherit" size={"1rem"} />
              ) : (
                <LoginIcon />
              )
            }
          >
            Create Account
          </CustomButton>
          <CustomButton
            variant="text"
            sx={{
              color: "var(--pallet-orange)",
            }}
            size="medium"
            onClick={() => navigate("/")}
          >
            Login to an existing account
          </CustomButton>
        </Box>
      </form>
    </Stack>
  );
}

export default RegistrationForm;
