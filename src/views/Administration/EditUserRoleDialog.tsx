import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import {
  Autocomplete,
  Box,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import { grey } from "@mui/material/colors";
import { useEffect, useState } from "react";
import CustomButton from "../../components/CustomButton";
import useIsMobile from "../../customHooks/useIsMobile";
import {
  fetchAllAssigneeLevel,
  updateUserType,
  User,
  UserLevel,
  UserRole,
} from "../../api/userApi";
import { getAccessRolesList } from "../../api/accessManagementApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import queryClient from "../../state/queryClient";
import { useSnackbar } from "notistack";
import { fetchDepartmentData } from "../../api/departmentApi";
import { fetchJobPositionData } from "../../api/jobPositionApi";
import { fetchFactoryData } from "../../api/factoryApi";
import { fetchResponsibleSectionData } from "../../api/responsibleSetionApi";
import AutoCheckBox from "../../components/AutoCheckbox";
import SwitchButton from "../../components/SwitchButton";

type DialogProps = {
  open: boolean;
  handleClose: () => void;
  defaultValues?: User;
  onSubmit: (data: {
    id: number;
    userTypeId: number;
    availability: boolean;
  }) => void;
  isSubmitting?: boolean;
};

export default function EditUserRoleDialog({
  open,
  handleClose,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: DialogProps) {
  const { isTablet } = useIsMobile();
  const { data: roles, isFetching: isFetchingRoles } = useQuery<UserRole[]>({
    queryKey: ["access-roles"],
    queryFn: getAccessRolesList,
  });
  const isMobile = isTablet;

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<User>();

  const isAvailability = watch("availability");

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

  return (
    <Dialog
      open={open}
      onClose={() => {
        resetForm();
        handleClose();
      }}
      fullScreen={isMobile}
      fullWidth
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
          {defaultValues ? "Edit User Role" : "Add User Role"}
        </Typography>
        <IconButton
          aria-label="open drawer"
          onClick={handleClose}
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
        <Stack direction="column" gap={1}>
          <Box>
            <Controller
              control={control}
              name={"availability"}
              render={({ field }) => {
                return (
                  <SwitchButton
                    label="Is User Available"
                    onChange={field.onChange}
                    value={field.value}
                  />
                );
              }}
            />
          </Box>

          {isAvailability ? (
            <>
              <Box sx={{ flex: 1 }}>
                <Controller
                  name="userType"
                  control={control}
                  defaultValue={defaultValues?.userType}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      onChange={(_, data) => field.onChange(data)}
                      getOptionLabel={(option) => option?.userType || ""}
                      size="small"
                      options={roles || []}
                      sx={{ flex: 1, margin: "0.5rem" }}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.userType}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.userType}
                          label="Role"
                          name="userType"
                        />
                      )}
                    />
                  )}
                />
              </Box>
            </>
          ) : null}
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
          sx={{
            backgroundColor: "var(--pallet-blue)",
          }}
          disabled={isSubmitting}
          size="medium"
          onClick={handleSubmit((data) => {
            onSubmit({
              id: data.id,
              userTypeId: data.userType.id,
              availability: data.availability,
            });
          })}
        >
          {defaultValues ? "Update Changes" : "Assign Role"}
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
