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

function RegistrationForm() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up(990));
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
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
    },
  });

  const userPassword = watch("password");
  const userEmployeeType = watch("employeeType");

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
        <img src={companyLogo} alt="logo" height={"65em"} />
      </Box>
      <Box>
        <Typography variant={"body2"}>
          Create an account to access the School System
        </Typography>
      </Box>
      <form onSubmit={handleSubmit(onRegistrationSubmit)}>
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
              value: 6,
              message: "Mobile number must be at least 6 digits",
            },
            maxLength: {
              value: 10,
              message: "Mobile number cannot exceed 16 digits",
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

        <Controller
          control={control}
          name={"employeeType"}
          render={({ field }) => {
            return (
              <ToggleButtonGroup
                size="small"
                {...control}
                aria-label="Small sizes"
                color="primary"
                value={field.value}
                exclusive
                onChange={(e, value) => {
                  field.onChange(value);
                }}
              >
                <ToggleButton
                  value={EmployeeType.TEACHER}
                  key={EmployeeType.TEACHER}
                >
                  <Typography variant="caption" component="div">
                    {EmployeeType.TEACHER}
                  </Typography>
                </ToggleButton>
                <ToggleButton
                  value={EmployeeType.STUDENT}
                  key={EmployeeType.STUDENT}
                >
                  <Typography variant="caption" component="div">
                    {EmployeeType.STUDENT}
                  </Typography>
                </ToggleButton>
                <ToggleButton
                  value={EmployeeType.PARENT}
                  key={EmployeeType.PARENT}
                >
                  <Typography variant="caption" component="div">
                    {EmployeeType.PARENT}
                  </Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            );
          }}
        />

        {userEmployeeType === EmployeeType.TEACHER && (
          <TextField
            required
            id="employeeNumber"
            label="Staff Number"
            error={!!errors.employeeNumber}
            fullWidth
            size="small"
            sx={{ marginTop: "1rem" }}
            helperText={
              typeof errors.employeeNumber?.message === "string"
                ? errors.employeeNumber.message
                : ""
            }
            {...register("employeeNumber", {
              required: {
                value: true,
                message: "Staff Number is required",
              },
            })}
          />
        )}
        {userEmployeeType === EmployeeType.STUDENT && (
          <TextField
            required
            id="employeeNumber"
            label="Student Register Number"
            error={!!errors.employeeNumber}
            fullWidth
            size="small"
            sx={{ marginTop: "1rem" }}
            helperText={
              typeof errors.employeeNumber?.message === "string"
                ? errors.employeeNumber.message
                : ""
            }
            {...register("employeeNumber", {
              required: {
                value: true,
                message: "Student Register Number is required",
              },
            })}
          />
        )}

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
